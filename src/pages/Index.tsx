import { useAuth } from "@/contexts/AuthContext";
import { useGuest } from "@/contexts/GuestContext";
import { Sidebar } from "@/components/duolingo/Sidebar";
import { TopBar } from "@/components/duolingo/TopBar";
import { LessonPath } from "@/components/duolingo/LessonPath";
import { RightSidebar } from "@/components/duolingo/RightSidebar";
import { DailyLoginBonus } from "@/components/DailyLoginBonus";
import { LeagueCelebration, LeagueDemotion } from "@/components/league/LeagueCelebration";
import { useLeagueReset } from "@/hooks/useLeagueReset";
import { OnboardingGuide } from "@/components/onboarding/OnboardingGuide";
import { UsernameSetup } from "@/components/onboarding/UsernameSetup";
import Landing from "./Landing";
import { CoursePath } from "@/components/course/CoursePath";
import { LearnSidePanel } from "@/components/course/LearnSidePanel";
import { SHOW_LEGACY } from "@/config/features";

const Index = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { isGuest, onboardingCompleted, completeOnboarding } = useGuest();
  const { resetResult, showCelebration, dismissCelebration } = useLeagueReset();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // New visitors see the landing page until they start as a guest or log in.
  if (!user && !isGuest) {
    return <Landing />;
  }

  // Show onboarding for new guests
  if (SHOW_LEGACY && isGuest && !onboardingCompleted) {
    return <OnboardingGuide onComplete={completeOnboarding} />;
  }

  // First-time login: profile exists and the user has not yet picked their own username.
  // We rely on the explicit `username_set` flag, not on a regex over the username,
  // so users who freely choose names like "user_cool" are never re-prompted.
  const needsUsername = !!user && !!profile && profile.username_set === false;

  return (
    <div className="min-h-screen bg-background">
      {needsUsername && <UsernameSetup />}

      {/* League Celebration/Demotion Modals - Only for authenticated users */}
      {SHOW_LEGACY && user && resetResult?.promoted && (
        <LeagueCelebration
          isOpen={showCelebration}
          onClose={dismissCelebration}
          previousLeague={resetResult.previousLeague}
          newLeague={resetResult.newLeague}
          finalPosition={resetResult.finalPosition}
          weeklyXP={resetResult.weeklyXP}
        />
      )}
      {SHOW_LEGACY && user && resetResult?.demoted && (
        <LeagueDemotion
          isOpen={showCelebration}
          onClose={dismissCelebration}
          previousLeague={resetResult.previousLeague}
          newLeague={resetResult.newLeague}
          finalPosition={resetResult.finalPosition}
        />
      )}

      {/* Daily Login Bonus Modal - Only for authenticated users */}
      {SHOW_LEGACY && user && <DailyLoginBonus />}

      {/* Mobile top bar */}
      <TopBar />

      <div className="flex">
        {/* Left sidebar - hidden on mobile */}
        <Sidebar />

        {/* Main content - lesson path */}
        <main className="flex-1 lg:ml-0 pb-20 lg:pb-0">
          <div className="max-w-[600px] mx-auto px-4 sm:px-6">
            {SHOW_LEGACY ? <LessonPath /> : <CoursePath />}
          </div>
        </main>

        {/* Right sidebar - hidden on mobile */}
        {SHOW_LEGACY ? <RightSidebar /> : <LearnSidePanel />}
      </div>
    </div>
  );
};

export default Index;
