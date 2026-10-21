import { useAuth } from "@/contexts/AuthContext";
import { DailyLoginBonus } from "@/components/DailyLoginBonus";
import { LeagueCelebration, LeagueDemotion } from "@/components/league/LeagueCelebration";
import { useLeagueReset } from "@/hooks/useLeagueReset";

/**
 * Old home-page pop-ups (league results, daily bonus). Only loaded when
 * SHOW_LEGACY is on, so their database checks don't run otherwise.
 */
export default function LegacyHomeExtras() {
  const { user } = useAuth();
  const { resetResult, showCelebration, dismissCelebration } = useLeagueReset();
  if (!user) return null;

  return (
    <>
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
      <DailyLoginBonus />
    </>
  );
}
