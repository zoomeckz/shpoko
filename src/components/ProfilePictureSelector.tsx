import { useState } from "react";
import { cn } from "@/lib/utils";
import { Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Import all profile pictures
import shpokoHappy from "@/assets/shpoko-happy.png";
import shpokoSad from "@/assets/shpoko-sad.png";
import shpokoExcited from "@/assets/shpoko-excited.png";
import shpokoThinking from "@/assets/shpoko-thinking.png";
import shpokoAngry from "@/assets/shpoko-angry.png";
import shpokoSmug from "@/assets/shpoko-smug.png";
import shpokoStudying from "@/assets/shpoko-studying.png";
import shpokoReading from "@/assets/shpoko-reading.png";
import shpokoWriting from "@/assets/shpoko-writing.png";
import shpokoSleeping from "@/assets/shpoko-sleeping.png";

export type ProfilePictureId = 
  | "happy" 
  | "excited" 
  | "thinking" 
  | "sad" 
  | "angry" 
  | "smug" 
  | "studying" 
  | "reading" 
  | "writing" 
  | "sleeping";

export const profilePictures: { id: ProfilePictureId; name: string; src: string; unlockLevel: number }[] = [
  { id: "happy", name: "Happy", src: shpokoHappy, unlockLevel: 1 },
  { id: "excited", name: "Excited", src: shpokoExcited, unlockLevel: 10 },
  { id: "thinking", name: "Thinking", src: shpokoThinking, unlockLevel: 20 },
  { id: "sad", name: "Sad", src: shpokoSad, unlockLevel: 30 },
  { id: "angry", name: "Angry", src: shpokoAngry, unlockLevel: 40 },
  { id: "smug", name: "Smug", src: shpokoSmug, unlockLevel: 50 },
  { id: "studying", name: "Studying", src: shpokoStudying, unlockLevel: 60 },
  { id: "reading", name: "Reading", src: shpokoReading, unlockLevel: 70 },
  { id: "writing", name: "Writing", src: shpokoWriting, unlockLevel: 80 },
  { id: "sleeping", name: "Sleeping", src: shpokoSleeping, unlockLevel: 90 },
];

export const getProfilePictureSrc = (pictureId: string | null | undefined): string => {
  const picture = profilePictures.find(p => p.id === pictureId);
  return picture?.src || shpokoHappy;
};

interface ProfilePictureSelectorProps {
  trigger?: React.ReactNode;
}

export const ProfilePictureSelector = ({ trigger }: ProfilePictureSelectorProps) => {
  const { profile, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [selecting, setSelecting] = useState(false);

  const userLevel = profile?.level || 1;
  const currentPicture = profile?.profile_picture || "happy";

  const isUnlocked = (unlockLevel: number) => userLevel >= unlockLevel;

  const selectPicture = async (pictureId: ProfilePictureId) => {
    if (!profile || !isUnlocked(profilePictures.find(p => p.id === pictureId)?.unlockLevel || 999)) {
      return;
    }

    setSelecting(true);
    const { error } = await supabase
      .from("profiles")
      .update({ profile_picture: pictureId })
      .eq("id", profile.id);

    if (error) {
      toast.error("Failed to update profile picture");
    } else {
      toast.success("Profile picture updated!");
      refreshProfile();
      setOpen(false);
    }
    setSelecting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Change Picture
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Profile Picture</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-4">
          Unlock new pictures by reaching higher levels! Every 10 levels unlocks a new expression.
        </p>
        <div className="grid grid-cols-5 gap-3">
          {profilePictures.map((picture) => {
            const unlocked = isUnlocked(picture.unlockLevel);
            const isSelected = currentPicture === picture.id;
            
            return (
              <button
                key={picture.id}
                onClick={() => unlocked && selectPicture(picture.id)}
                disabled={!unlocked || selecting}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                  unlocked 
                    ? "hover:border-primary cursor-pointer" 
                    : "cursor-not-allowed opacity-60",
                  isSelected ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border"
                )}
              >
                <img
                  src={picture.src}
                  alt={picture.name}
                  className={cn(
                    "w-full h-full object-cover",
                    !unlocked && "grayscale blur-sm"
                  )}
                />
                {!unlocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Lv.{picture.unlockLevel}</span>
                  </div>
                )}
                {isSelected && unlocked && (
                  <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Your level: {userLevel}
        </p>
      </DialogContent>
    </Dialog>
  );
};

interface ProfilePictureProps {
  pictureId?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

export const ProfilePicture = ({ pictureId, size = "md", className }: ProfilePictureProps) => {
  const src = getProfilePictureSrc(pictureId);
  
  return (
    <img
      src={src}
      alt="Profile"
      className={cn(
        "rounded-full object-cover border-2 border-border",
        sizeClasses[size],
        className
      )}
    />
  );
};
