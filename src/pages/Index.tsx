import { useState, useEffect } from "react";
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
import { RegistrationPrompt } from "@/components/onboarding/RegistrationPrompt";
import { LockedScreen } from "@/components/onboarding/LockedScreen";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    isGuest, 
    onboardingCompleted, 
    isLocked,
    initGuest, 
    completeOnboarding,
    shouldShowRegistrationPrompt 
  } = useGuest();
  const { resetResult, showCelebration, dismissCelebration } = useLeagueReset();
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);
  const [hasShownPrompt, setHasShownPrompt] = useState(false);

  // Auto-initialize guest if not authenticated and not already a guest
  useEffect(() => {
    if (!authLoading && !user && !isGuest) {
      initGuest();
    }
  }, [authLoading, user, isGuest, initGuest]);

  // Check for registration prompt
  useEffect(() => {
    if (isGuest && !hasShownPrompt && shouldShowRegistrationPrompt()) {
      setShowRegistrationPrompt(true);
      setHasShownPrompt(true);
    }
  }, [isGuest, hasShownPrompt, shouldShowRegistrationPrompt]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show locked screen for guests who declined registration
  if (isGuest && isLocked) {
    return <LockedScreen />;
  }

  // Show onboarding for new guests
  if (isGuest && !onboardingCompleted) {
    return <OnboardingGuide onComplete={completeOnboarding} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Registration Prompt Modal */}
      {showRegistrationPrompt && (
        <RegistrationPrompt onClose={() => setShowRegistrationPrompt(false)} />
      )}

      {/* League Celebration/Demotion Modals - Only for authenticated users */}
      {user && resetResult?.promoted && (
        <LeagueCelebration
          isOpen={showCelebration}
          onClose={dismissCelebration}
          previousLeague={resetResult.previousLeague}
          newLeague={resetResult.newLeague}
          finalPosition={resetResult.finalPosition}
          weeklyXP={resetResult.weeklyXP}
        />
      )}
      {user && resetResult?.demoted && (
        <LeagueDemotion
          isOpen={showCelebration}
          onClose={dismissCelebration}
          previousLeague={resetResult.previousLeague}
          newLeague={resetResult.newLeague}
          finalPosition={resetResult.finalPosition}
        />
      )}

      {/* Daily Login Bonus Modal - Only for authenticated users */}
      {user && <DailyLoginBonus />}
      
      {/* Mobile top bar */}
      <TopBar />
      
      <div className="flex">
        {/* Left sidebar - hidden on mobile */}
        <Sidebar />
        
        {/* Main content - lesson path */}
        <main className="flex-1 lg:ml-0 pb-20 lg:pb-0">
          <div className="max-w-lg mx-auto px-4">
            <LessonPath />
          </div>
        </main>
        
        {/* Right sidebar - hidden on mobile */}
        <RightSidebar />
      </div>
    </div>
  );
};

export default Index;
