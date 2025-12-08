import { Heart, Flame, Trophy, Crown, LogOut, User } from "lucide-react";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import raccoonMascot from "@/assets/raccoon-mascot.png";
import { DarkModeToggle } from "@/components/DarkModeToggle";

interface HeaderProps {
  streak: number;
  hearts: number;
  xp: number;
  dailyGoalProgress: number;
}

export const Header = ({ streak, hearts, xp, dailyGoalProgress }: HeaderProps) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="flex items-center justify-between p-4 bg-background border-b border-border">
      <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
        <img src={raccoonMascot} alt="Raccoon mascot" className="w-12 h-12" />
        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Shpoko
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {user && profile ? (
          <>
            {/* Level */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
              <User className="w-4 h-4" />
              <span className="font-medium">{profile.username}</span>
              <span className="text-sm text-muted-foreground">Lv.{profile.level}</span>
              {profile.is_premium && <Crown className="w-4 h-4 text-yellow-500" />}
            </div>

            {/* Daily Goal Progress */}
            <div className="hidden md:flex items-center gap-2">
              <ProgressCircle progress={dailyGoalProgress} size={40} strokeWidth={4} />
            </div>
            
            {/* Streak */}
            <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
              <Flame className="w-5 h-5 text-warning" />
              <span className="font-bold">{profile.streak}</span>
            </div>
            
            {/* Hearts */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-error/10 rounded-lg">
              <Heart className="w-5 h-5 text-error fill-error" />
              <span className="font-bold text-error">{hearts}</span>
            </div>
            
            {/* XP */}
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="font-bold text-primary">{profile.xp} XP</span>
            </div>

            {/* Leaderboard */}
            <Button variant="ghost" size="sm" onClick={() => navigate("/leaderboard")}>
              <Trophy className="w-4 h-4" />
            </Button>

            {/* Premium */}
            {!profile.is_premium && (
              <Button variant="outline" size="sm" onClick={() => navigate("/premium")} className="hidden md:flex">
                <Crown className="w-4 h-4 mr-1 text-yellow-500" />
                Premium
              </Button>
            )}

            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Logout */}
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </>
        ) : (
          <>
            <DarkModeToggle />
            <Button onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </>
        )}
      </div>
    </header>
  );
};
