import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  username: string;
  email: string | null;
  xp: number;
  level: number;
  streak: number;
  is_premium: boolean;
  premium_until: string | null;
  last_username_change: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUpWithUsername: (username: string) => Promise<{ error: any }>;
  signIn: (username: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateXP: (amount: number) => Promise<void>;
  updateEmail: (email: string) => Promise<{ error: any }>;
  hasRealEmail: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Generate a random string for auto-generated emails/passwords
const generateRandomString = (length: number): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data;
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  const updateXP = async (amount: number) => {
    if (!user || !profile) return;
    
    const isPremium = profile.is_premium;
    const xpToAdd = isPremium ? Math.floor(amount * 1.15) : amount;
    const newXP = profile.xp + xpToAdd;
    const newLevel = calculateLevel(newXP);
    
    const { error } = await supabase
      .from("profiles")
      .update({ 
        xp: newXP,
        level: newLevel
      })
      .eq("id", user.id);
    
    if (!error) {
      await refreshProfile();
    }
  };

  const calculateLevel = (xp: number): number => {
    if (xp < 100) return 1;
    if (xp < 250) return 2;
    if (xp < 500) return 3;
    if (xp < 1000) return 4;
    if (xp < 2000) return 5;
    if (xp < 4000) return 6;
    if (xp < 8000) return 7;
    if (xp < 16000) return 8;
    if (xp < 32000) return 9;
    return 10;
  };

  // Check if user has a real email (not auto-generated)
  const hasRealEmail = (): boolean => {
    if (!profile?.email) return false;
    return !profile.email.endsWith('@shpoko.local');
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id).then(setProfile);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then((profileData) => {
          setProfile(profileData);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign up with just username - auto-generate email and password
  const signUpWithUsername = async (username: string) => {
    const randomId = generateRandomString(12);
    const autoEmail = `${username.toLowerCase().replace(/\s/g, '_')}_${randomId}@shpoko.local`;
    const autoPassword = generateRandomString(24);
    
    // Store the password in localStorage so user can log back in
    localStorage.setItem(`shpoko_user_${username.toLowerCase()}`, JSON.stringify({
      email: autoEmail,
      password: autoPassword,
    }));
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email: autoEmail,
      password: autoPassword,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username,
        },
      },
    });
    return { error };
  };

  // Sign in with username - look up stored credentials
  const signIn = async (username: string) => {
    const storedData = localStorage.getItem(`shpoko_user_${username.toLowerCase()}`);
    
    if (!storedData) {
      return { error: { message: "Username not found" } };
    }
    
    const { email, password } = JSON.parse(storedData);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  // Update to a real email (for premium)
  const updateEmail = async (newEmail: string) => {
    if (!user) return { error: { message: "Not logged in" } };
    
    // Update the auth email
    const { error: authError } = await supabase.auth.updateUser({
      email: newEmail,
    });
    
    if (authError) return { error: authError };
    
    // Update the profile email
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ email: newEmail })
      .eq("id", user.id);
    
    if (profileError) return { error: profileError };
    
    await refreshProfile();
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUpWithUsername,
        signIn,
        signOut,
        refreshProfile,
        updateXP,
        updateEmail,
        hasRealEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};