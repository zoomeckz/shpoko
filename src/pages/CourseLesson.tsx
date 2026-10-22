import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Volume2, VolumeX, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { findLesson, TEACHING_TYPES, type CourseLesson as Lesson, type TextFont } from "@/data/course";
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
} from "@/components/course/exercises";
import shpokoMascot from "@/assets/shpoko-mascot.webp";

const PRAISE = ["Nice!", "Great job!", "Correct!", "Awesome!", "You got it!"];
const EMPTY_ANSWER: AnswerState = { ready: false, correct: false, solution: "" };

type Phase = "answering" | "checked" | "finished";

function LessonPlayer({ lesson, onRetry, preview = false }: { lesson: Lesson; onRetry: () => void; preview?: boolean }) {
  const exercises = lesson.exercises!;
  // Unit tests: no second chances, and a pass mark.
  const isTest = lesson.kind === "test";
  const passMark = lesson.passAccuracy ?? 80;
  const navigate = useNavigate();
  const { user, updateXP, recordActivity } = useAuth();
  const { isGuest, initGuest, addXP, markLessonCompleted, isGuestLessonCompleted } = useGuest();
  const { saveProgress } = useUserProgress();
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
  const [streak, setStreak] = useState(0);
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const startedAt = useRef(Date.now());
  const finishedAt = useRef(0);
  const saved = useRef(false);

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
      } else {
        setStreak(0);
        sfx.wrong();
        setMistakes((m) => new Set(m).add(index));
        // In a lesson the question comes back at the end; in a test it doesn't.
        if (isTest) setDone((d) => new Set(d).add(index));
        else setQueue((q) => [...q, index]);
      }
      setPhase("checked");
    },
    [index, streak, sfx, phase, isTest]
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
      // A focused button already handles Enter as a click.
      if ((e.target as HTMLElement)?.tagName === "BUTTON") return;
      if (e.key === "Enter" && phase !== "finished" && !confirmExit) onPrimary();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPrimary, phase, confirmExit]);

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
    // Full XP the first time, half XP for practising a finished lesson again.
    const practiceXp = Math.ceil(lesson.xp / 2);
    if (user) {
      saveProgress(lesson.id, accuracy, graded - mistakes.size, graded, () => updateXP(lesson.xp))
        .then(async ({ xpAwarded }) => {
          if (!xpAwarded) await updateXP(practiceXp);
          setXpEarned(xpAwarded ? lesson.xp : practiceXp);
          await recordActivity();
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
    if (isTest && accuracy < passMark) {
      return <TestFailed accuracy={accuracy} passMark={passMark} onRetry={onRetry} onExit={() => navigate("/")} />;
    }
    const seconds = Math.round(((finishedAt.current || Date.now()) - startedAt.current) / 1000);
    return (
      <LessonComplete
        xp={xpEarned}
        preview={preview}
        isTest={isTest}
        learned={lesson.description}
        learnedFont={lesson.descriptionFont}
        testMessage={lesson.completeMessage}
        accuracy={accuracy}
        time={`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`}
        onContinue={() => navigate("/")}
      />
    );
  }

  const progress = (done.size / exercises.length) * 100;
  const footerTone = phase === "checked" ? (lastCorrect ? "correct" : "wrong") : "idle";
  const exerciseKey = `${pos}-${index}`;
  const props = { checked: phase === "checked", onChange, onComplete: onMatchComplete };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top: close + progress */}
      <header className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 flex items-center gap-4">
        <button
          type="button"
          onClick={() => (done.size > 0 ? setConfirmExit(true) : navigate("/"))}
          aria-label="Quit lesson"
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
          <span className="rounded-lg bg-warning/15 px-2 py-1 text-xs font-extrabold uppercase tracking-wide text-warning">Preview</span>
        )}
        <button
          type="button"
          onClick={toggleSound}
          aria-label={soundEnabled ? "Mute sound effects" : "Turn on sound effects"}
          aria-pressed={!soundEnabled}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </header>

      {/* Exercise */}
      <main className="flex-1 w-full max-w-[600px] mx-auto px-4 sm:px-6 pt-8 sm:pt-14 pb-10">
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
                  <p className="text-2xl font-extrabold">{lastCorrect ? praise : "Correct solution:"}</p>
                  {!lastCorrect && <p className="text-lg font-bold">{answer.solution}</p>}
                  {"explain" in exercise && exercise.explain && (
                    <p className="text-base font-bold opacity-90">{exercise.explain}</p>
                  )}
                </div>
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
            {phase === "checked" || isIntro ? "Continue" : "Check"}
          </DuoButton>
        </div>
      </footer>

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
                <p className="mt-3 text-2xl font-extrabold text-foreground">Wait, don't go!</p>
                <p className="mt-1 font-semibold text-muted-foreground">You'll lose your progress if you quit now.</p>
                <div className="mt-6 flex flex-col gap-3">
                  <DuoButton size="lg" fullWidth onClick={() => setConfirmExit(false)}>
                    Keep learning
                  </DuoButton>
                  <DuoButton variant="ghost" size="lg" fullWidth className="text-error hover:bg-error/10" onClick={() => navigate("/")}>
                    End session
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

function LessonComplete({
  xp,
  accuracy,
  time,
  learned,
  learnedFont,
  isTest,
  testMessage,
  preview = false,
  onContinue,
}: {
  preview?: boolean;
  /** XP actually earned; null while it's being saved. */
  xp: number | null;
  /** The lesson's letters (space separated) or words (comma separated). */
  learned: string;
  learnedFont?: TextFont;
  isTest: boolean;
  testMessage?: string;
  accuracy: number;
  time: string;
  onContinue: () => void;
}) {
  const chips = (learned.includes(",") ? learned.split(",") : learned.split(" ")).map((s) => s.trim()).filter(Boolean);
  const onlyLetters = chips.every((c) => c.length === 1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Enter" && (e.target as HTMLElement)?.tagName !== "BUTTON" && onContinue();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onContinue]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <motion.img
          src={shpokoMascot}
          alt="Shpoko celebrating"
          className="w-44 h-44 object-contain"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, y: [0, -10, 0] }}
          transition={{ scale: { type: "spring", stiffness: 200 }, y: { duration: 2, repeat: Infinity } }}
        />
        <h1 className="mt-6 text-3xl font-extrabold text-warning">{isTest ? "Unit complete! 🏆" : "Lesson complete!"}</h1>
        {isTest ? (
          <p className="mt-2 max-w-sm text-lg font-bold text-muted-foreground">
            You passed the test. {testMessage ?? "Great work!"}
          </p>
        ) : (
          <p className="mt-2 text-lg font-bold text-muted-foreground">
            {learnedFont === "italic"
              ? "You can read these in italics now:"
              : learnedFont === "handwriting"
                ? "You can read these handwritten now:"
                : onlyLetters
                  ? "New letters you can read now:"
                  : "You can read these now:"}
          </p>
        )}
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {!isTest && chips.map((letter, i) => (
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
        <div className="mt-8 w-full max-w-md flex gap-3">
          <StatTile label="Total XP" value={preview ? "Preview" : xp === null ? "…" : `+${xp}`} tone="yellow" />
          <StatTile label="Accuracy" value={`${accuracy}%`} tone="blue" />
          <StatTile label="Time" value={time} tone="pink" />
        </div>
      </main>
      <footer className="border-t-2 border-border">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-5 sm:py-8 flex sm:justify-end">
          <DuoButton size="xl" className="w-full sm:w-[200px]" onClick={onContinue}>
            Continue
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
}: {
  accuracy: number;
  passMark: number;
  onRetry: () => void;
  onExit: () => void;
}) {
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
        <h1 className="mt-6 text-3xl font-extrabold text-foreground">So close!</h1>
        <p className="mt-2 max-w-sm text-lg font-bold text-muted-foreground">
          You got <span className="text-primary">{accuracy}%</span>. You need {passMark}% to pass. Have another go, you've got this.
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
      </main>
      <footer className="border-t-2 border-border">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-5 sm:py-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
          <DuoButton variant="white" size="xl" className="w-full sm:w-[200px]" onClick={onExit}>
            Back to path
          </DuoButton>
          <DuoButton size="xl" className="w-full sm:w-[200px]" onClick={onRetry}>
            Try again
          </DuoButton>
        </div>
      </footer>
    </div>
  );
}

const CourseLesson = () => {
  const { lessonId } = useParams();
  const [searchParams] = useSearchParams();
  const preview = searchParams.get("preview") === "1";
  const found = lessonId ? findLesson(lessonId) : null;
  const [attempt, setAttempt] = useState(0);
  const { isAllowedLesson } = useCourseAccess();
  // Lessons outside the account's allowed units can't be opened by address either.
  if (!found || !found.lesson.exercises || !isAllowedLesson(found.lesson.id)) return <Navigate to="/" replace />;
  return (
    <LessonPlayer
      key={`${found.lesson.id}-${attempt}`}
      lesson={found.lesson}
      onRetry={() => setAttempt((a) => a + 1)}
      preview={preview}
    />
  );
};

export default CourseLesson;
