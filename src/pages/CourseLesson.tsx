import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Dumbbell, Flag, Volume2, VolumeX, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { findLesson, mainUnits, TEACHING_TYPES, type CourseLesson as Lesson, type CourseUnit, type TextFont } from "@/data/course";
import { useAuth } from "@/contexts/AuthContext";
import { useGuest } from "@/contexts/GuestContext";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useSfx } from "@/hooks/useSfx";
import { useSoundSettings } from "@/contexts/SoundSettingsContext";
import { useCourseAccess } from "@/hooks/useCourseAccess";
import { DuoButton } from "@/components/duolingo/DuoButton";
import {
  AnswerState,
  BuildExercise,
  ChoiceExercise,
  FamiliarExercise,
  ShapeExercise,
  TipExercise,
  WordExercise,
  fontClass,
  IntroExercise,
  MatchExercise,
  PhraseExercise,
  FillExercise,
} from "@/components/course/exercises";
import { ReportProblemSheet } from "@/components/course/ReportProblem";
import { SoundButton } from "@/components/course/SoundButton";
import { answerSpeech } from "@/data/speechTexts";
import { playSpeech } from "@/lib/speech";
import { lessonMoments, syncAchievements } from "@/lib/achievements";
import { buildPractice, clearMistake, loadMistakes, recordMistake, type Mistake } from "@/lib/mistakes";
import { questionOf } from "@/lib/exerciseSummary";
import { localDateKey } from "@/lib/dates";
import { supabase } from "@/integrations/supabase/client";
import { Confetti } from "@/components/Confetti";
import { useT, type TKey } from "@/i18n";
import { achievementText } from "@/lib/achievementText";
import shpokoMascot from "@/assets/shpoko-mascot.webp";

const PRAISE: TKey[] = ["lesson.praise1", "lesson.praise2", "lesson.praise3", "lesson.praise4", "lesson.praise5"];
const EMPTY_ANSWER: AnswerState = { ready: false, correct: false, solution: "" };

type Phase = "answering" | "checked" | "finished";

function LessonPlayer({
  lesson,
  onRetry,
  preview = false,
  practice,
  testOut,
}: {
  lesson: Lesson;
  onRetry: () => void;
  preview?: boolean;
  /** Taking this unit's test to skip it: passing marks the unit (and earlier ones) done. */
  testOut?: CourseUnit;
  /** Practice only: where each exercise came from, so it can be cleared when answered right. */
  practice?: Mistake[];
}) {
  const exercises = lesson.exercises!;
  const t = useT();
  // Unit tests: no second chances, and a pass mark.
  const isTest = lesson.kind === "test";
  const passMark = lesson.passAccuracy ?? 80;
  const navigate = useNavigate();
  const { user, updateXP, recordActivity } = useAuth();
  const { isGuest, initGuest, addXP, markLessonCompleted, isGuestLessonCompleted } = useGuest();
  const { saveProgress, isLessonCompleted } = useUserProgress();
  const sfx = useSfx();
  const { soundEnabled, toggleSound } = useSoundSettings();

  // Exercises still to play; wrong answers are appended again at the end.
  const [queue, setQueue] = useState<number[]>(() => exercises.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [phase, setPhase] = useState<Phase>("answering");
  const [answer, setAnswer] = useState<AnswerState>(EMPTY_ANSWER);
  const [lastCorrect, setLastCorrect] = useState(true);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [mistakes, setMistakes] = useState<Set<number>>(new Set());
  const [praise, setPraise] = useState(PRAISE[0]);
  const [confirmExit, setConfirmExit] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const startedAt = useRef(Date.now());
  const finishedAt = useRef(0);
  const saved = useRef(false);
  // What was answered wrong, with the right answer, for the "worth another look" list.
  const [missed, setMissed] = useState<Map<number, string>>(new Map());
  // Saving mistakes runs in the background; "Practise these" waits for it.
  const pendingSaves = useRef<Promise<unknown>[]>([]);
  const sourceOf = (i: number) => practice?.[i] ?? { lessonId: lesson.id, index: i };

  const index = queue[pos];
  const exercise = exercises[index];
  // Teaching screens are just read and continued, not graded.
  const isIntro = !!exercise && TEACHING_TYPES.includes(exercise.type);
  const graded = Math.max(1, exercises.filter((e) => !TEACHING_TYPES.includes(e.type)).length);
  const accuracy = Math.round(((graded - mistakes.size) / graded) * 100);

  // Visitors who land here directly still get their progress remembered.
  useEffect(() => {
    if (!user && !isGuest) initGuest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = useCallback((state: AnswerState) => setAnswer(state), []);

  const markResult = useCallback(
    (correct: boolean) => {
      // Each question is graded once; ignore any repeat report.
      if (phase !== "answering") return;
      setLastCorrect(correct);
      setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
      if (correct) {
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        sfx.correct(nextStreak);
        setDone((d) => new Set(d).add(index));
        // Got a practice question right first time: it's no longer a mistake.
        if (practice && !mistakes.has(index)) {
          const src = sourceOf(index);
          pendingSaves.current.push(clearMistake(user?.id ?? null, src.lessonId, src.index));
        }
      } else {
        setStreak(0);
        sfx.wrong();
        setMistakes((m) => new Set(m).add(index));
        setMissed((m) => new Map(m).set(index, answer.solution));
        if (!preview) {
          const src = sourceOf(index);
          pendingSaves.current.push(recordMistake(user?.id ?? null, src.lessonId, src.index));
        }
        // In a lesson the question comes back at the end; in a test it doesn't.
        if (isTest) setDone((d) => new Set(d).add(index));
        else setQueue((q) => [...q, index]);
      }
      setPhase("checked");
      // Then hear the Bulgarian the question was about.
      const said = soundEnabled ? answerSpeech(exercise) : undefined;
      if (said) setTimeout(() => playSpeech(said), 450);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index, streak, sfx, phase, isTest, answer.solution, mistakes, practice, preview, user?.id, soundEnabled, exercise]
  );

  const next = useCallback(() => {
    if (pos + 1 >= queue.length) {
      setPhase("finished");
      return;
    }
    setPos((p) => p + 1);
    setAnswer(EMPTY_ANSWER);
    setPhase("answering");
  }, [pos, queue.length]);

  const onPrimary = useCallback(() => {
    if (phase === "checked") return next();
    if (isIntro) {
      setDone((d) => new Set(d).add(index));
      return next();
    }
    if (answer.ready) markResult(answer.correct);
  }, [phase, isIntro, answer, index, next, markResult]);

  const onMatchComplete = useCallback(() => markResult(true), [markResult]);

  // Enter checks / continues.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // A focused button already handles Enter as a click, and text boxes need it for typing.
      if (["BUTTON", "TEXTAREA", "INPUT"].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === "Enter" && phase !== "finished" && !confirmExit && !reportOpen) onPrimary();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPrimary, phase, confirmExit, reportOpen]);

  // Save once when the lesson is finished.
  useEffect(() => {
    if (phase !== "finished" || saved.current) return;
    saved.current = true;
    finishedAt.current = Date.now();
    if (isTest && accuracy < passMark) {
      sfx.miss();
      return; // A failed test isn't saved.
    }
    sfx.complete();
    // Owner previews (opened via "Unlock all lessons") never touch real progress.
    if (preview) {
      setXpEarned(0);
      return;
    }
    // Practising mistakes gives a little XP every time and isn't a lesson to complete.
    if (practice) {
      setXpEarned(lesson.xp);
      if (user) {
        updateXP(lesson.xp)
          .then(() => recordActivity())
          .catch(() => {});
      } else {
        addXP(lesson.xp);
      }
      return;
    }
    // Tested out: every lesson in this unit and the units before it counts as done
    // (no XP for those; the test's own XP is saved as usual below).
    if (testOut) {
      const skipped = mainUnits
        .slice(0, mainUnits.indexOf(testOut) + 1)
        .flatMap((u) => u.lessons)
        .filter((l) => l.id !== lesson.id && !isLessonCompleted(l.id));
      if (user) {
        supabase
          .from("user_progress")
          .upsert(
            skipped.map((l) => ({
              user_id: user.id,
              lesson_id: l.id,
              completed: true,
              score: accuracy,
              correct_answers: 0,
              total_answers: 0,
              completed_at: new Date().toISOString(),
            })),
            { onConflict: "user_id,lesson_id" }
          )
          .then(
            () => {},
            () => {}
          );
      } else {
        skipped.forEach((l) => markLessonCompleted(l.id, accuracy));
      }
    }
    // Full XP the first time, half XP for practising a finished lesson again.
    const practiceXp = Math.ceil(lesson.xp / 2);
    if (user) {
      saveProgress(lesson.id, accuracy, graded - mistakes.size, graded, () => updateXP(lesson.xp))
        .then(async ({ xpAwarded }) => {
          if (!xpAwarded) await updateXP(practiceXp);
          setXpEarned(xpAwarded ? lesson.xp : practiceXp);
          await recordActivity();
          const { newlyEarned } = await syncAchievements(user.id, lessonMoments());
          newlyEarned.slice(-2).forEach(({ achievement, level }, i) =>
            setTimeout(
              () =>
                toast.success(t("ach.toast", { icon: achievement.icon, title: achievementText(t, achievement).title }), {
                  description: achievementText(t, achievement).describe(achievement.tiers[level - 1]),
                }),
              900 + i * 700
            )
          );
        })
        .catch(() => setXpEarned(0));
    } else {
      const earned = isGuestLessonCompleted(lesson.id) ? practiceXp : lesson.xp;
      addXP(earned);
      setXpEarned(earned);
      markLessonCompleted(lesson.id, accuracy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === "finished") {
    const missedList = [...missed].map(([i, solution]) => ({ question: questionOf(exercises[i]), solution }));
    // Waits for the mistakes to be saved, then opens a practice round of them.
    const practiseNow = async () => {
      await Promise.all(pendingSaves.current);
      navigate("/course/practice");
    };
    if (isTest && accuracy < passMark) {
      return (
        <TestFailed
          accuracy={accuracy}
          passMark={passMark}
          onRetry={onRetry}
          onExit={() => navigate("/")}
          onPractice={!preview && missedList.length ? practiseNow : undefined}
        />
      );
    }
    const seconds = Math.round(((finishedAt.current || Date.now()) - startedAt.current) / 1000);
    return (
      <LessonComplete
        xp={xpEarned}
        preview={preview}
        isTest={isTest}
        isPractice={!!practice}
        testedOut={!!testOut && !preview}
        learned={lesson.description}
        learnedFont={lesson.descriptionFont}
        testMessage={lesson.completeMessage}
        accuracy={accuracy}
        time={`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`}
        missed={missedList}
        onPractice={!preview && !practice && missedList.length ? practiseNow : undefined}
        onContinue={() => navigate("/")}
      />
    );
  }

  const progress = (done.size / exercises.length) * 100;
  const footerTone = phase === "checked" ? (lastCorrect ? "correct" : "wrong") : "idle";
  const exerciseKey = `${pos}-${index}`;
  const props = { checked: phase === "checked", onChange, onComplete: onMatchComplete };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-clip">
      {/* Top: close + progress */}
      <header className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 flex items-center gap-4">
        <button
          type="button"
          onClick={() => (done.size > 0 ? setConfirmExit(true) : navigate("/"))}
          aria-label={t("lesson.quit")}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-7 h-7" strokeWidth={3} />
        </button>
        <div
          className="flex-1 h-4 rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            className="relative h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${Math.max(progress, 2)}%` }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
          >
            <span className="absolute left-2 right-2 top-1 h-1 rounded-full bg-white/30" />
          </motion.div>
        </div>
        {preview && (
          <span className="rounded-lg bg-warning/15 px-2 py-1 text-xs font-extrabold uppercase tracking-wide text-warning">{t("lesson.preview")}</span>
        )}
        {user && (
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            aria-label={t("lesson.reportAria")}
            title={t("report.title")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Flag className="w-6 h-6" />
          </button>
        )}
        <button
          type="button"
          onClick={toggleSound}
          aria-label={soundEnabled ? t("sound.mute") : t("sound.unmute")}
          aria-pressed={!soundEnabled}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </header>

      {/* Exercise */}
      {/* Lesson content is Bulgarian and English, so it reads left to right in every interface language. */}
      <main dir="ltr" className="flex-1 w-full max-w-[600px] mx-auto px-4 sm:px-6 pt-8 sm:pt-14 pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={exerciseKey}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18 }}
          >
            {exercise.type === "familiar" && <FamiliarExercise exercise={exercise} {...props} />}
            {exercise.type === "tip" && <TipExercise exercise={exercise} {...props} />}
            {exercise.type === "word" && <WordExercise exercise={exercise} {...props} />}
            {exercise.type === "shape" && <ShapeExercise exercise={exercise} {...props} />}
            {exercise.type === "intro" && <IntroExercise exercise={exercise} {...props} />}
            {exercise.type === "choice" && <ChoiceExercise exercise={exercise} {...props} />}
            {exercise.type === "match" && <MatchExercise exercise={exercise} {...props} />}
            {exercise.type === "build" && <BuildExercise exercise={exercise} {...props} />}
            {exercise.type === "phrase" && <PhraseExercise exercise={exercise} {...props} />}
            {exercise.type === "fill" && <FillExercise exercise={exercise} {...props} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer: check / feedback */}
      <footer
        className={cn(
          "border-t-2 transition-colors",
          footerTone === "idle" && "border-border",
          footerTone === "correct" && "border-transparent bg-success-light",
          footerTone === "wrong" && "border-transparent bg-error-light"
        )}
      >
        <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 py-5 sm:py-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div className="min-h-[3.5rem] flex items-center gap-4">
            {phase === "checked" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4" role="status">
                <span
                  className={cn(
                    "hidden sm:flex w-16 h-16 rounded-full bg-card items-center justify-center",
                    lastCorrect ? "text-success" : "text-error"
                  )}
                >
                  {lastCorrect ? <Check className="w-9 h-9" strokeWidth={4} /> : <X className="w-9 h-9" strokeWidth={4} />}
                </span>
                <div className={lastCorrect ? "text-success" : "text-error"}>
                  <p className="text-2xl font-extrabold">{lastCorrect ? t(praise) : t("lesson.correctSolution")}</p>
                  {!lastCorrect && <p dir="ltr" className="text-lg font-bold">{answer.solution}</p>}
                  {"explain" in exercise && exercise.explain && (
                    <p className="text-base font-bold opacity-90">{exercise.explain}</p>
                  )}
                </div>
                <SoundButton text={answerSpeech(exercise)} size="sm" className="shrink-0" />
              </motion.div>
            )}
          </div>

          <DuoButton
            size="xl"
            variant={phase === "checked" ? (lastCorrect ? "success" : "danger") : "primary"}
            disabled={phase === "answering" && !isIntro && !answer.ready}
            onClick={onPrimary}
            className="w-full sm:w-[200px]"
          >
            {phase === "checked" || isIntro ? t("common.continue") : t("common.check")}
          </DuoButton>
        </div>
      </footer>

      <ReportProblemSheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        lessonId={lesson.id}
        exerciseIndex={index}
        exercise={exercise}
      />

      {/* Quit confirmation */}
      <AnimatePresence>
        {confirmExit && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmExit(false)}
          >
            <motion.div
              className="w-full bg-background border-t-2 border-border"
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-w-[600px] mx-auto px-6 py-8 text-center">
                <img src={shpokoMascot} alt="" className="w-24 h-24 mx-auto object-contain" />
                <p className="mt-3 text-2xl font-extrabold text-foreground">{t("lesson.dontGo")}</p>
                <p className="mt-1 font-semibold text-muted-foreground">{t("lesson.loseProgress")}</p>
                <div className="mt-6 flex flex-col gap-3">
                  <DuoButton size="lg" fullWidth onClick={() => setConfirmExit(false)}>
                    {t("lesson.keepLearning")}
                  </DuoButton>
                  <DuoButton variant="ghost" size="lg" fullWidth className="text-error hover:bg-error/10" onClick={() => navigate("/")}>
                    {t("lesson.endSession")}
                  </DuoButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatTile({ label, value, tone }: { label: string; value: string; tone: "yellow" | "blue" | "pink" }) {
  const colors = {
    yellow: "border-warning bg-warning",
    blue: "border-primary bg-primary",
    pink: "border-accent-strong bg-accent-strong",
  }[tone];
  const text = { yellow: "text-warning", blue: "text-primary", pink: "text-accent-strong" }[tone];
  return (
    <div className={cn("flex-1 rounded-2xl border-2 overflow-hidden", colors)}>
      <p className="py-1 text-xs font-extrabold uppercase tracking-widest text-white text-center">{label}</p>
      <div className="m-[2px] mt-0 rounded-[13px] bg-background py-4 text-center">
        <p className={cn("text-xl font-extrabold", text)}>{value}</p>
      </div>
    </div>
  );
}

/** Counts up from 0 to `to`, for the XP on the finish screen. */
function useCountUp(to: number | null, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (to === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(to);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [to, duration]);
  return value;
}

function LessonComplete({
  xp,
  accuracy,
  time,
  learned,
  learnedFont,
  isTest,
  isPractice = false,
  testedOut = false,
  testMessage,
  preview = false,
  missed,
  onPractice,
  onContinue,
}: {
  preview?: boolean;
  /** XP actually earned; null while it's being saved. */
  xp: number | null;
  /** The lesson's letters (space separated) or words (comma separated). */
  learned: string;
  learnedFont?: TextFont;
  isTest: boolean;
  isPractice?: boolean;
  /** Passed a unit test to skip the unit. */
  testedOut?: boolean;
  testMessage?: string;
  accuracy: number;
  time: string;
  /** Questions answered wrong, with the right answer. */
  missed: { question: string; solution: string }[];
  onPractice?: () => void;
  onContinue: () => void;
}) {
  const t = useT();
  const { profile } = useAuth();
  const chips = (learned.includes(",") ? learned.split(",") : learned.split(" ")).map((s) => s.trim()).filter(Boolean);
  const onlyLetters = chips.every((c) => c.length === 1);
  const shownXp = useCountUp(preview ? null : xp);
  // The streak only shows once today's lesson has been counted.
  const streakToday = profile && profile.last_activity_date === localDateKey() ? profile.streak : 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Enter" && (e.target as HTMLElement)?.tagName !== "BUTTON" && onContinue();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onContinue]);

  const title = testedOut
    ? t("finish.testedOut")
    : isTest
      ? t("finish.unitComplete")
      : isPractice
        ? t("finish.practiceComplete")
        : t("finish.lessonComplete");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Confetti big={isTest} />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center">
        <motion.img
          src={shpokoMascot}
          alt={t("finish.mascotAlt")}
          className="w-40 h-40 object-contain"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, y: [0, -10, 0] }}
          transition={{ scale: { type: "spring", stiffness: 200 }, y: { duration: 2, repeat: Infinity } }}
        />
        <h1 className="mt-5 text-3xl font-extrabold text-warning">{title}</h1>
        {testedOut ? (
          <p className="mt-2 max-w-sm text-lg font-bold text-muted-foreground">
            {t("finish.testedOutBody")}
          </p>
        ) : isTest ? (
          <p className="mt-2 max-w-sm text-lg font-bold text-muted-foreground">
            {t("finish.passed")} {testMessage ?? t("finish.greatWork")}
          </p>
        ) : isPractice ? (
          <p className="mt-2 max-w-sm text-lg font-bold text-muted-foreground">
            {missed.length ? t("finish.practiceSome") : t("finish.practiceAll")}
          </p>
        ) : (
          <p className="mt-2 text-lg font-bold text-muted-foreground">
            {learnedFont === "italic"
              ? t("finish.readItalic")
              : learnedFont === "handwriting"
                ? t("finish.readHand")
                : onlyLetters
                  ? t("finish.newLetters")
                  : t("finish.readThese")}
          </p>
        )}
        {!isTest && !isPractice && (
          <div dir="ltr" className="mt-3 flex flex-wrap justify-center gap-2">
            {chips.map((letter, i) => (
              <motion.span
                key={letter}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.08, type: "spring", stiffness: 320, damping: 16 }}
                className={cn(
                  "h-12 rounded-xl border-2 border-border bg-card flex items-center justify-center text-2xl text-foreground shadow-[0_3px_0_0_hsl(var(--border))]",
                  onlyLetters ? "w-11" : "px-3",
                  learnedFont && learnedFont !== "print" ? fontClass(learnedFont) : "font-black"
                )}
              >
                {letter}
              </motion.span>
            ))}
          </div>
        )}
        <div className="mt-7 w-full max-w-md flex gap-3">
          <StatTile label={t("finish.totalXp")} value={preview ? t("finish.previewTile") : xp === null ? "…" : `+${shownXp}`} tone="yellow" />
          <StatTile label={t("finish.accuracy")} value={`${accuracy}%`} tone="blue" />
          <StatTile label={t("finish.time")} value={time} tone="pink" />
        </div>
        {streakToday > 0 && !preview && (
          <motion.p
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 300, damping: 14 }}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#ff9600]/15 px-4 py-2 text-lg font-extrabold text-[#ff9600]"
          >
            {t("finish.streak", { n: streakToday })}
          </motion.p>
        )}

        {missed.length > 0 && (
          <section dir="ltr" className="mt-7 w-full max-w-md text-left" aria-label={t("finish.worthLook")}>
            <p className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground">{t("finish.worthLook")}</p>
            <ul className="mt-2 space-y-2">
              {missed.slice(0, 5).map((m, i) => (
                <li key={i} className="duo-card px-4 py-3">
                  <p className="font-bold text-muted-foreground">{m.question}</p>
                  <p className="mt-0.5 flex items-start gap-2 font-extrabold text-success">
                    <Check className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={3} />
                    {m.solution}
                  </p>
                </li>
              ))}
            </ul>
            {missed.length > 5 && (
              <p className="mt-2 text-sm font-bold text-muted-foreground">{t("finish.andMore", { n: missed.length - 5 })}</p>
            )}
          </section>
        )}
      </main>
      <footer className="border-t-2 border-border">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-5 sm:py-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          {onPractice && (
            <DuoButton variant="white" size="xl" className="w-full sm:w-auto" onClick={onPractice}>
              <Dumbbell className="w-5 h-5" />
              {t("finish.practise")}
            </DuoButton>
          )}
          <DuoButton size="xl" className="w-full sm:w-[200px]" onClick={onContinue}>
            {t("common.continue")}
          </DuoButton>
        </div>
      </footer>
    </div>
  );
}

function TestFailed({
  accuracy,
  passMark,
  onRetry,
  onExit,
  onPractice,
}: {
  accuracy: number;
  passMark: number;
  onRetry: () => void;
  onExit: () => void;
  onPractice?: () => void;
}) {
  const t = useT();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <motion.img
          src={shpokoMascot}
          alt=""
          className="w-36 h-36 object-contain"
          initial={{ scale: 0.7, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
        />
        <h1 className="mt-6 text-3xl font-extrabold text-foreground">{t("fail.title")}</h1>
        <p className="mt-2 max-w-sm text-lg font-bold text-muted-foreground">
          {t("fail.body", { acc: accuracy, pass: passMark })}
        </p>
        <div className="mt-6 w-full max-w-xs h-4 rounded-full bg-muted overflow-hidden relative">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${accuracy}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <span className="absolute top-0 bottom-0 w-1 bg-warning" style={{ left: `${passMark}%` }} aria-hidden="true" />
        </div>
        {onPractice && (
          <button
            type="button"
            onClick={onPractice}
            className="mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2 font-extrabold uppercase tracking-wide text-primary hover:bg-primary/10"
          >
            <Dumbbell className="w-5 h-5" />
            {t("fail.practise")}
          </button>
        )}
      </main>
      <footer className="border-t-2 border-border">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-5 sm:py-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
          <DuoButton variant="white" size="xl" className="w-full sm:w-[200px]" onClick={onExit}>
            {t("fail.back")}
          </DuoButton>
          <DuoButton size="xl" className="w-full sm:w-[200px]" onClick={onRetry}>
            {t("fail.retry")}
          </DuoButton>
        </div>
      </footer>
    </div>
  );
}

/** "Practise your mistakes": loads the learner's mistakes and plays them as a lesson. */
function PracticeSession() {
  const t = useT();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [round, setRound] = useState<ReturnType<typeof buildPractice> | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    loadMistakes(user?.id ?? null).then((list) => {
      if (cancelled) return;
      if (!list.length) {
        toast.success(t("practice.none"));
        navigate("/", { replace: true });
        return;
      }
      setRound(buildPractice(list));
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, loading, attempt, navigate]);

  if (!round) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary/25 border-t-primary animate-spin" />
      </div>
    );
  }
  return (
    <LessonPlayer
      key={`practice-${attempt}`}
      lesson={round.lesson}
      practice={round.sources}
      onRetry={() => {
        setRound(null);
        setAttempt((a) => a + 1);
      }}
    />
  );
}

const CourseLesson = () => {
  const { lessonId } = useParams();
  const [searchParams] = useSearchParams();
  const preview = searchParams.get("preview") === "1";
  const testOut = searchParams.get("testout") === "1";
  const found = lessonId && lessonId !== "practice" ? findLesson(lessonId) : null;
  const [attempt, setAttempt] = useState(0);
  const { isAllowedLesson } = useCourseAccess();
  if (lessonId === "practice") return <PracticeSession />;
  // Lessons outside the account's allowed units can't be opened by address either.
  if (!found || !found.lesson.exercises || !isAllowedLesson(found.lesson.id)) return <Navigate to="/" replace />;
  return (
    <LessonPlayer
      key={`${found.lesson.id}-${attempt}`}
      lesson={found.lesson}
      onRetry={() => setAttempt((a) => a + 1)}
      preview={preview}
      testOut={testOut && found.lesson.kind === "test" ? found.unit : undefined}
    />
  );
};

export default CourseLesson;
