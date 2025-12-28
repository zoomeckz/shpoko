import { LessonNode } from "./LessonNode";
import { useNavigate } from "react-router-dom";
import { lessons } from "@/data/lessons";
import { useUserProgress } from "@/hooks/useUserProgress";
import { cn } from "@/lib/utils";

interface LessonPathProps {
  className?: string;
}

export const LessonPath = ({ className }: LessonPathProps) => {
  const navigate = useNavigate();
  const { progress, isLessonCompleted, getLessonProgress } = useUserProgress();

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

  return (
    <div className={cn("flex flex-col items-center gap-4 py-8", className)}>
      {/* Section header */}
      <div className="w-full max-w-xs mb-4">
        <div className="bg-primary text-primary-foreground rounded-xl px-6 py-3 text-center">
          <h3 className="font-bold text-lg uppercase tracking-wide">Section 1</h3>
          <p className="text-sm opacity-80">Basics</p>
        </div>
      </div>

      {/* Lesson nodes */}
      {nodes.map((node, visualIndex) => {
        if (node.type === "chest") {
          return (
            <div key={`chest-${node.index}`} className="py-4">
              <LessonNode
                status="available"
                position="center"
                isChest={true}
                onClick={() => {/* Open chest reward */}}
              />
            </div>
          );
        }

        const lesson = node.lesson!;
        const status = getNodeStatus(lesson.id, node.index);
        const lessonProgress = getLessonProgress(lesson.id);

        return (
          <div key={lesson.id} className="relative">
            {/* Connection line to next node */}
            {visualIndex < nodes.length - 1 && (
              <div className="absolute left-1/2 top-full w-1 h-8 bg-muted -translate-x-1/2" />
            )}
            
            <LessonNode
              status={status}
              position={getPosition(visualIndex)}
              label={lesson.title}
              progress={status === "current" ? lessonProgress : undefined}
              icon={<span className="text-2xl">📚</span>}
              onClick={() => {
                if (lesson.route) {
                  navigate(lesson.route);
                }
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
