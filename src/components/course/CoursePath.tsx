import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Lock, LockOpen, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CourseLesson, CourseUnit } from "@/data/course";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useUnlockAll } from "@/hooks/useUnlockAll";
import { useCourseAccess } from "@/hooks/useCourseAccess";
import { Switch } from "@/components/ui/switch";

// Horizontal offsets (px) that make the path wind left and right.
const OFFSETS = [0, 45, 70, 45, 0, -45, -70, -45];

// "preview": a locked lesson opened by the owner-only "Unlock all lessons" switch.
// "open": opened by the account's own "unlock every lesson" access rule (saves progress).
type NodeStatus = "completed" | "current" | "open" | "preview" | "soon" | "locked";

// Each unit has its own colour, like Duolingo.
const THEMES: Record<CourseUnit["color"], { solid: string; shadow: string; ring: string; text: string; buttonText: string }> = {
  blue: {
    solid: "bg-primary text-primary-foreground",
    shadow: "hsl(var(--primary-dark))",
    ring: "ring-primary/20",
    text: "text-primary",
    buttonText: "text-primary",
  },
  pink: {
    solid: "bg-accent-strong text-white",
    shadow: "hsl(var(--accent-dark))",
    ring: "ring-accent-strong/20",
    text: "text-accent-strong",
    buttonText: "text-accent-dark",
  },
  green: {
    solid: "bg-success text-success-foreground",
    shadow: "hsl(var(--success-dark))",
    ring: "ring-success/20",
    text: "text-success",
    buttonText: "text-success-dark",
  },
};
const GOLD = { solid: "bg-warning text-warning-foreground", shadow: "hsl(var(--warning-dark))", ring: "ring-warning/25", text: "text-warning", buttonText: "text-warning-dark" };


export const CoursePath = () => {
  const navigate = useNavigate();
  const { isLessonCompleted } = useUserProgress();
  const { isOwner, unlockAll, setUnlockAll } = useUnlockAll();
  const { units, unlockAll: accountUnlockAll } = useCourseAccess();
  // Lessons unlock in order across the units this account can see: a unit
  // opens once the previous one (including its test) is done.
  const allLessons = useMemo(() => units.flatMap((unit) => unit.lessons), [units]);
  const [openId, setOpenId] = useState<string | null>(null);
  // Finished units are folded away; these are the ones opened again to review.
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const pathRef = useRef<HTMLDivElement>(null);
  const scrolledTo = useRef<string | null>(null);

  // Close the lesson card when clicking anywhere else.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (pathRef.current && !pathRef.current.contains(e.target as Node)) setOpenId(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const statusOf = (lesson: CourseLesson): NodeStatus => {
    if (isLessonCompleted(lesson.id)) return "completed";
    const index = allLessons.findIndex((l) => l.id === lesson.id);
    const unlocked = allLessons.slice(0, index).every((l) => isLessonCompleted(l.id));
    if (!unlocked) {
      if (accountUnlockAll && lesson.exercises) return "open";
      return unlockAll && lesson.exercises ? "preview" : "locked";
    }
    return lesson.exercises ? "current" : "soon";
  };

  // Bring the learner's current lesson into view (once per lesson), so they
  // never have to scroll past what they've already finished.
  const currentId = allLessons.find((l) => statusOf(l) === "current")?.id;
  useEffect(() => {
    if (!currentId || scrolledTo.current === currentId) return;
    scrolledTo.current = currentId;
    const node = document.querySelector(`[data-lesson="${currentId}"]`);
    if (!node) return;
    const r = node.getBoundingClientRect();
    if (r.top < 120 || r.bottom > window.innerHeight - 40) node.scrollIntoView({
        block: "center",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
  }, [currentId]);

  const toggleUnit = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="py-6 flex flex-col gap-6" ref={pathRef}>
      {isOwner && (
        <label className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-warning/60 bg-warning/10 px-4 py-3 cursor-pointer">
          <LockOpen className="w-5 h-5 shrink-0 text-warning" />
          <span className="flex-1 min-w-0">
            <span className="block font-extrabold text-foreground">Unlock all lessons</span>
            <span className="block text-sm font-semibold text-muted-foreground">
              Only you can see this. Locked lessons open as previews and don't save progress.
            </span>
          </span>
          <Switch checked={unlockAll} onCheckedChange={setUnlockAll} aria-label="Unlock all lessons" />
        </label>
      )}
      {units.map((unit, unitIndex) => {
        const theme = THEMES[unit.color];
        const unitLocked = statusOf(unit.lessons[0]) === "locked";
        const unitDone = unit.lessons.every((l) => isLessonCompleted(l.id));
        const collapsed = unitDone && !expanded.has(unit.id);

        return (
          <section key={unit.id}>
            <div
              className={cn(
                "relative rounded-2xl py-4 text-center",
                unitDone ? "px-14 sm:px-28" : "px-5",
                !collapsed && "sticky top-16 lg:top-6 z-20",
                unitLocked ? "bg-muted text-muted-foreground border-2 border-border" : theme.solid
              )}
              style={unitLocked ? undefined : { boxShadow: `0 4px 0 0 ${theme.shadow}` }}
            >
              <div className="min-w-0">
                <p className="text-sm font-extrabold uppercase tracking-widest opacity-80">
                  Section {unit.section}, Unit {unit.unit}
                  {unitDone && (
                    <>
                      <Check className="sm:hidden inline w-4 h-4 ml-1.5 -mt-0.5" strokeWidth={4} aria-label="complete" />
                      <span className="hidden sm:inline"> · Complete</span>
                    </>
                  )}
                </p>
                <p className="text-xl font-extrabold truncate">{unit.title}</p>
              </div>
              {unitDone && (
                <button
                  type="button"
                  onClick={() => toggleUnit(unit.id)}
                  aria-expanded={!collapsed}
                  aria-label={collapsed ? `Review Unit ${unit.unit}` : `Hide Unit ${unit.unit}`}
                  className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 text-sm font-extrabold uppercase tracking-wide hover:bg-white/30 transition-colors"
                >
                  <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", !collapsed && "rotate-180")} />
                  <span className="hidden sm:inline">{collapsed ? "Review" : "Hide"}</span>
                </button>
              )}
            </div>

            {/* Folding a finished unit slides its path up; opening it slides it down. */}
            <AnimatePresence initial={false}>
            {!collapsed && (
            <motion.div
              key="path"
              initial={{ height: 0, opacity: 0, overflow: "hidden" }}
              animate={{ height: "auto", opacity: 1, transitionEnd: { overflow: "visible" } }}
              exit={{ height: 0, opacity: 0, overflow: "hidden" }}
              transition={{ height: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.3 } }}
            >
            <div className="relative mt-20 pb-10 flex flex-col items-center gap-7">
              <img
                src={unit.mascot}
                alt=""
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute top-24 w-28 sm:w-36 object-contain opacity-95",
                  unitIndex % 2 === 0 ? "right-0 sm:right-4" : "left-0 sm:left-4",
                  unitLocked && "grayscale opacity-40"
                )}
              />

              {unit.lessons.map((lesson, i) => {
                const status = statusOf(lesson);
                const open = openId === lesson.id;
                const isTest = lesson.kind === "test";
                const playable = status === "current" || status === "completed" || status === "preview" || status === "open";
                const nodeTheme = isTest ? GOLD : theme;
                return (
                  <div
                    key={lesson.id}
                    data-lesson={lesson.id}
                    // Extra room above the current lesson for its START bubble.
                    className={cn("relative flex flex-col items-center", status === "current" && i > 0 && "mt-10")}
                    style={{ transform: `translateX(${OFFSETS[i % OFFSETS.length]}px)`, zIndex: open ? 40 : 1 }}
                  >
                    {status === "current" && !open && (
                      <motion.span
                        className={cn(
                          "absolute -top-12 z-10 rounded-xl border-2 border-border bg-background px-3 py-2 text-sm font-extrabold uppercase tracking-wide whitespace-nowrap",
                          nodeTheme.text
                        )}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                      >
                        Start
                      </motion.span>
                    )}

                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : lesson.id)}
                      aria-label={`${lesson.title}${status === "locked" || status === "soon" ? " (locked)" : ""}`}
                      aria-expanded={open}
                      className={cn(
                        "relative w-[72px] h-[64px] rounded-[50%] flex items-center justify-center transition-transform active:translate-y-1.5 active:shadow-none",
                        playable && nodeTheme.solid,
                        status === "current" && cn("ring-[10px]", nodeTheme.ring),
                        !playable && "bg-muted text-muted-foreground/60 border-2 border-border"
                      )}
                      style={{ boxShadow: `0 7px 0 0 ${playable ? nodeTheme.shadow : "hsl(var(--border))"}` }}
                    >
                      {isTest ? (
                        <Trophy className={cn("w-8 h-8", status === "completed" && "fill-current")} />
                      ) : (
                        <>
                          {status === "completed" && <Check className="w-8 h-8" strokeWidth={4} />}
                          {status === "current" && <Star className="w-8 h-8 fill-current" />}
                          {(status === "preview" || status === "open") && <Star className="w-8 h-8" strokeWidth={2.5} />}
                          {!playable && <Lock className="w-7 h-7" />}
                        </>
                      )}
                    </button>

                    <AnimatePresence>
                      {open && (
                        <LessonCard
                          lesson={lesson}
                          number={i + 1}
                          total={unit.lessons.filter((l) => l.kind !== "test").length}
                          status={status}
                          theme={nodeTheme}
                          onStart={() => navigate(`/course/${lesson.id}${status === "preview" ? "?preview=1" : ""}`)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
            </motion.div>
            )}
            </AnimatePresence>
          </section>
        );
      })}
    </div>
  );
};

function LessonCard({
  lesson,
  number,
  total,
  status,
  theme,
  onStart,
}: {
  lesson: CourseLesson;
  number: number;
  total: number;
  status: NodeStatus;
  theme: typeof GOLD;
  onStart: () => void;
}) {
  const playable = status === "current" || status === "completed" || status === "preview" || status === "open";
  const isTest = lesson.kind === "test";
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "absolute top-[84px] z-30 w-[280px] rounded-2xl p-4 text-left",
        playable ? theme.solid : "bg-muted border-2 border-border text-muted-foreground"
      )}
    >
      <p className={cn("text-lg font-extrabold", !playable && "text-foreground")}>{lesson.title}</p>
      <p className="mt-0.5 font-bold opacity-90">
        {isTest
          ? `${lesson.description} · Get ${lesson.passAccuracy ?? 80}% to pass`
          : `Lesson ${number} of ${total} · ${lesson.description}`}
      </p>
      {status === "preview" && (
        <p className="mt-2 text-sm font-bold opacity-90">Preview: your progress won't be saved.</p>
      )}
      {playable ? (
        <button
          type="button"
          onClick={onStart}
          className={cn(
            "mt-4 w-full h-12 rounded-2xl bg-white font-extrabold uppercase tracking-wide shadow-[0_4px_0_0_hsl(0_0%_0%/0.15)] active:translate-y-1 active:shadow-none transition-transform",
            theme.buttonText
          )}
        >
          {status === "preview"
            ? isTest
              ? "Preview test"
              : "Preview lesson"
            : status === "completed"
            ? isTest
              ? `Retake test +${Math.ceil(lesson.xp / 2)} XP`
              : `Practice +${Math.ceil(lesson.xp / 2)} XP`
            : isTest
              ? `Start test +${lesson.xp} XP`
              : `Start +${lesson.xp} XP`}
        </button>
      ) : (
        <>
          <p className="mt-3 text-sm font-bold">
            {status === "soon"
              ? "This lesson is coming soon!"
              : isTest
                ? "Finish every lesson in this unit to unlock the test!"
                : number === 1
                  ? "Pass the unit test above to unlock this unit!"
                  : "Complete all lessons above to unlock this!"}
          </p>
          <div className="mt-4 w-full h-12 rounded-2xl bg-border/60 flex items-center justify-center font-extrabold uppercase tracking-wide text-muted-foreground">
            Locked
          </div>
        </>
      )}
    </motion.div>
  );
}
