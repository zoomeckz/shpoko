import { lazy, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGuest } from "@/contexts/GuestContext";
import { Sidebar } from "@/components/duolingo/Sidebar";
import { TopBar } from "@/components/duolingo/TopBar";
import { UsernameSetup } from "@/components/onboarding/UsernameSetup";
import Landing from "./Landing";
import { CoursePath } from "@/components/course/CoursePath";
import { LearnSidePanel } from "@/components/course/LearnSidePanel";
import { SHOW_LEGACY } from "@/config/features";

// Old-site pieces are only downloaded when SHOW_LEGACY is on.
const LessonPath = lazy(() => import("@/components/duolingo/LessonPath").then((m) => ({ default: m.LessonPath })));
const RightSidebar = lazy(() => import("@/components/duolingo/RightSidebar").then((m) => ({ default: m.RightSidebar })));
const OnboardingGuide = lazy(() =>
  import("@/components/onboarding/OnboardingGuide").then((m) => ({ default: m.OnboardingGuide }))
);
const LegacyHomeExtras = lazy(() => import("@/components/LegacyHomeExtras"));

const Index = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { isGuest, onboardingCompleted, completeOnboarding } = useGuest();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary/25 border-t-primary animate-spin" />
      </div>
    );
  }

  // New visitors see the landing page until they start as a guest or log in.
  if (!user && !isGuest) {
    return <Landing />;
  }

  if (SHOW_LEGACY && isGuest && !onboardingCompleted) {
    return (
      <Suspense fallback={null}>
        <OnboardingGuide onComplete={completeOnboarding} />
      </Suspense>
    );
  }

  // First-time login: profile exists and the user has not yet picked their own username.
  // We rely on the explicit `username_set` flag, not on a regex over the username,
  // so users who freely choose names like "user_cool" are never re-prompted.
  const needsUsername = !!user && !!profile && profile.username_set === false;

  return (
    <div className="min-h-screen bg-background">
      {needsUsername && <UsernameSetup />}

      {SHOW_LEGACY && (
        <Suspense fallback={null}>
          <LegacyHomeExtras />
        </Suspense>
      )}

      {/* Mobile top bar */}
      <TopBar />

      <div className="flex">
        {/* Left sidebar - hidden on mobile */}
        <Sidebar />

        {/* Main content - lesson path */}
        <main className="flex-1 min-w-0 pb-24 lg:pb-10">
          <div className="max-w-[600px] mx-auto px-4 sm:px-6">
            {SHOW_LEGACY ? (
              <Suspense fallback={null}>
                <LessonPath />
              </Suspense>
            ) : (
              <CoursePath />
            )}
          </div>
        </main>

        {/* Right column - wide screens only */}
        {SHOW_LEGACY ? (
          <Suspense fallback={null}>
            <RightSidebar />
          </Suspense>
        ) : (
          <LearnSidePanel />
        )}
      </div>
    </div>
  );
};

export default Index;
