import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGuest } from "@/contexts/GuestContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { calculateLevel } from "@/lib/levelUtils";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

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

const Auth = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
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
        if (newUser && guestProgress.xp > 0) {
          await supabase
            .from("profiles")
            .update({
              xp: guestProgress.xp,
              level: calculateLevel(guestProgress.xp),
            })
            .eq("id", newUser.id);
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl">🦝</span>
            <span className="text-2xl font-extrabold text-primary">SHPOKO</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-2xl border-2 border-border p-6 sm:p-8 shadow-lg">
            {/* Mascot */}
            <div className="flex justify-center mb-2">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl select-none"
              >
                🦝
              </motion.div>
            </div>
            <h1 className="text-2xl font-bold text-foreground text-center mb-1">
              Welcome to SHPOKO
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-5">
              Learn Bulgarian the fun way
            </p>

            {/* Google */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              variant="outline"
              aria-busy={googleLoading}
              className="w-full h-12 rounded-xl border-2 font-semibold text-base"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {googleStatus.kind === "redirecting"
                ? "Redirecting to Google..."
                : googleStatus.kind === "connecting"
                ? "Connecting..."
                : googleStatus.kind === "success"
                ? "Signed in!"
                : "Continue with Google"}
            </Button>

            {/* Inline Google status message */}
            {googleStatus.kind !== "idle" && googleStatus.kind !== "connecting" && (
              <div
                role="status"
                aria-live="polite"
                className={cn(
                  "mt-2 flex items-start gap-2 rounded-lg px-3 py-2 text-xs",
                  googleStatus.kind === "error" &&
                    "bg-destructive/10 text-destructive",
                  googleStatus.kind === "success" &&
                    "bg-green-500/10 text-green-700 dark:text-green-400",
                  googleStatus.kind === "redirecting" &&
                    "bg-muted text-muted-foreground"
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

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={mode} onValueChange={(v) => { setMode(v as "login" | "register"); setErrors({}); }}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" className="font-bold">Log in</TabsTrigger>
                <TabsTrigger value="register" className="font-bold">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email-login" className="font-semibold text-sm">Email</Label>
                    <Input
                      id="email-login"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn("h-11 rounded-xl border-2", errors.email ? "border-destructive" : "border-border")}
                      autoComplete="email"
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password-login" className="font-semibold text-sm">Password</Label>
                    <Input
                      id="password-login"
                      type="password"
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn("h-11 rounded-xl border-2", errors.password ? "border-destructive" : "border-border")}
                      autoComplete="current-password"
                    />
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-base font-bold rounded-xl"
                  >
                    {loading ? "Loading..." : "LOG IN"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email-reg" className="font-semibold text-sm">Email</Label>
                    <Input
                      id="email-reg"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn("h-11 rounded-xl border-2", errors.email ? "border-destructive" : "border-border")}
                      autoComplete="email"
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password-reg" className="font-semibold text-sm">Password</Label>
                    <Input
                      id="password-reg"
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn("h-11 rounded-xl border-2", errors.password ? "border-destructive" : "border-border")}
                      autoComplete="new-password"
                    />
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-reg" className="font-semibold text-sm">Confirm Password</Label>
                    <Input
                      id="confirm-reg"
                      type="password"
                      placeholder="Re-type your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={cn("h-11 rounded-xl border-2", errors.confirmPassword ? "border-destructive" : "border-border")}
                      autoComplete="new-password"
                    />
                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-base font-bold rounded-xl"
                  >
                    {loading ? "Creating..." : "CREATE ACCOUNT"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Guest */}
            <div className="mt-5 pt-5 border-t border-border">
              <Button
                type="button"
                onClick={handleContinueAsGuest}
                variant="ghost"
                className="w-full font-semibold text-muted-foreground"
              >
                Continue as guest →
              </Button>
              <p className="text-[11px] text-muted-foreground text-center mt-1">
                Guests can play basic lessons. Register to unlock everything.
              </p>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-5">
              By continuing, you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Auth;
