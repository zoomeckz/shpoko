import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Lock, LockOpen, Sparkles, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CourseLesson, CourseUnit } from "@/data/course";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useUnlockAll } from "@/hooks/useUnlockAll";
import { useCourseAccess } from "@/hooks/useCourseAccess";
import { useAuth } from "@/contexts/AuthContext";
import { useGuest } from "@/contexts/GuestContext";
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
  gold: {
    solid: "bg-warning text-warning-foreground",
    shadow: "hsl(var(--warning-dark))",
    ring: "ring-warning/25",
    text: "text-warning",
    buttonText: "text-warning-dark",
  },
};
// Unit tests (and bonus units) are gold.
const GOLD = THEMES.gold;
// Extras beside the path are purple.
const EXTRA = {
  solid: "bg-[#a560e8] text-white",
  shadow: "#7b3fc4",
  ring: "ring-[#a560e8]/25",
  text: "text-[#a560e8]",
  buttonText: "text-[#7b3fc4]",
};
// The extras column wiggles a little too, but less than the path.
const EXTRA_OFFSETS = [0, -12, -20, -12, 0, 8];
const GUIDE_KEY = "shpoko-extras-guide-seen";

export const CoursePath = () => {
  const navigate = useNavigate();
  const { isLessonCompleted } = useUserProgress();
  const { isOwner, unlockAll, setUnlockAll } = useUnlockAll();
  const { units, unlockAll: accountUnlockAll } = useCourseAccess();
  const { user, profile } = useAuth();
  const { xp: guestXp } = useGuest();
  const xp = user ? profile?.xp ?? 0 : guestXp;
  // Lessons unlock in order across the main units this account can see: a unit
  // opens once the previous one (including its test) is done. Bonus units sit
  // after the path and open with XP instead.
  const mainList = useMemo(() => units.filter((u) => !u.bonus), [units]);
  const bonusList = useMemo(() => units.filter((u) => u.bonus), [units]);
  const allLessons = useMemo(() => mainList.flatMap((unit) => unit.lessons), [mainList]);
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
    const bonusUnit = bonusList.find((u) => u.lessons.includes(lesson));
    // Bonus lessons: enough XP, then in order within their own unit.
    const path = bonusUnit ? bonusUnit.lessons : allLessons;
    const index = path.findIndex((l) => l.id === lesson.id);
    const unlocked =
      (!bonusUnit || xp >= bonusUnit.bonus!.unlockXp) && path.slice(0, index).every((l) => isLessonCompleted(l.id));
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

  // Extras open with XP once their unit has been reached.
  const extraStatusOf = (extra: CourseLesson, unitLocked: boolean): NodeStatus => {
    if (isLessonCompleted(extra.id)) return "completed";
    if (!unitLocked && xp >= (extra.unlockXp ?? 0)) return "open";
    if (accountUnlockAll) return "open";
    return unlockAll ? "preview" : "locked";
  };

  // How far the path slides left to make room for the extras column. On phones
  // the path also winds less, so the START bubble fits on its left.
  const [narrow, setNarrow] = useState(() => window.innerWidth < 640);
  const shift = narrow ? 40 : 84;
  const wind = narrow ? 0.65 : 1;
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // A one-time guide pointing at the first extra (per device).
  const [guideOpen, setGuideOpen] = useState(() => {
    try {
      return !localStorage.getItem(GUIDE_KEY);
    } catch {
      return false;
    }
  });
  const closeGuide = () => {
    setGuideOpen(false);
    try {
      localStorage.setItem(GUIDE_KEY, "1");
    } catch {
      // It'll just show again next time.
    }
  };
  // The guide sits on the first unit whose path is showing (Unit 1 for new learners).
  const guideUnit = mainList.find(
    (u) => u.extras && !(u.lessons.every((l) => isLessonCompleted(l.id)) && !expanded.has(u.id))
  );

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
      {[...mainList, ...bonusList].map((unit, unitIndex) => {
        const theme = THEMES[unit.color];
        const unitLocked = statusOf(unit.lessons[0]) === "locked";
        const unitDone = unit.lessons.every((l) => isLessonCompleted(l.id));
        const collapsed = unitDone && !expanded.has(unit.id);
        const needXp = unit.bonus && xp < unit.bonus.unlockXp ? unit.bonus.unlockXp : null;

        return (
          <section key={unit.id}>
            {unit === bonusList[0] && (
              <div className="mb-6 mt-4 flex items-center gap-3" role="separator">
                <span className="h-0.5 flex-1 bg-border" />
                <span className="text-sm font-extrabold uppercase tracking-widest text-warning">Bonus · unlock with XP</span>
                <span className="h-0.5 flex-1 bg-border" />
              </div>
            )}
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
                  {unit.bonus ? (needXp ? `Bonus · ${xp}/${needXp} XP` : "Bonus unit") : `Section ${unit.section}, Unit ${unit.unit}`}
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
            <div className="relative mt-20 pb-10 flex flex-col items-center gap-9">
              <img
                src={unit.mascot}
                alt=""
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute top-24 w-28 sm:w-36 object-contain transition-opacity duration-700",
                  unitIndex % 2 === 0 ? "right-0 sm:right-4" : "left-0 sm:left-4",
                  // The mascot fades into the background when the extras column is beside it.
                  unit.extras ? "opacity-20" : "opacity-95",
                  unitLocked && "grayscale opacity-40"
                )}
              />

              {unit.lessons.map((lesson, i) => {
                const status = statusOf(lesson);
                const open = openId === lesson.id;
                const isTest = lesson.kind === "test";
                const playable = status === "current" || status === "completed" || status === "preview" || status === "open";
                const nodeTheme = isTest ? GOLD : theme;
                const extraLesson = unit.extras?.[i];
                const extraStatus = extraLesson ? extraStatusOf(extraLesson, unitLocked) : null;
                const extraOpen = !!extraLesson && openId === extraLesson.id;
                const showGuide = guideOpen && i === 0 && !!extraLesson && unit === guideUnit;
                return (
                  <div
                    key={lesson.id}
                    data-lesson={lesson.id}
                    // Rows are spaced evenly (START sits beside the node), so neither column jumps.
                    className="relative w-full flex justify-center"
                    style={{ zIndex: open || extraOpen ? 40 : showGuide ? 35 : 1 }}
                  >
                  {/* With extras beside it, the path slides over to the left to make room. */}
                  <motion.div
                    className="relative flex flex-col items-center"
                    initial={{ x: OFFSETS[i % OFFSETS.length] * wind }}
                    animate={{ x: OFFSETS[i % OFFSETS.length] * wind - (unit.extras ? shift : 0) }}
                    transition={{ type: "spring", stiffness: 140, damping: 20, delay: 0.1 + i * 0.04 }}
                  >
                    {status === "current" && !open && <StartBubble textClass={nodeTheme.text} />}

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
                  </motion.div>

                    {extraLesson && extraStatus && (
                      <ExtraNode
                        index={i}
                        lesson={extraLesson}
                        status={extraStatus}
                        highlight={showGuide}
                        onClick={() => {
                          if (showGuide) closeGuide();
                          setOpenId(extraOpen ? null : extraLesson.id);
                        }}
                      />
                    )}

                    <AnimatePresence>
                      {open && (
                        <LessonCard
                          lesson={lesson}
                          number={i + 1}
                          total={unit.lessons.filter((l) => l.kind !== "test").length}
                          status={status}
                          theme={nodeTheme}
                          needXp={needXp}
                          xp={xp}
                          onStart={() => navigate(`/course/${lesson.id}${status === "preview" ? "?preview=1" : ""}`)}
                        />
                      )}
                      {extraOpen && extraLesson && extraStatus && (
                        <LessonCard
                          key={extraLesson.id}
                          lesson={extraLesson}
                          number={i + 1}
                          total={unit.extras!.length}
                          status={extraStatus}
                          theme={EXTRA}
                          needXp={extraStatus === "locked" && !unitLocked ? extraLesson.unlockXp ?? null : null}
                          xp={xp}
                          onStart={() => navigate(`/course/${extraLesson.id}${extraStatus === "preview" ? "?preview=1" : ""}`)}
                        />
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {showGuide && extraLesson && (
                        <ExtrasGuide firstUnlockXp={extraLesson.unlockXp ?? 0} xp={xp} onClose={closeGuide} />
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

/**
 * "START" beside the current lesson, pointing at it from the left. Where the
 * winding path leaves no room on the left (phones), it sits on the right instead.
 */
function StartBubble({ textClass }: { textClass: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  // Hidden until the path has slid into place and we know which side fits.
  const [side, setSide] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    const place = () => {
      const bubble = ref.current;
      const node = bubble?.parentElement;
      const area = bubble?.closest("section");
      if (!bubble || !node || !area) return;
      const roomLeft = node.getBoundingClientRect().left - area.getBoundingClientRect().left;
      setSide(roomLeft >= bubble.offsetWidth + 16 ? "left" : "right");
    };
    const timer = setTimeout(place, 700);
    window.addEventListener("resize", place);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", place);
    };
  }, []);

  const left = side !== "right";
  return (
    <motion.span
      ref={ref}
      className={cn(
        "absolute top-1/2 z-10 rounded-xl border-2 border-border bg-background px-3 py-2 text-sm font-extrabold uppercase tracking-wide whitespace-nowrap",
        left ? "right-full mr-3" : "left-full ml-3",
        textClass
      )}
      style={{ y: "-50%" }}
      initial={false}
      animate={{ opacity: side ? 1 : 0, x: left ? [0, -5, 0] : [0, 5, 0] }}
      transition={{ opacity: { duration: 0.2 }, x: { duration: 1.6, repeat: Infinity, ease: "easeInOut" } }}
    >
      Start
      {/* Little arrow pointing at the lesson */}
      <span
        className={cn(
          "absolute top-1/2 w-3 h-3 -translate-y-1/2 rotate-45 bg-background border-border",
          left ? "-right-[7px] border-r-2 border-t-2" : "-left-[7px] border-l-2 border-b-2"
        )}
        aria-hidden="true"
      />
    </motion.span>
  );
}

/** A small purple node beside the path for one extra. */
function ExtraNode({
  index,
  lesson,
  status,
  highlight,
  onClick,
}: {
  index: number;
  lesson: CourseLesson;
  status: NodeStatus;
  /** Pulses while the guide points at it. */
  highlight: boolean;
  onClick: () => void;
}) {
  const playable = status !== "locked";
  return (
    <motion.div
      className="absolute top-1/2 z-10 flex flex-col items-center"
      style={{ right: `calc(3% + ${EXTRA_OFFSETS[index % EXTRA_OFFSETS.length]}px)`, y: "-50%" }}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 160, damping: 18, delay: 0.35 + index * 0.06 }}
    >
      {highlight && (
        <motion.span
          className="absolute top-0 w-14 h-[50px] rounded-[50%] ring-4 ring-[#a560e8]"
          animate={{ scale: [1, 1.35], opacity: [0.8, 0] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          aria-hidden="true"
        />
      )}
      <button
        type="button"
        onClick={onClick}
        aria-label={`Extra: ${lesson.title}${playable ? "" : ` (unlocks at ${lesson.unlockXp} XP)`}`}
        className={cn(
          "relative w-14 h-[50px] rounded-[50%] flex items-center justify-center transition-transform active:translate-y-1 active:shadow-none",
          playable ? EXTRA.solid : "bg-muted text-muted-foreground/60 border-2 border-border"
        )}
        style={{ boxShadow: `0 5px 0 0 ${playable ? EXTRA.shadow : "hsl(var(--border))"}` }}
      >
        {status === "completed" ? (
          <Check className="w-6 h-6" strokeWidth={4} />
        ) : playable ? (
          <Sparkles className="w-6 h-6" />
        ) : (
          <Lock className="w-5 h-5" />
        )}
      </button>
      {!playable && (
        <span className="mt-2 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-extrabold text-muted-foreground whitespace-nowrap">
          {lesson.unlockXp} XP
        </span>
      )}
    </motion.div>
  );
}

/** One-time popup in the first unit explaining the extras column. */
function ExtrasGuide({ firstUnlockXp, xp, onClose }: { firstUnlockXp: number; xp: number; onClose: () => void }) {
  const ready = xp >= firstUnlockXp;
  return (
    <motion.div
      role="dialog"
      aria-label="Extras"
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.6 }}
      className="absolute right-0 top-full mt-6 z-50 w-[260px] rounded-2xl border-2 border-[#a560e8] bg-background p-4 text-left shadow-xl"
    >
      <span
        className="absolute -top-[9px] right-[34px] w-4 h-4 rotate-45 border-l-2 border-t-2 border-[#a560e8] bg-background"
        aria-hidden="true"
      />
      <p className="flex items-center gap-2 text-lg font-extrabold text-foreground">
        <Sparkles className="w-5 h-5 text-[#a560e8]" /> Extras!
      </p>
      <p className="mt-1 font-semibold text-muted-foreground">
        Beside your path are extra mini-lessons: brands, menus, tongue twisters and more. They unlock with XP.
      </p>
      <p className="mt-2 font-bold text-foreground">
        {ready ? "You've already unlocked the first one. Tap it!" : `Your first one unlocks at ${firstUnlockXp} XP. Finish a lesson to get there!`}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-4 w-full h-11 rounded-2xl bg-[#a560e8] font-extrabold uppercase tracking-wide text-white shadow-[0_4px_0_0_#7b3fc4] active:translate-y-1 active:shadow-none transition-transform"
      >
        Got it
      </button>
    </motion.div>
  );
}

function LessonCard({
  lesson,
  number,
  total,
  status,
  theme,
  needXp,
  xp,
  onStart,
}: {
  lesson: CourseLesson;
  number: number;
  total: number;
  status: NodeStatus;
  theme: typeof GOLD;
  /** XP still needed to open this bonus unit or extra, or null. */
  needXp: number | null;
  xp: number;
  onStart: () => void;
}) {
  const playable = status === "current" || status === "completed" || status === "preview" || status === "open";
  const isTest = lesson.kind === "test";
  const isExtra = lesson.kind === "extra";
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
          : isExtra
          ? `Extra ${number} of ${total} · ${lesson.description}`
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
              : isExtra
              ? `Start extra +${lesson.xp} XP`
              : `Start +${lesson.xp} XP`}
        </button>
      ) : (
        <>
          <p className="mt-3 text-sm font-bold">
            {status === "soon"
              ? "This lesson is coming soon!"
              : needXp && isExtra
              ? `Unlocks at ${needXp} XP. You have ${xp} XP, so earn ${needXp - xp} more!`
              : needXp
              ? `Earn ${needXp} XP in total to unlock this bonus unit!`
              : isExtra
              ? "Reach this unit to unlock its extras!"
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
