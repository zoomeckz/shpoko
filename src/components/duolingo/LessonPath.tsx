import { LessonNode } from "./LessonNode";
import { useNavigate } from "react-router-dom";
import { lessons } from "@/data/lessons";
import { useUserProgress } from "@/hooks/useUserProgress";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Star, BookOpen, MessageCircle, Mic, Headphones, PenTool } from "lucide-react";

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

  // Add chest nodes after every 4 lessons
  const getNodesWithChests = () => {
    const nodes: Array<{ type: "lesson" | "chest"; lesson?: typeof lessons[0]; index: number }> = [];
    
    lessons.forEach((lesson, i) => {
      nodes.push({ type: "lesson", lesson, index: i });
      
      // Add chest after every 4th lesson
      if ((i + 1) % 4 === 0 && i < lessons.length - 1) {
        nodes.push({ type: "chest", index: i });
      }
    });
    
    return nodes;
  };

  const nodes = getNodesWithChests();

  // Get first 10 lessons for demo
  const displayNodes = nodes.slice(0, 15);

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
                onClick={() => {/* Open chest reward */}}
              />
            </motion.div>
          );
        }

        const lesson = node.lesson!;
        const status = getNodeStatus(lesson.id, node.index);
        const lessonProgress = getLessonProgress(lesson.id);
        const icon = lessonIcons[lesson.category || "default"] || lessonIcons.default;

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
            
            <LessonNode
              status={status}
              position={getPosition(visualIndex)}
              label={lesson.title}
              progress={status === "current" ? lessonProgress : undefined}
              icon={icon}
              onClick={() => {
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
    </div>
  );
};
