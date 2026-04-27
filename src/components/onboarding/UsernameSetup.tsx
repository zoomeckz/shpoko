import { useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateUsername } from "@/lib/usernameValidation";
import { cn } from "@/lib/utils";

/**
 * Forces newly authenticated users (e.g. via Google) to pick a real username
 * before they can use the app. Shown when profile.username starts with "user_".
 */
export const UsernameSetup = () => {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const result = validateUsername(username);
    if (!result.isValid) {
      setError(result.error);
      return;
    }

    setLoading(true);
    setError(null);

    // Check uniqueness
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.trim())
      .neq("id", user.id)
      .maybeSingle();

    if (existing) {
      setError("This username is already taken");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username: username.trim() })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await refreshProfile();
    toast({ title: "Welcome aboard!", description: `You're set up as ${username.trim()}.` });
    setLoading(false);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border-2 border-primary bg-card p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 text-center">
          <div className="text-5xl mb-2">🦝</div>
          <h2 className="text-xl font-bold text-foreground">Pick a username</h2>
          <p className="text-sm text-muted-foreground mt-1">
            This is how other learners will see you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="setup-username" className="font-semibold text-sm">Username</Label>
            <Input
              id="setup-username"
              type="text"
              autoFocus
              placeholder="e.g. ShpokoFan"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(null); }}
              className={cn("h-11 rounded-xl border-2", error ? "border-destructive" : "border-border")}
              autoComplete="username"
              maxLength={20}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <p className="text-[11px] text-muted-foreground">
              3–20 characters. Letters, numbers, and spaces only.
            </p>
          </div>
          <Button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full h-12 text-base font-bold rounded-xl"
          >
            {loading ? "Saving..." : "Continue"}
          </Button>
        </form>
      </motion.div>
    </div>,
    document.body
  );
};
