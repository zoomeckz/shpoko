import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Lock, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { course, type CourseLesson } from "@/data/course";
import { useUserProgress } from "@/hooks/useUserProgress";
import shpokoMascot from "@/assets/shpoko-mascot.png";

// Horizontal offsets (px) that make the path wind left and right.
const OFFSETS = [0, 45, 70, 45, 0, -45, -70, -45];

type NodeStatus = "completed" | "current" | "soon" | "locked";

export const CoursePath = () => {
  const navigate = useNavigate();
  const { isLessonCompleted } = useUserProgress();
  const [openId, setOpenId] = useState<string | null>(null);
  const pathRef = useRef<HTMLDivElement>(null);

  // Close the lesson card when clicking anywhere else.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (pathRef.current && !pathRef.current.contains(e.target as Node)) setOpenId(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div className="py-6 space-y-12" ref={pathRef}>
      {course.map((unit) => {
        const statusOf = (lesson: CourseLesson, i: number): NodeStatus => {
          if (isLessonCompleted(lesson.id)) return "completed";
          const unlocked = unit.lessons.slice(0, i).every((l) => isLessonCompleted(l.id));
          if (!unlocked) return "locked";
          return lesson.exercises ? "current" : "soon";
        };

        return (
          <section key={unit.id}>
            <div className="sticky top-16 lg:top-6 z-20 rounded-2xl bg-primary px-5 py-4 text-primary-foreground shadow-[0_4px_0_0_hsl(var(--primary-dark))]">
              <p className="text-sm font-extrabold uppercase tracking-widest opacity-80">
                Section {unit.section}, Unit {unit.unit}
              </p>
              <p className="text-xl font-extrabold">{unit.title}</p>
            </div>

            <div className="relative mt-20 flex flex-col items-center gap-7">
              <img
                src={shpokoMascot}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute right-0 sm:right-4 top-24 w-28 sm:w-36 object-contain opacity-95"
              />

              {unit.lessons.map((lesson, i) => {
                const status = statusOf(lesson, i);
                const open = openId === lesson.id;
                return (
                  <div
                    key={lesson.id}
                    className="relative flex flex-col items-center"
                    style={{ transform: `translateX(${OFFSETS[i % OFFSETS.length]}px)`, zIndex: open ? 40 : 1 }}
                  >
                    {status === "current" && !open && (
                      <motion.span
                        className="absolute -top-12 z-10 rounded-xl border-2 border-border bg-background px-3 py-2 text-sm font-extrabold uppercase tracking-wide text-primary whitespace-nowrap"
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
                        "relative w-[72px] h-[64px] rounded-[50%] flex items-center justify-center transition-transform active:translate-y-1.5",
                        (status === "current" || status === "completed") &&
                          "bg-primary text-primary-foreground shadow-[0_7px_0_0_hsl(var(--primary-dark))] active:shadow-none",
                        status === "current" && "ring-[10px] ring-primary/20",
                        (status === "locked" || status === "soon") &&
                          "bg-muted text-muted-foreground/60 border-2 border-border shadow-[0_7px_0_0_hsl(var(--border))] active:shadow-none"
                      )}
                    >
                      {status === "completed" && <Check className="w-8 h-8" strokeWidth={4} />}
                      {status === "current" && <Star className="w-8 h-8 fill-current" />}
                      {(status === "locked" || status === "soon") && <Lock className="w-7 h-7" />}
                    </button>

                    <AnimatePresence>
                      {open && (
                        <LessonCard
                          lesson={lesson}
                          number={i + 1}
                          total={unit.lessons.length}
                          status={status}
                          onStart={() => navigate(`/course/${lesson.id}`)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
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
  onStart,
}: {
  lesson: CourseLesson;
  number: number;
  total: number;
  status: NodeStatus;
  onStart: () => void;
}) {
  const playable = status === "current" || status === "completed";
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "absolute top-[84px] z-30 w-[280px] rounded-2xl p-4 text-left",
        playable ? "bg-primary text-primary-foreground" : "bg-muted border-2 border-border text-muted-foreground"
      )}
    >
      <p className={cn("text-lg font-extrabold", !playable && "text-foreground")}>{lesson.title}</p>
      <p className="mt-0.5 font-bold opacity-90">
        Lesson {number} of {total} · {lesson.description}
      </p>
      {playable ? (
        <button
          type="button"
          onClick={onStart}
          className="mt-4 w-full h-12 rounded-2xl bg-white text-primary font-extrabold uppercase tracking-wide shadow-[0_4px_0_0_hsl(0_0%_0%/0.15)] active:translate-y-1 active:shadow-none transition-transform"
        >
          {status === "completed" ? "Practice again" : `Start +${lesson.xp} XP`}
        </button>
      ) : (
        <>
          <p className="mt-3 text-sm font-bold">
            {status === "soon" ? "This lesson is coming soon!" : "Complete all lessons above to unlock this!"}
          </p>
          <div className="mt-4 w-full h-12 rounded-2xl bg-border/60 flex items-center justify-center font-extrabold uppercase tracking-wide text-muted-foreground">
            Locked
          </div>
        </>
      )}
    </motion.div>
  );
}
