import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { calculateLevel } from "@/lib/levelUtils";
import { daysAgo, localDateKey } from "@/lib/dates";

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
  profile_picture: string | null;
  username_set: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateXP: (amount: number) => Promise<void>;
  recordActivity: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
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

  // Called when a lesson is finished: marks today as active and keeps the
  // streak going (+1 if the last lesson was yesterday, otherwise back to 1).
  const recordActivity = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("streak, last_activity_date")
      .eq("id", user.id)
      .maybeSingle();
    if (error || !data) return;

    const today = localDateKey();
    if (data.last_activity_date === today) return;
    const continued = data.last_activity_date === localDateKey(daysAgo(1));
    const streak = continued ? (data.streak || 0) + 1 : 1;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ last_activity_date: today, streak })
      .eq("id", user.id);
    if (!updateError) await refreshProfile();
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

  // Standard sign up with email, password, and username
  const signUp = async (email: string, password: string, username: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username,
        },
      },
    });
    return { error };
  };

  // Standard sign in with email and password
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
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
        signUp,
        signIn,
        signOut,
        refreshProfile,
        updateXP,
        recordActivity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
