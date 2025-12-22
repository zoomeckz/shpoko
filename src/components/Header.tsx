import { Flame, Trophy, Crown, LogOut, Info, ClipboardList } from "lucide-react";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import LanguageModeToggle from "@/components/LanguageModeToggle";
import { ProfilePicture, ProfilePictureSelector } from "@/components/ProfilePictureSelector";
import { calculateLevelProgress } from "@/lib/levelUtils";
import { useLanguageMode } from "@/contexts/LanguageModeContext";
import { getTranslations } from "@/lib/translations";

interface HeaderProps {
  streak: number;
  hearts: number;
  xp: number;
  dailyGoalProgress: number;
}

export const Header = ({
  streak,
  xp,
}: HeaderProps) => {
  const {
    user,
    profile,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const { uiLanguage } = useLanguageMode();
  const t = getTranslations(uiLanguage);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="flex items-center justify-center p-4 bg-background border-b border-border">
      <div className="flex items-center gap-4">
        {user && profile ? (
          <>
            {/* Profile with Picture */}
            <ProfilePictureSelector
              trigger={
                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-accent rounded-lg cursor-pointer hover:bg-accent/80 transition-colors">
                  <ProfilePicture pictureId={profile.profile_picture} size="xs" />
                  <span className="font-medium">{profile.username}</span>
                  <span className="text-sm text-muted-foreground">{t.level}{profile.level}</span>
                  {profile.is_premium && <Crown className="w-4 h-4 text-yellow-500" />}
                </div>
              }
            />

            {/* Level Progress */}
            <div className="hidden md:flex items-center gap-2">
              <ProgressCircle progress={calculateLevelProgress(profile.xp, profile.level)} size={40} strokeWidth={4} />
            </div>
            
            {/* Streak */}
            <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
              <Flame className="w-5 h-5 text-warning" />
              <span className="font-bold">{profile.streak}</span>
            </div>
            
            {/* XP */}
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="font-bold text-primary">{profile.xp} {t.xp}</span>
            </div>

            {/* Quiz */}
            <Button variant="outline" size="sm" onClick={() => navigate("/quiz")} className="hidden md:flex">
              <ClipboardList className="w-4 h-4 mr-1" />
              {t.quizzes}
            </Button>

            {/* Leaderboard */}
            <Button variant="outline" size="sm" onClick={() => navigate("/leaderboard")} className="hidden md:flex">
              <Trophy className="w-4 h-4 mr-1 text-primary" />
              {t.leaderboard}
            </Button>

            {/* Premium */}
            {!profile.is_premium && (
              <Button variant="outline" size="sm" onClick={() => navigate("/premium")} className="hidden md:flex">
                <Crown className="w-4 h-4 mr-1 text-yellow-500" />
                {t.premium}
              </Button>
            )}

            {/* Language Mode Toggle */}
            <LanguageModeToggle />

            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* About */}
            <Button variant="ghost" size="icon" onClick={() => navigate("/about")}>
              <Info className="w-5 h-5" />
            </Button>

            {/* Logout */}
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </>
        ) : (
          <>
            <DarkModeToggle />
            <Button onClick={() => navigate("/auth")}>
              {t.signIn}
            </Button>
          </>
        )}
      </div>
    </header>
  );
};
