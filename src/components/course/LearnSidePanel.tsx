import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProgress } from "@/hooks/useUserProgress";
import { DuoButton } from "@/components/duolingo/DuoButton";
import { useCourseAccess } from "@/hooks/useCourseAccess";
import { useDailyXp } from "@/hooks/useDailyXp";
import { DailyGoalCard } from "@/components/profile/DailyGoalCard";
import { useT } from "@/i18n";

const BAR = { blue: "bg-primary", pink: "bg-accent-strong", green: "bg-success", gold: "bg-warning" } as const;

// Right-hand column on the Learn page (wide screens only).
export const LearnSidePanel = () => {
  const { user } = useAuth();
  const t = useT();
  const { isLessonCompleted } = useUserProgress();
  const { units } = useCourseAccess();
  const { today, goal } = useDailyXp(1);
  // The unit the learner is working on: the first one with lessons left.
  const mainUnits = units.filter((u) => !u.bonus);
  const unit = mainUnits.find((u) => u.lessons.some((l) => !isLessonCompleted(l.id))) ?? mainUnits[mainUnits.length - 1];
  if (!unit) return null;
  const completed = unit.lessons.filter((l) => isLessonCompleted(l.id)).length;

  return (
    <aside className="hidden xl:block w-[368px] shrink-0 px-6 py-6">
      <div className="sticky top-6 space-y-6">
        {!user && (
          <div className="duo-card p-5">
            <p className="text-xl font-extrabold text-foreground">{t("side.saveProgress")}</p>
            <div className="mt-5 flex flex-col gap-3">
              <DuoButton asChild size="lg" fullWidth>
                <Link to="/auth?mode=signup">{t("common.createProfile")}</Link>
              </DuoButton>
              <DuoButton asChild variant="white" size="lg" fullWidth>
                <Link to="/auth">{t("common.logIn")}</Link>
              </DuoButton>
            </div>
          </div>
        )}

        {user && <DailyGoalCard today={today} goal={goal} showLink />}

        <div className="duo-card p-5">
          <p className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground">{t("side.unit", { n: unit.unit })}</p>
          <p className="mt-1 text-lg font-extrabold text-foreground">{unit.title}</p>
          <div className="mt-4 h-4 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${BAR[unit.color]}`}
              style={{ width: `${(completed / unit.lessons.length) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-sm font-bold text-muted-foreground">
            {t("side.lessonsDone", { done: completed, total: unit.lessons.length })}
          </p>
        </div>
      </div>
    </aside>
  );
};
