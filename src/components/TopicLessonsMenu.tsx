import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, ChevronDown, Palette, Hash, Shapes, MessageSquare, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface TopicLesson {
  id: string;
  title: string;
  icon: React.ReactNode;
  route: string;
}

const topicLessons: TopicLesson[] = [
  { id: "colors", title: "Colors", icon: <Palette className="w-4 h-4" />, route: "/topic/colors" },
  { id: "numbers-topic", title: "Numbers", icon: <Hash className="w-4 h-4" />, route: "/topic/numbers" },
  { id: "shapes", title: "Shapes", icon: <Shapes className="w-4 h-4" />, route: "/topic/shapes" },
  { id: "adjectives", title: "Adjectives", icon: <MessageSquare className="w-4 h-4" />, route: "/topic/adjectives" },
  { id: "adjectives-2", title: "Adjectives 2", icon: <MessageSquare className="w-4 h-4" />, route: "/topic/adjectives-2" },
  { id: "verbs", title: "Verbs", icon: <Zap className="w-4 h-4" />, route: "/topic/verbs" },
];

export const TopicLessonsMenu = () => {
  const navigate = useNavigate();

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Topic Lessons</h3>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Choose Topic
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {topicLessons.map((lesson) => (
                <DropdownMenuItem
                  key={lesson.id}
                  onClick={() => navigate(lesson.route)}
                  className="cursor-pointer"
                >
                  <span className="mr-2">{lesson.icon}</span>
                  {lesson.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Alert className="bg-amber-500/10 border-amber-500/30">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700 text-sm">
            Topic lessons are for practice only and do not reward XP.
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
};
