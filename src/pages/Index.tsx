import { lazy, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGuest } from "@/contexts/GuestContext";
import { SHOW_LEGACY } from "@/config/features";

// The landing page and the learning path are separate downloads, so new
// visitors don't fetch the whole course and learners don't fetch the landing page.
const loadLanding = () => import("./Landing");
const loadLearnHome = () => import("./LearnHome");
const Landing = lazy(loadLanding);
const LearnHome = lazy(loadLearnHome);
const OnboardingGuide = lazy(() =>
  import("@/components/onboarding/OnboardingGuide").then((m) => ({ default: m.OnboardingGuide }))
);

/** Someone who has been here before: logged in, or learning as a guest. */
function looksLikeLearner() {
  try {
    return (
      !!localStorage.getItem("shpoko_guest_state") ||
      Object.keys(localStorage).some((k) => k.startsWith("sb-") && k.endsWith("-auth-token"))
    );
  } catch {
    return false;
  }
}

// Start downloading the likely page now, while the login check runs.
if (looksLikeLearner()) loadLearnHome();
else loadLanding();

function Spinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-primary/25 border-t-primary animate-spin" />
    </div>
  );
}

const Index = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { isGuest, onboardingCompleted, completeOnboarding } = useGuest();

  if (authLoading) return <Spinner />;

  // New visitors see the landing page until they start as a guest or log in.
  if (!user && !isGuest) {
    return (
      <Suspense fallback={<Spinner />}>
        <Landing />
      </Suspense>
    );
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
    <Suspense fallback={<Spinner />}>
      <LearnHome needsUsername={needsUsername} />
    </Suspense>
  );
};

export default Index;
