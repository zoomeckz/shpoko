import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { calculateLevel } from "@/lib/levelUtils";
import { daysAgo, localDateKey } from "@/lib/dates";
import { loginEmailFor } from "@/lib/accounts";
import { toast } from "sonner";

/** Access rules an admin set for this account (null = normal account, no limits). */
export interface AccountAccess {
  expires_at: string | null;
  units: string[] | null;
  unlock_all: boolean;
  disabled: boolean;
}

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
  created_at: string;
  last_activity_date: string | null;
  /** XP to earn per day. Missing until the profile migration has run. */
  daily_goal?: number;
  longest_streak?: number;
  /** "HH:MM:SS", or null when reminders are off. */
  reminder_time?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  access: AccountAccess | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: AuthError | null }>;
  /** Accepts an email address or, for admin-made accounts, a username. */
  signIn: (emailOrUsername: string, password: string) => Promise<{ error: AuthError | null }>;
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
  const [access, setAccess] = useState<AccountAccess | null>(null);
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
      // Today's XP feeds the daily goal and the week chart on the profile.
      // A failure here (e.g. before the migration has run) mustn't stop the lesson.
      await supabase.rpc("add_daily_xp", { _day: localDateKey(), _xp: xpToAdd }).then(
        () => {},
        () => {}
      );
      await refreshProfile();
    }
  };

  // Called when a lesson is finished: marks today as active and keeps the
  // streak going (+1 if the last lesson was yesterday, otherwise back to 1).
  const recordActivity = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
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
    // Saved on its own so the streak still works if this column doesn't exist yet.
    if (!updateError && "longest_streak" in data && streak > (data.longest_streak ?? 0)) {
      await supabase.from("profiles").update({ longest_streak: streak }).eq("id", user.id);
    }
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

  // Load the account's access rules, and re-check now and then so changes an
  // admin makes (or a running-out timer) take effect without a reload.
  useEffect(() => {
    if (!user) {
      setAccess(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      const { data, error } = await supabase
        .from("account_access")
        .select("expires_at, units, unlock_all, disabled")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) setAccess(error ? null : data);
    };
    load();
    const reload = setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(reload);
    };
  }, [user]);

  // Expired or disabled accounts are logged out straight away.
  useEffect(() => {
    if (!user || !access) return;
    const check = () => {
      const expired = !!access.expires_at && Date.parse(access.expires_at) <= Date.now();
      if (!access.disabled && !expired) return;
      toast.error(access.disabled ? "This account has been disabled." : "This account has expired.");
      supabase.auth.signOut();
      setProfile(null);
      setAccess(null);
    };
    check();
    const timer = setInterval(check, 30 * 1000);
    return () => clearInterval(timer);
  }, [user, access]);

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

  // Sign in with an email address, or with a username for admin-made accounts
  const signIn = async (emailOrUsername: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmailFor(emailOrUsername),
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
        access,
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
