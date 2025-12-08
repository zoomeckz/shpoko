import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronRight, Star, Sparkles } from "lucide-react";
import { ShpokoMascot } from "@/components/ShpokoMascot";

interface Story {
  id: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  xpReward: number;
  preview: string;
}

const stories: Story[] = [
  {
    id: "morning",
    title: "Good Morning",
    level: "beginner",
    xpReward: 15,
    preview: "A simple story about morning routines...",
  },
  {
    id: "market",
    title: "At the Market",
    level: "beginner",
    xpReward: 15,
    preview: "Shopping for fresh apples...",
  },
  {
    id: "family",
    title: "My Family",
    level: "beginner",
    xpReward: 15,
    preview: "Learn about family members...",
  },
  {
    id: "weather",
    title: "The Weather",
    level: "beginner",
    xpReward: 15,
    preview: "A sunny day outside...",
  },
];

const levelColors = {
  beginner: "bg-green-500/10 text-green-600 border-green-500/30",
  intermediate: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  advanced: "bg-red-500/10 text-red-600 border-red-500/30",
};

export const ShortStories = () => {
  const navigate = useNavigate();

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Short Stories</CardTitle>
          </div>
          <ShpokoMascot expression="studying" size="xs" />
        </div>
        <p className="text-sm text-muted-foreground">
          Read stories & answer questions to earn XP!
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {stories.slice(0, 3).map((story) => (
          <div
            key={story.id}
            onClick={() => navigate(`/stories/${story.id}`)}
            className="p-3 rounded-lg border bg-card hover:border-primary hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">{story.title}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={levelColors[story.level]}>
                  {story.level}
                </Badge>
                <Badge className="bg-primary/10 text-primary border-0">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  {story.xpReward} XP
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{story.preview}</p>
          </div>
        ))}

        <Button 
          onClick={() => navigate("/stories")} 
          className="w-full gap-2"
          variant="outline"
        >
          <Sparkles className="w-4 h-4" />
          View All Stories
          <ChevronRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
