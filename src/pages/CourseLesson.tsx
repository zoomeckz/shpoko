import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Volume2, VolumeX, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { findLesson, type CourseLesson as Lesson } from "@/data/course";
import { useAuth } from "@/contexts/AuthContext";
import { useGuest } from "@/contexts/GuestContext";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useSfx } from "@/hooks/useSfx";
import { useSoundSettings } from "@/contexts/SoundSettingsContext";
import { DuoButton } from "@/components/duolingo/DuoButton";
import {
  AnswerState,
  BuildExercise,
  ChoiceExercise,
  FamiliarExercise,
  IntroExercise,
  MatchExercise,
} from "@/components/course/exercises";
import shpokoMascot from "@/assets/shpoko-mascot.png";

const PRAISE = ["Nice!", "Great job!", "Correct!", "Awesome!", "You got it!"];
const EMPTY_ANSWER: AnswerState = { ready: false, correct: false, solution: "" };

type Phase = "answering" | "checked" | "finished";

function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const exercises = lesson.exercises!;
  const navigate = useNavigate();
  const { user, updateXP } = useAuth();
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
  const startedAt = useRef(Date.now());
  const saved = useRef(false);

  const index = queue[pos];
  const exercise = exercises[index];
  // Teaching screens are just read and continued, not graded.
  const isIntro = exercise?.type === "intro" || exercise?.type === "familiar";
  const graded = exercises.filter((e) => e.type !== "intro" && e.type !== "familiar").length;
  const accuracy = Math.round(((graded - mistakes.size) / graded) * 100);

  // Visitors who land here directly still get their progress remembered.
  useEffect(() => {
    if (!user && !isGuest) initGuest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = useCallback((state: AnswerState) => setAnswer(state), []);

  const markResult = useCallback(
    (correct: boolean) => {
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
        setQueue((q) => [...q, index]);
      }
      setPhase("checked");
    },
    [index, streak, sfx]
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
    sfx.complete();
    if (user) {
      saveProgress(lesson.id, accuracy, graded - mistakes.size, graded, () => updateXP(lesson.xp));
    } else {
      if (!isGuestLessonCompleted(lesson.id)) addXP(lesson.xp);
      markLessonCompleted(lesson.id, accuracy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === "finished") {
    const seconds = Math.round((Date.now() - startedAt.current) / 1000);
    return (
      <LessonComplete
        xp={lesson.xp}
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
  onContinue,
}: {
  xp: number;
  accuracy: number;
  time: string;
  onContinue: () => void;
}) {
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
        <h1 className="mt-6 text-3xl font-extrabold text-warning">Lesson complete!</h1>
        <p className="mt-2 text-lg font-bold text-muted-foreground">You can read your first Bulgarian words.</p>
        <div className="mt-8 w-full max-w-md flex gap-3">
          <StatTile label="Total XP" value={`${xp}`} tone="yellow" />
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

const CourseLesson = () => {
  const { lessonId } = useParams();
  const found = lessonId ? findLesson(lessonId) : null;
  if (!found || !found.lesson.exercises) return <Navigate to="/" replace />;
  return <LessonPlayer key={found.lesson.id} lesson={found.lesson} />;
};

export default CourseLesson;
