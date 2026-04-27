import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateUsername, canChangeUsername } from "@/lib/usernameValidation";
import { Edit3, AlertCircle } from "lucide-react";

export const ChangeUsernameDialog = () => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If the user hasn't picked a username yet, treat this as the initial pick:
  // skip the 30-day cooldown entirely.
  const isInitialPick = profile?.username_set === false;
  const cooldown = canChangeUsername(profile?.last_username_change || null);
  const canChange = isInitialPick || cooldown.canChange;
  const daysRemaining = cooldown.daysRemaining;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!profile) return;

    // Validate username
    const validation = validateUsername(newUsername);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    // Check if can change
    if (!canChange) {
      setError(`You can change your username again in ${daysRemaining} days`);
      return;
    }

    setLoading(true);

    try {
      const updates: Record<string, unknown> = {
        username: newUsername.trim(),
        username_set: true,
      };
      // Only start the 30-day cooldown when a user changes a username
      // they had already set — initial picks shouldn't lock them out.
      if (!isInitialPick) {
        updates.last_username_change = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id);

      if (updateError) {
        if (updateError.message.includes("duplicate")) {
          setError("This username is already taken");
        } else {
          setError("Failed to update username. Please try again.");
        }
        return;
      }

      await refreshProfile();
      toast({
        title: "Username Updated",
        description: `Your username is now "${newUsername.trim()}"`,
      });
      setOpen(false);
      setNewUsername("");
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Edit3 className="w-4 h-4" />
          Change Username
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Username</DialogTitle>
          <DialogDescription>
            {isInitialPick
              ? "Set your username — you can change it again later."
              : "You can change your username once every 30 days."}
            {!canChange && !isInitialPick && (
              <span className="block mt-2 text-destructive">
                Next change available in {daysRemaining} days
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">New Username</Label>
            <Input
              id="username"
              value={newUsername}
              onChange={(e) => {
                setNewUsername(e.target.value);
                setError(null);
              }}
              placeholder="Enter new username"
              disabled={!canChange || loading}
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground">
              3-20 characters. Letters, numbers, and spaces only.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canChange || loading || !newUsername.trim()}>
              {loading ? "Updating..." : "Update Username"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
