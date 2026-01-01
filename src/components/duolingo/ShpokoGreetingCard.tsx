import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { ShpokoLottie } from "./ShpokoLottie";

type GreetingMood = "happy" | "excited" | "celebrating" | "encouraging";

function getGreeting(streak: number, username?: string): { text: string; mood: GreetingMood } {
  const hour = new Date().getHours();
  const name = username ? `, ${username}` : "";

  if (streak >= 7) return { text: `Insane streak${name}! ${streak} days!`, mood: "celebrating" };
  if (streak >= 3) return { text: `Nice${name}! Keep it rolling.`, mood: "excited" };

  if (hour < 12) return { text: `Good morning${name}! Ready?`, mood: "happy" };
  if (hour < 18) return { text: `Let’s practice${name}!`, mood: "encouraging" };
  return { text: `Evening session${name}?`, mood: "happy" };
}

export function ShpokoGreetingCard({
  className,
  bubbleDurationMs = 4500,
}: {
  className?: string;
  bubbleDurationMs?: number;
}) {
  const { profile } = useAuth();

  const greeting = useMemo(
    () => getGreeting(profile?.streak || 0, profile?.username),
    [profile?.streak, profile?.username]
  );

  const [showSpeech, setShowSpeech] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSpeech(false), bubbleDurationMs);
    return () => clearTimeout(t);
  }, [bubbleDurationMs]);

  return (
    <div className={cn("bg-card rounded-2xl border-2 border-border p-4", className)}>
      <div className="flex items-center gap-4">
        <ShpokoLottie
          mood={greeting.mood}
          size="md"
          showSpeechBubble={showSpeech}
          speechText={greeting.text}
          onClick={() => setShowSpeech(true)}
        />
        <div className="flex-1">
          <p className="font-semibold text-sm">{greeting.text}</p>
          <p className="text-xs text-muted-foreground mt-1">Tap Shpoko for more hype.</p>
        </div>
      </div>
    </div>
  );
}
