import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/duolingo/Sidebar";
import { TopBar } from "@/components/duolingo/TopBar";
import { LessonPath } from "@/components/duolingo/LessonPath";
import { RightSidebar } from "@/components/duolingo/RightSidebar";
import { DailyLoginBonus } from "@/components/DailyLoginBonus";
import { LeagueCelebration, LeagueDemotion } from "@/components/league/LeagueCelebration";
import { useLeagueReset } from "@/hooks/useLeagueReset";
import Landing from "@/pages/Landing";

const Index = () => {
  const { user, loading } = useAuth();
  const { resetResult, showCelebration, dismissCelebration } = useLeagueReset();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return <Landing />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* League Celebration/Demotion Modals */}
      {resetResult?.promoted && (
        <LeagueCelebration
          isOpen={showCelebration}
          onClose={dismissCelebration}
          previousLeague={resetResult.previousLeague}
          newLeague={resetResult.newLeague}
          finalPosition={resetResult.finalPosition}
          weeklyXP={resetResult.weeklyXP}
        />
      )}
      {resetResult?.demoted && (
        <LeagueDemotion
          isOpen={showCelebration}
          onClose={dismissCelebration}
          previousLeague={resetResult.previousLeague}
          newLeague={resetResult.newLeague}
          finalPosition={resetResult.finalPosition}
        />
      )}

      {/* Daily Login Bonus Modal */}
      <DailyLoginBonus />
      
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
