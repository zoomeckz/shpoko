import { lazy, Suspense } from "react";
import { Sidebar } from "@/components/duolingo/Sidebar";
import { TopBar } from "@/components/duolingo/TopBar";
import { UsernameSetup } from "@/components/onboarding/UsernameSetup";
import { CoursePath } from "@/components/course/CoursePath";
import { LearnSidePanel } from "@/components/course/LearnSidePanel";
import { SHOW_LEGACY } from "@/config/features";

// Old-site pieces are only downloaded when SHOW_LEGACY is on.
const LessonPath = lazy(() => import("@/components/duolingo/LessonPath").then((m) => ({ default: m.LessonPath })));
const RightSidebar = lazy(() => import("@/components/duolingo/RightSidebar").then((m) => ({ default: m.RightSidebar })));
const LegacyHomeExtras = lazy(() => import("@/components/LegacyHomeExtras"));

/** The learning path, with the menu and the side panel. */
export default function LearnHome({ needsUsername }: { needsUsername: boolean }) {
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
}
