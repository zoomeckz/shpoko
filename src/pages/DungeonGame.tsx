import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Heart, Skull, Zap, Star, Shield, SkipForward, Gift } from "lucide-react";
import { useAdventure, AdventureNode } from "@/hooks/useAdventure";
import { useAuth } from "@/contexts/AuthContext";
import { useCachedTTS } from "@/hooks/useCachedTTS";
import { ShpokoMascot } from "@/components/ShpokoMascot";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Dungeon room types
type RoomType = "challenge" | "powerup" | "boss";

interface DungeonRoom {
  id: number;
  type: RoomType;
  question?: {
    bulgarian: string;
    english: string;
    options: string[];
    correctIndex: number;
  };
  powerup?: string;
}

// Sample dungeon questions
const dungeonQuestions = [
  { bulgarian: "Здравей", english: "Hello", options: ["Здравей", "Довиждане", "Благодаря", "Моля"], correctIndex: 0 },
  { bulgarian: "Благодаря", english: "Thank you", options: ["Моля", "Здравей", "Благодаря", "Да"], correctIndex: 2 },
  { bulgarian: "Къща", english: "House", options: ["Котка", "Куче", "Къща", "Кола"], correctIndex: 2 },
  { bulgarian: "Вода", english: "Water", options: ["Хляб", "Вода", "Месо", "Мляко"], correctIndex: 1 },
  { bulgarian: "Обичам те", english: "I love you", options: ["Здравей", "Довиждане", "Обичам те", "Благодаря"], correctIndex: 2 },
  { bulgarian: "Добро утро", english: "Good morning", options: ["Добър ден", "Добро утро", "Добър вечер", "Лека нощ"], correctIndex: 1 },
  { bulgarian: "Котка", english: "Cat", options: ["Куче", "Птица", "Риба", "Котка"], correctIndex: 3 },
  { bulgarian: "Един", english: "One", options: ["Два", "Три", "Един", "Четири"], correctIndex: 2 },
];

const powerups = ["extra_life", "free_skip", "xp_boost"];

const generateDungeon = (totalRooms: number): DungeonRoom[] => {
  const rooms: DungeonRoom[] = [];
  const shuffledQuestions = [...dungeonQuestions].sort(() => Math.random() - 0.5);
  let questionIndex = 0;

  for (let i = 1; i <= totalRooms; i++) {
    if (i === totalRooms) {
      // Boss room
      rooms.push({
        id: i,
        type: "boss",
        question: shuffledQuestions[questionIndex % shuffledQuestions.length],
      });
    } else if (i % 3 === 0) {
      // Powerup room every 3rd room
      rooms.push({
        id: i,
        type: "powerup",
        powerup: powerups[Math.floor(Math.random() * powerups.length)],
      });
    } else {
      // Challenge room
      rooms.push({
        id: i,
        type: "challenge",
        question: shuffledQuestions[questionIndex % shuffledQuestions.length],
      });
      questionIndex++;
    }
  }

  return rooms;
};

const DungeonGame = () => {
  const navigate = useNavigate();
  const { dungeonId } = useParams<{ dungeonId: string }>();
  const { user, profile, updateXP } = useAuth();
  const { nodes, currentDungeonRun, startDungeonRun, advanceRoom, collectPowerup, useSkip, completeNode } = useAdventure();
  const { speak } = useCachedTTS();
  const { toast } = useToast();

  const [dungeonNode, setDungeonNode] = useState<AdventureNode | null>(null);
  const [rooms, setRooms] = useState<DungeonRoom[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameState, setGameState] = useState<"intro" | "playing" | "victory" | "defeat">("intro");

  useEffect(() => {
    if (dungeonId && nodes.length > 0) {
      const node = nodes.find(n => n.id === dungeonId);
      if (node && node.is_dungeon) {
        setDungeonNode(node);
        setRooms(generateDungeon(5));
      }
    }
  }, [dungeonId, nodes]);

  const handleStartDungeon = async () => {
    if (!dungeonId || !user) return;
    
    const run = await startDungeonRun(dungeonId);
    if (run) {
      setGameState("playing");
    }
  };

  const currentRoom = rooms[currentDungeonRun?.current_room ? currentDungeonRun.current_room - 1 : 0];

  const handleSelectAnswer = (index: number) => {
    if (showResult || !currentRoom?.question) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const correct = index === currentRoom.question.correctIndex;
    
    if (correct) {
      speak(currentRoom.question.bulgarian);
    }

    // Process answer after delay
    setTimeout(async () => {
      const xpGained = correct ? (currentRoom.type === "boss" ? 50 : 20) : 0;
      await advanceRoom(correct, xpGained);

      if (!correct && currentDungeonRun && currentDungeonRun.lives_remaining <= 1) {
        setGameState("defeat");
        toast({
          title: "Dungeon Failed",
          description: `You earned ${currentDungeonRun.xp_earned} XP!`,
        });
        if (currentDungeonRun.xp_earned > 0) {
          updateXP(currentDungeonRun.xp_earned);
        }
      } else if (correct && currentDungeonRun && currentDungeonRun.current_room >= currentDungeonRun.total_rooms) {
        setGameState("victory");
        const bonusXP = dungeonNode?.xp_reward || 100;
        const totalXP = currentDungeonRun.xp_earned + xpGained + bonusXP;
        toast({
          title: "Dungeon Complete!",
          description: `You earned ${totalXP} XP including ${bonusXP} bonus!`,
        });
        updateXP(totalXP);
        if (dungeonId) {
          completeNode(dungeonId, totalXP);
        }
      } else {
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 1500);
  };

  const handleCollectPowerup = async () => {
    if (!currentRoom?.powerup) return;
    
    await collectPowerup(currentRoom.powerup);
    
    const powerupNames: Record<string, string> = {
      extra_life: "Extra Life",
      free_skip: "Free Skip",
      xp_boost: "XP Boost",
    };
    
    toast({
      title: "Powerup Collected!",
      description: powerupNames[currentRoom.powerup] || currentRoom.powerup,
    });

    await advanceRoom(true, 10);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleUseSkip = async () => {
    if (!currentDungeonRun || currentDungeonRun.free_skips <= 0) return;
    
    await useSkip();
    setSelectedAnswer(null);
    setShowResult(false);
    toast({ title: "Skipped!", description: "Moving to next room..." });
  };

  if (!dungeonNode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading dungeon...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950/50 via-background to-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/adventure")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Skull className="w-5 h-5 text-purple-400" />
            {dungeonNode.title}
          </h1>
          <div className="w-10" />
        </div>

        {/* Game states */}
        {gameState === "intro" && (
          <Card className="text-center bg-gradient-to-br from-purple-500/10 to-red-500/10">
            <CardHeader>
              <div className="mx-auto mb-4">
                <ShpokoMascot size="lg" />
              </div>
              <CardTitle className="text-2xl">{dungeonNode.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{dungeonNode.description}</p>
              <div className="flex justify-center gap-6 py-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-red-400">
                    <Heart className="w-5 h-5" />
                    <span className="font-bold">3</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Lives</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-purple-400">
                    <Skull className="w-5 h-5" />
                    <span className="font-bold">5</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Rooms</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-400">
                    <Star className="w-5 h-5" />
                    <span className="font-bold">{dungeonNode.xp_reward}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Bonus XP</p>
                </div>
              </div>
              {user ? (
                <Button size="lg" className="w-full" onClick={handleStartDungeon}>
                  <Zap className="w-5 h-5 mr-2" />
                  Enter Dungeon
                </Button>
              ) : (
                <Button size="lg" className="w-full" onClick={() => navigate("/auth")}>
                  Sign In to Play
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {gameState === "playing" && currentDungeonRun && currentRoom && (
          <>
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: currentDungeonRun.max_lives }).map((_, i) => (
                    <Heart
                      key={i}
                      className={cn(
                        "w-5 h-5",
                        i < currentDungeonRun.lives_remaining ? "text-red-500 fill-red-500" : "text-gray-600"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm">Room {currentDungeonRun.current_room}/{currentDungeonRun.total_rooms}</span>
                <span className="text-sm text-yellow-400">+{currentDungeonRun.xp_earned} XP</span>
              </div>
              <Progress value={(currentDungeonRun.current_room / currentDungeonRun.total_rooms) * 100} />
            </div>

            {/* Room content */}
            {currentRoom.type === "powerup" ? (
              <Card className="text-center bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
                <CardContent className="py-8">
                  <Gift className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                  <h2 className="text-xl font-bold mb-2">Treasure Room!</h2>
                  <p className="text-muted-foreground mb-6">You found a powerup!</p>
                  <Button size="lg" onClick={handleCollectPowerup}>
                    {currentRoom.powerup === "extra_life" && <Heart className="w-5 h-5 mr-2" />}
                    {currentRoom.powerup === "free_skip" && <SkipForward className="w-5 h-5 mr-2" />}
                    {currentRoom.powerup === "xp_boost" && <Star className="w-5 h-5 mr-2" />}
                    Collect {currentRoom.powerup?.replace("_", " ")}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className={cn(
                currentRoom.type === "boss" && "border-purple-500/50 bg-purple-500/5"
              )}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {currentRoom.type === "boss" ? (
                        <>
                          <Skull className="w-5 h-5 text-purple-400" />
                          Boss Challenge
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5 text-blue-400" />
                          Challenge
                        </>
                      )}
                    </CardTitle>
                    {currentDungeonRun.free_skips > 0 && (
                      <Button variant="outline" size="sm" onClick={handleUseSkip}>
                        <SkipForward className="w-4 h-4 mr-1" />
                        Skip ({currentDungeonRun.free_skips})
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <p className="text-lg text-muted-foreground mb-2">What is this in Bulgarian?</p>
                    <p className="text-3xl font-bold text-primary">{currentRoom.question?.english}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {currentRoom.question?.options.map((option, index) => {
                      const isSelected = selectedAnswer === index;
                      const isCorrect = index === currentRoom.question?.correctIndex;
                      
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          size="lg"
                          className={cn(
                            "h-auto py-4 text-lg transition-all",
                            showResult && isCorrect && "bg-green-500/20 border-green-500 text-green-400",
                            showResult && isSelected && !isCorrect && "bg-red-500/20 border-red-500 text-red-400"
                          )}
                          onClick={() => handleSelectAnswer(index)}
                          disabled={showResult}
                        >
                          {option}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {gameState === "victory" && (
          <Card className="text-center bg-gradient-to-br from-green-500/10 to-yellow-500/10">
            <CardContent className="py-8">
              <ShpokoMascot size="lg" />
              <h2 className="text-2xl font-bold text-green-400 mt-4">Victory!</h2>
              <p className="text-muted-foreground mt-2">You conquered the dungeon!</p>
              <div className="flex justify-center gap-2 mt-4">
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              </div>
              <Button size="lg" className="mt-6" onClick={() => navigate("/adventure")}>
                Continue Adventure
              </Button>
            </CardContent>
          </Card>
        )}

        {gameState === "defeat" && (
          <Card className="text-center bg-gradient-to-br from-red-500/10 to-gray-500/10">
            <CardContent className="py-8">
              <Skull className="w-16 h-16 mx-auto text-red-400" />
              <h2 className="text-2xl font-bold text-red-400 mt-4">Defeated</h2>
              <p className="text-muted-foreground mt-2">But you earned {currentDungeonRun?.xp_earned || 0} XP!</p>
              <div className="flex gap-4 justify-center mt-6">
                <Button variant="outline" onClick={() => navigate("/adventure")}>
                  Return to Map
                </Button>
                <Button onClick={() => {
                  setGameState("intro");
                  setRooms(generateDungeon(5));
                }}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DungeonGame;
