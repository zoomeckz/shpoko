import { useEffect, useState } from "react";
import { LessonNode } from "./LessonNode";
import { LessonBrowse } from "./LessonBrowse";
import { useNavigate } from "react-router-dom";
import { lessons, DeepDiveLesson, Lesson } from "@/data/lessons";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useGuest } from "@/contexts/GuestContext";
import { useAuth } from "@/contexts/AuthContext";
import { GuestUpgradePrompt } from "@/components/onboarding/GuestUpgradePrompt";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Star, BookOpen, MessageCircle, Mic, Headphones, PenTool, Award, Lock, Map, LayoutGrid } from "lucide-react";
import { toast } from "sonner";

type LessonView = "path" | "browse";
const VIEW_STORAGE_KEY = "shpoko:lesson-view";

interface LessonPathProps {
  className?: string;
}

// Lesson type icons
const lessonIcons: Record<string, React.ReactNode> = {
  vocabulary: <BookOpen className="w-6 h-6" />,
  grammar: <PenTool className="w-6 h-6" />,
  speaking: <Mic className="w-6 h-6" />,
  listening: <Headphones className="w-6 h-6" />,
  conversation: <MessageCircle className="w-6 h-6" />,
  default: <Star className="w-6 h-6" />,
};

export const LessonPath = ({ className }: LessonPathProps) => {
  const navigate = useNavigate();
  const { isLessonCompleted, getLessonProgress } = useUserProgress();
  const { isGuest } = useGuest();
  const { user } = useAuth();
  const [upgradePrompt, setUpgradePrompt] = useState<{ open: boolean; label: string }>({
    open: false,
    label: "this lesson",
  });

  // Guests can only play beginner content. Once a real account is linked, gating lifts.
  const isLockedForGuest = (lesson: Pick<Lesson, "difficulty">) =>
    !user && isGuest && lesson.difficulty !== "beginner";

  // Group lessons into sections of 4-5 for the winding path
  const getPosition = (index: number): "left" | "center" | "right" => {
    const cycle = index % 5;
    const positions: ("left" | "center" | "right")[] = ["center", "right", "center", "left", "center"];
    return positions[cycle];
  };

  const getNodeStatus = (lessonId: string, index: number): "locked" | "available" | "current" | "completed" | "perfect" => {
    const completed = isLessonCompleted(lessonId);
    const lessonProgress = getLessonProgress(lessonId);
    
    if (completed && lessonProgress >= 100) {
      return "perfect";
    }
    if (completed) {
      return "completed";
    }
    
    // First uncompleted lesson is current
    const allLessons = lessons;
    const firstIncompleteIndex = allLessons.findIndex(l => !isLessonCompleted(l.id));
    
    if (index === firstIncompleteIndex) {
      return "current";
    }
    if (index < firstIncompleteIndex || firstIncompleteIndex === -1) {
      return "available";
    }
    
    // Check if previous lesson is completed
    if (index > 0) {
      const prevLesson = allLessons[index - 1];
      if (isLessonCompleted(prevLesson.id)) {
        return "available";
      }
    }
    
    return "locked";
  };

  const handleDeepDiveClick = (deepDive: DeepDiveLesson, parentLesson: Lesson) => {
    // Gate deep dives by their parent lesson's tier — guests can still
    // do beginner-lesson deep dives, everything else prompts to register.
    if (isLockedForGuest(parentLesson)) {
      setUpgradePrompt({ open: true, label: deepDive.title });
      return;
    }

    // Show reward info
    if (deepDive.skinReward || deepDive.badgeReward) {
      const rewards = [];
      if (deepDive.skinReward) rewards.push("🎭 Skin");
      if (deepDive.badgeReward) rewards.push("🏆 Badge");
      toast.info(`Complete for: ${rewards.join(" + ")} + ${deepDive.xpReward} XP`);
    }

    navigate(deepDive.route);
  };

  const isDeepDiveCompleted = (deepDiveId: string): boolean => {
    // Check if the deep dive lesson has been completed
    return isLessonCompleted(deepDiveId);
  };

  // Add chest nodes after every 4 lessons
  const getNodesWithChests = () => {
    const nodes: Array<{ type: "lesson" | "chest" | "milestone"; lesson?: typeof lessons[0]; index: number }> = [];
    
    lessons.forEach((lesson, i) => {
      nodes.push({ type: "lesson", lesson, index: i });
      
      // Add chest after every 4th lesson
      if ((i + 1) % 4 === 0 && i < lessons.length - 1) {
        nodes.push({ type: "chest", index: i });
      }
      
      // Add milestone badge after every 8th lesson
      if ((i + 1) % 8 === 0 && i < lessons.length - 1) {
        nodes.push({ type: "milestone", index: i });
      }
    });
    
    return nodes;
  };

  const nodes = getNodesWithChests();

  // Get first 15 lessons for demo
  const displayNodes = nodes.slice(0, 20);

  return (
    <div className={cn("flex flex-col items-center gap-4 py-8", className)}>
      {/* Section header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xs mb-4"
      >
        <div className="bg-primary text-primary-foreground rounded-2xl px-6 py-4 text-center shadow-[0_4px_0_0_hsl(var(--primary-dark))]">
          <h3 className="font-extrabold text-lg uppercase tracking-wide">Section 1</h3>
          <p className="text-sm opacity-90">Basics</p>
        </div>
      </motion.div>

      {/* Deep dive instruction */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-sm text-muted-foreground px-4 max-w-xs"
      >
        <p>💡 Hover completed lessons to reveal <span className="text-primary font-semibold">deep-dive branches</span> for extra XP, skins & badges!</p>
      </motion.div>

      {/* Start lesson button for current */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        onClick={() => navigate("/learn")}
        className="mb-4 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-[0_4px_0_0_hsl(var(--primary-dark))] hover:brightness-110 active:translate-y-1 active:shadow-none transition-all"
      >
        START LESSON
      </motion.button>

      {/* Lesson nodes */}
      {displayNodes.map((node, visualIndex) => {
        if (node.type === "chest") {
          return (
            <motion.div 
              key={`chest-${node.index}`} 
              className="py-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: visualIndex * 0.05 }}
            >
              <LessonNode
                status="available"
                position="center"
                isChest={true}
                onClick={() => {
                  toast.success("🎁 Chest opened! +50 XP");
                }}
              />
            </motion.div>
          );
        }

        if (node.type === "milestone") {
          return (
            <motion.div 
              key={`milestone-${node.index}`} 
              className="py-6 flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: visualIndex * 0.05 }}
            >
              <div className="bg-gradient-to-r from-warning/20 via-warning/30 to-warning/20 px-6 py-3 rounded-full border-2 border-warning/50 flex items-center gap-2">
                <Award className="w-5 h-5 text-warning" />
                <span className="font-bold text-warning">Milestone {Math.floor(node.index / 8) + 1}</span>
              </div>
            </motion.div>
          );
        }

        const lesson = node.lesson!;
        const status = getNodeStatus(lesson.id, node.index);
        const lessonProgress = getLessonProgress(lesson.id);
        const icon = lessonIcons[lesson.category?.toLowerCase() || "default"] || lessonIcons.default;
        const guestLocked = isLockedForGuest(lesson);

        return (
          <motion.div
            key={lesson.id}
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: visualIndex * 0.05 }}
          >
            {/* Connection line to next node */}
            {visualIndex < displayNodes.length - 1 && (
              <div className="absolute left-1/2 top-full w-1 h-8 bg-muted -translate-x-1/2 rounded-full" />
            )}

            {/* Guest-locked badge — visual hint that this requires registration */}
            {guestLocked && (
              <div
                className={cn(
                  "absolute -top-1 z-10 flex items-center gap-1 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground shadow pointer-events-none",
                  getPosition(visualIndex) === "left" && "left-2",
                  getPosition(visualIndex) === "center" && "left-1/2 -translate-x-1/2",
                  getPosition(visualIndex) === "right" && "right-2"
                )}
              >
                <Lock className="w-2.5 h-2.5" />
                Register
              </div>
            )}

            <LessonNode
              status={status}
              position={getPosition(visualIndex)}
              label={lesson.title}
              progress={status === "current" ? lessonProgress : undefined}
              icon={icon}
              deepDives={lesson.deepDives}
              onDeepDiveClick={(dd) => handleDeepDiveClick(dd, lesson)}
              isDeepDiveCompleted={isDeepDiveCompleted}
              onClick={() => {
                if (guestLocked) {
                  setUpgradePrompt({ open: true, label: lesson.title });
                  return;
                }
                if (lesson.route) {
                  navigate(lesson.route);
                } else {
                  navigate("/learn");
                }
              }}
            />
          </motion.div>
        );
      })}

      <GuestUpgradePrompt
        open={upgradePrompt.open}
        onClose={() => setUpgradePrompt({ open: false, label: "this lesson" })}
        contentLabel={upgradePrompt.label}
      />
    </div>
  );
};
