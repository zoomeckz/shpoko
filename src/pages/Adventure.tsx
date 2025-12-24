import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Lock, Check, Skull, Star, Zap } from "lucide-react";
import { useAdventure, AdventureNode } from "@/hooks/useAdventure";
import { useAuth } from "@/contexts/AuthContext";
import { ShpokoMascot } from "@/components/ShpokoMascot";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";

const Adventure = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { nodes, progress, loading, isNodeUnlocked, isNodeCompleted, getCurrentWeek } = useAdventure();

  // Find current position (first incomplete unlocked node)
  const currentNodeIndex = nodes.findIndex(node => 
    isNodeUnlocked(node) && !isNodeCompleted(node.id)
  );
  const currentNode = currentNodeIndex >= 0 ? nodes[currentNodeIndex] : nodes[nodes.length - 1];

  const handleNodeClick = (node: AdventureNode) => {
    if (!isNodeUnlocked(node)) return;
    
    if (node.is_dungeon) {
      navigate(`/adventure/dungeon/${node.id}`);
    } else {
      // Navigate to the lesson with adventure mode flag
      const lessonRoutes: Record<string, string> = {
        'cyrillic-alphabet': '/lesson/cyrillic',
        'basic-greetings': '/lesson/greetings',
        'numbers-1-20': '/lesson/numbers',
        'pronouns-topic': '/topic/pronouns',
        'colors-topic': '/topic/colors',
        'survival-phrases-topic': '/topic/survival-phrases',
        'food-drinks-starter-topic': '/topic/food-drinks-starter',
        'animals-topic': '/topic/animals',
        'weekdays-topic': '/topic/weekdays',
        'family-topic': '/topic/family',
        'adjectives-topic': '/topic/adjectives',
        'verbs-topic': '/topic/verbs',
        'directions-beginner': '/topic/directions-beginner',
        'weather-topic': '/topic/weather',
        'jobs-topic': '/topic/jobs',
        'restaurant-topic': '/topic/restaurant',
        'essential-verbs-topic': '/topic/essential-verbs',
        'shapes-topic': '/topic/shapes',
        'adjectives-2-topic': '/topic/adjectives-2',
        'numbers-topic': '/topic/numbers',
      };
      
      const route = lessonRoutes[node.lesson_id];
      if (route) {
        navigate(`${route}?adventure=${node.id}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ShpokoMascot size="lg" />
        <p className="ml-4 text-lg">Loading adventure...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <Header streak={profile?.streak || 0} hearts={5} xp={profile?.xp || 0} dailyGoalProgress={50} />
      
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Adventure Mode</h1>
              <p className="text-sm text-muted-foreground">Week {getCurrentWeek()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="font-bold">{profile?.xp || 0} XP</span>
          </div>
        </div>

        {!user && (
          <Card className="p-4 mb-6 bg-primary/10 border-primary/20">
            <p className="text-center text-sm">Sign in to save your adventure progress!</p>
            <Button className="w-full mt-2" onClick={() => navigate("/auth")}>Sign In</Button>
          </Card>
        )}

        {/* Roadmap */}
        <div className="relative">
          {/* Path line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/30 via-primary/20 to-transparent -translate-x-1/2 rounded-full" />

          {/* Nodes */}
          <div className="relative space-y-8">
            {nodes.map((node, index) => {
              const unlocked = isNodeUnlocked(node);
              const completed = isNodeCompleted(node.id);
              const isCurrent = node.id === currentNode?.id;
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={node.id}
                  className={cn(
                    "flex items-center gap-4",
                    isLeft ? "flex-row" : "flex-row-reverse"
                  )}
                >
                  {/* Node content */}
                  <div className={cn("flex-1", isLeft ? "text-right" : "text-left")}>
                    <Card
                      className={cn(
                        "p-4 cursor-pointer transition-all duration-300",
                        completed && "bg-green-500/10 border-green-500/30",
                        isCurrent && !completed && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                        !unlocked && "opacity-50 cursor-not-allowed",
                        node.is_dungeon && "bg-gradient-to-br from-purple-500/10 to-red-500/10 border-purple-500/30"
                      )}
                      onClick={() => handleNodeClick(node)}
                    >
                      <div className={cn("flex items-center gap-3", isLeft ? "flex-row-reverse" : "flex-row")}>
                        {node.is_dungeon ? (
                          <div className="p-2 rounded-lg bg-purple-500/20">
                            <Skull className="w-6 h-6 text-purple-400" />
                          </div>
                        ) : completed ? (
                          <div className="p-2 rounded-lg bg-green-500/20">
                            <Check className="w-6 h-6 text-green-500" />
                          </div>
                        ) : !unlocked ? (
                          <div className="p-2 rounded-lg bg-muted">
                            <Lock className="w-6 h-6 text-muted-foreground" />
                          </div>
                        ) : (
                          <div className="p-2 rounded-lg bg-primary/20">
                            <Zap className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{node.title}</h3>
                          <p className="text-xs text-muted-foreground">{node.description}</p>
                          <p className="text-xs text-primary mt-1">+{node.xp_reward} XP</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Center node marker */}
                  <div className="relative z-10">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all",
                        completed && "bg-green-500 border-green-400",
                        isCurrent && !completed && "bg-primary border-primary animate-pulse",
                        !unlocked && !completed && "bg-muted border-muted-foreground/20",
                        unlocked && !completed && !isCurrent && "bg-background border-primary/50",
                        node.is_dungeon && !completed && "bg-purple-500/20 border-purple-500"
                      )}
                    >
                      {isCurrent && !completed && (
                        <ShpokoMascot size="xs" />
                      )}
                      {completed && (
                        <Check className="w-6 h-6 text-white" />
                      )}
                      {!unlocked && !completed && (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      )}
                      {unlocked && !completed && !isCurrent && (
                        <span className="font-bold text-sm">{node.node_number}</span>
                      )}
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />
                </div>
              );
            })}
          </div>

          {/* Coming soon indicator */}
          <div className="text-center mt-8 text-muted-foreground">
            <p className="text-sm">More adventures coming next week...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Adventure;
