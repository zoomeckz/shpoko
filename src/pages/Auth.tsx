import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGuest } from "@/contexts/GuestContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { DuoButton } from "@/components/duolingo/DuoButton";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { calculateLevel } from "@/lib/levelUtils";
import { Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import shpokoMascot from "@/assets/shpoko-mascot.png";

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type Mode = "login" | "register";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<Mode>(
    searchParams.get("mode") === "signup" ? "register" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleStatus, setGoogleStatus] = useState<
    | { kind: "idle" }
    | { kind: "connecting" }
    | { kind: "redirecting" }
    | { kind: "success" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, user } = useAuth();
  const { isGuest, getProgressForTransfer, clearGuest, initGuest } = useGuest();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrors({});
    setConfirmPassword("");
  };

  const validateForm = () => {
    try {
      if (mode === "login") {
        signInSchema.parse({ email, password });
      } else {
        signUpSchema.parse({ email, password, confirmPassword });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) newErrors[err.path[0] as string] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const transferGuestProgress = async () => {
    if (!isGuest) return;
    const guestProgress = getProgressForTransfer();
    setTimeout(async () => {
      try {
        const { data: { user: newUser } } = await supabase.auth.getUser();
        if (!newUser) return;

        // 1) Transfer aggregate XP / level onto the new profile.
        if (guestProgress.xp > 0) {
          await supabase
            .from("profiles")
            .update({
              xp: guestProgress.xp,
              level: calculateLevel(guestProgress.xp),
            })
            .eq("id", newUser.id);
        }

        // 2) Transfer per-lesson completions into user_progress so the lesson
        //    path keeps showing the lessons the guest already finished.
        const lessonEntries = Object.entries(guestProgress.completedLessons || {});
        if (lessonEntries.length > 0) {
          const rows = lessonEntries.map(([lessonId, record]) => ({
            user_id: newUser.id,
            lesson_id: lessonId,
            completed: true,
            score: record.score,
            // We don't track per-lesson correct/total for guests — use score as
            // a reasonable proxy so existing constraints/columns are satisfied.
            correct_answers: record.score,
            total_answers: 100,
            completed_at: record.completedAt,
          }));
          const { error: progressError } = await supabase
            .from("user_progress")
            .upsert(rows, { onConflict: "user_id,lesson_id" });
          if (progressError) {
            console.error("Error transferring guest lesson progress:", progressError);
          }
        }
      } catch (e) {
        console.error("Error transferring guest progress:", e);
      }
    }, 1000);
    clearGuest();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Login Failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({ title: "Welcome back!", description: "You're logged in." });
          navigate("/");
        }
      } else {
        // Register: no username needed yet — they'll choose one after auth
        // Use a temporary placeholder; UsernameSetup modal will collect the real one.
        const tempUsername = `user_${Date.now().toString(36)}`;
        const { error } = await signUp(email, password, tempUsername);
        if (error) {
          if (error.message.includes("already")) {
            toast({
              title: "Email Already Registered",
              description: "Try logging in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign Up Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          await transferGuestProgress();
          toast({
            title: "Welcome to Shpoko!",
            description: "Let's set up your username next.",
          });
          navigate("/");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setGoogleStatus({ kind: "connecting" });
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        const message =
          (result.error as { message?: string })?.message ||
          "Please try again or use email instead.";
        setGoogleStatus({ kind: "error", message });
        toast({
          title: "Google Sign-In Failed",
          description: message,
          variant: "destructive",
        });
        setGoogleLoading(false);
        return;
      }
      if (result.redirected) {
        // Browser will redirect to Google momentarily; keep the button disabled
        // and show a clear status so the user knows what's happening.
        setGoogleStatus({ kind: "redirecting" });
        return;
      }
      // Authenticated inline (no redirect path)
      setGoogleStatus({ kind: "success" });
      toast({
        title: "Signed in with Google",
        description: "Welcome! Loading your account...",
      });
      await transferGuestProgress();
      navigate("/");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setGoogleStatus({ kind: "error", message });
      toast({
        title: "Google Sign-In Failed",
        description: message,
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    if (!isGuest) initGuest();
    navigate("/");
  };

  const isLogin = mode === "login";

  // Grey, borderless-looking fields that light up blue on focus.
  const fieldClass = (hasError: boolean) =>
    cn(
      "w-full h-14 rounded-2xl border-2 bg-muted px-4 text-[17px] font-semibold text-foreground",
      "placeholder:text-muted-foreground/70 placeholder:font-semibold outline-none transition-colors",
      "focus:border-info focus:bg-card",
      hasError ? "border-error" : "border-border"
    );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-4 sm:px-6 h-[70px] flex items-center justify-between">
        <Link
          to="/"
          aria-label="Close"
          className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="w-6 h-6" strokeWidth={3} />
        </Link>
        <DuoButton
          variant="white"
          size="sm"
          onClick={() => switchMode(isLogin ? "register" : "login")}
        >
          {isLogin ? "Sign up" : "Log in"}
        </DuoButton>
      </header>

      <main className="flex-1 flex items-start sm:items-center justify-center px-4 pb-12">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-[380px]"
        >
          <img
            src={shpokoMascot}
            alt=""
            className="w-20 h-20 mx-auto object-contain"
          />
          <h1 className="mt-3 text-[26px] font-extrabold text-foreground text-center">
            {isLogin ? "Log in" : "Create your profile"}
          </h1>
          <p className="mt-1 text-center text-muted-foreground font-semibold">
            {isLogin ? "Welcome back! Your streak missed you." : "Free forever. Save your progress anywhere."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3" noValidate>
            <div>
              <Label htmlFor="auth-email" className="sr-only">Email</Label>
              <input
                id="auth-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass(!!errors.email)}
                autoComplete="email"
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="mt-1.5 ml-1 text-sm font-semibold text-error">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="auth-password" className="sr-only">Password</Label>
              <input
                id="auth-password"
                type="password"
                placeholder={isLogin ? "Password" : "Password (at least 6 characters)"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldClass(!!errors.password)}
                autoComplete={isLogin ? "current-password" : "new-password"}
                aria-invalid={!!errors.password}
              />
              {errors.password && <p className="mt-1.5 ml-1 text-sm font-semibold text-error">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="auth-confirm" className="sr-only">Confirm password</Label>
                <input
                  id="auth-confirm"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={fieldClass(!!errors.confirmPassword)}
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                />
                {errors.confirmPassword && (
                  <p className="mt-1.5 ml-1 text-sm font-semibold text-error">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            <DuoButton type="submit" variant="info" size="lg" fullWidth disabled={loading} className="!mt-5">
              {loading && <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />}
              {isLogin ? (loading ? "Logging in..." : "Log in") : loading ? "Creating..." : "Create account"}
            </DuoButton>
          </form>

          <div className="my-6 flex items-center gap-4" aria-hidden="true">
            <div className="h-0.5 flex-1 bg-border" />
            <span className="text-sm font-extrabold text-muted-foreground">OR</span>
            <div className="h-0.5 flex-1 bg-border" />
          </div>

          <DuoButton
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            aria-busy={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleStatus.kind === "redirecting"
              ? "Redirecting..."
              : googleStatus.kind === "connecting"
              ? "Connecting..."
              : googleStatus.kind === "success"
              ? "Signed in!"
              : "Continue with Google"}
          </DuoButton>

          {/* Inline Google status message */}
          {googleStatus.kind !== "idle" && googleStatus.kind !== "connecting" && (
            <div
              role="status"
              aria-live="polite"
              className={cn(
                "mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-sm font-semibold",
                googleStatus.kind === "error" && "bg-error-light text-error-dark",
                googleStatus.kind === "success" && "bg-success-light text-success-dark",
                googleStatus.kind === "redirecting" && "bg-muted text-muted-foreground"
              )}
            >
              {googleStatus.kind === "error" && (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              )}
              {googleStatus.kind === "success" && (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              )}
              {googleStatus.kind === "redirecting" && (
                <Loader2 className="w-4 h-4 shrink-0 mt-0.5 animate-spin" aria-hidden="true" />
              )}
              <span>
                {googleStatus.kind === "error" && googleStatus.message}
                {googleStatus.kind === "success" && "Signed in with Google. Loading your account..."}
                {googleStatus.kind === "redirecting" && "Taking you to Google to finish signing in..."}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="mt-6 w-full text-center text-sm font-extrabold uppercase tracking-wide text-primary hover:brightness-110"
          >
            Continue without an account
          </button>

          <p className="mt-8 text-xs font-semibold text-muted-foreground text-center leading-relaxed">
            By continuing, you agree to Shpoko's Terms and Privacy Policy.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Auth;
