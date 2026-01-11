import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Book, MessageCircle, Heart, MapPin, Send, RotateCcw, HelpCircle, Loader2, X } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useToast } from "@/hooks/use-toast";
import { useInputMode } from "@/contexts/InputModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useDailyGameXP } from "@/hooks/useDailyGameXP";
import { useLeague } from "@/hooks/useLeague";
import { supabase } from "@/integrations/supabase/client";

type Scenario = "restaurant" | "compliments" | "directions";
type Gender = "male" | "female";

interface VocabItem {
  bulgarian: string;
  romanized: string;
  english: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ScenarioConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  vocab: VocabItem[];
  exampleSentences: { bulgarian: string; romanized: string; english: string }[];
  completionKeywords: string[];
  maxTurns: number;
}

const scenarioConfigs: Record<string, ScenarioConfig> = {
  restaurant: {
    title: "Restaurant Ordering",
    description: "Order food from a friendly waiter",
    icon: <MessageCircle className="w-8 h-8" />,
    vocab: [
      { bulgarian: "Здравейте", romanized: "Zdraveyte", english: "Hello (formal)" },
      { bulgarian: "Меню", romanized: "Menyu", english: "Menu" },
      { bulgarian: "Вода", romanized: "Voda", english: "Water" },
      { bulgarian: "Ястие", romanized: "Yastie", english: "Dish" },
      { bulgarian: "Сметка", romanized: "Smetka", english: "Bill" },
      { bulgarian: "Благодаря", romanized: "Blagodarya", english: "Thank you" },
      { bulgarian: "Моля", romanized: "Molya", english: "Please" },
      { bulgarian: "Да", romanized: "Da", english: "Yes" },
      { bulgarian: "Не", romanized: "Ne", english: "No" },
      { bulgarian: "Искам", romanized: "Iskam", english: "I want" },
    ],
    exampleSentences: [
      { bulgarian: "Искам вода, моля.", romanized: "Iskam voda, molya.", english: "I want water, please." },
      { bulgarian: "Сметката, моля.", romanized: "Smetkata, molya.", english: "The bill, please." },
      { bulgarian: "Благодаря много.", romanized: "Blagodarya mnogo.", english: "Thank you very much." },
      { bulgarian: "Да, готов съм.", romanized: "Da, gotov sam.", english: "Yes, I'm ready." },
    ],
    completionKeywords: ["smetka", "bill", "довиждане", "goodbye"],
    maxTurns: 8,
  },
  compliments_male: {
    title: "Complimenting Him",
    description: "Tell your boyfriend how handsome he is",
    icon: <Heart className="w-8 h-8" />,
    vocab: [
      { bulgarian: "Красив", romanized: "Krasiv", english: "Beautiful/Handsome (m)" },
      { bulgarian: "Обичам те", romanized: "Obicham te", english: "I love you" },
      { bulgarian: "Очи", romanized: "Ochi", english: "Eyes" },
      { bulgarian: "Усмивка", romanized: "Usmivka", english: "Smile" },
      { bulgarian: "Сърце", romanized: "Sartse", english: "Heart" },
      { bulgarian: "Щастлив", romanized: "Shtastliv", english: "Happy (m)" },
      { bulgarian: "Силен", romanized: "Silen", english: "Strong" },
      { bulgarian: "Любов", romanized: "Lyubov", english: "Love" },
    ],
    exampleSentences: [
      { bulgarian: "Ти си много красив.", romanized: "Ti si mnogo krasiv.", english: "You are very handsome." },
      { bulgarian: "Обичам усмивката ти.", romanized: "Obicham usmivkata ti.", english: "I love your smile." },
      { bulgarian: "Имаш красиви очи.", romanized: "Imash krasivi ochi.", english: "You have beautiful eyes." },
      { bulgarian: "Обичам те!", romanized: "Obicham te!", english: "I love you!" },
    ],
    completionKeywords: ["obicham", "love", "сърце", "heart"],
    maxTurns: 6,
  },
  compliments_female: {
    title: "Complimenting Her",
    description: "Tell your girlfriend how beautiful she is",
    icon: <Heart className="w-8 h-8" />,
    vocab: [
      { bulgarian: "Красива", romanized: "Krasiva", english: "Beautiful (f)" },
      { bulgarian: "Обичам те", romanized: "Obicham te", english: "I love you" },
      { bulgarian: "Очи", romanized: "Ochi", english: "Eyes" },
      { bulgarian: "Усмивка", romanized: "Usmivka", english: "Smile" },
      { bulgarian: "Сърце", romanized: "Sartse", english: "Heart" },
      { bulgarian: "Щастлива", romanized: "Shtastliva", english: "Happy (f)" },
      { bulgarian: "Принцеса", romanized: "Printsesa", english: "Princess" },
      { bulgarian: "Любов", romanized: "Lyubov", english: "Love" },
    ],
    exampleSentences: [
      { bulgarian: "Ти си много красива.", romanized: "Ti si mnogo krasiva.", english: "You are very beautiful." },
      { bulgarian: "Обичам усмивката ти.", romanized: "Obicham usmivkata ti.", english: "I love your smile." },
      { bulgarian: "Имаш красиви очи.", romanized: "Imash krasivi ochi.", english: "You have beautiful eyes." },
      { bulgarian: "Обичам те!", romanized: "Obicham te!", english: "I love you!" },
    ],
    completionKeywords: ["obicham", "love", "сърце", "heart"],
    maxTurns: 6,
  },
  directions: {
    title: "Giving Directions",
    description: "Help someone find the train station",
    icon: <MapPin className="w-8 h-8" />,
    vocab: [
      { bulgarian: "Гара", romanized: "Gara", english: "Station" },
      { bulgarian: "Наляво", romanized: "Nalyavo", english: "Left" },
      { bulgarian: "Надясно", romanized: "Nadyasno", english: "Right" },
      { bulgarian: "Направо", romanized: "Napravo", english: "Straight" },
      { bulgarian: "Улица", romanized: "Ulitsa", english: "Street" },
      { bulgarian: "Близо", romanized: "Blizo", english: "Near" },
      { bulgarian: "Далеч", romanized: "Dalech", english: "Far" },
      { bulgarian: "Завийте", romanized: "Zaviyte", english: "Turn" },
      { bulgarian: "Вървете", romanized: "Varvete", english: "Go/Walk" },
    ],
    exampleSentences: [
      { bulgarian: "Вървете направо.", romanized: "Varvete napravo.", english: "Go straight." },
      { bulgarian: "Завийте наляво.", romanized: "Zaviyte nalyavo.", english: "Turn left." },
      { bulgarian: "Гарата е близо.", romanized: "Garata e blizo.", english: "The station is near." },
      { bulgarian: "Не е далеч.", romanized: "Ne e dalech.", english: "It's not far." },
    ],
    completionKeywords: ["благодаря", "blagodarya", "thank", "goodbye"],
    maxTurns: 6,
  },
};

export default function DialogueBattleGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { playCorrect, playComplete } = useSoundEffects();
  const { inputMode } = useInputMode();
  const { user, updateXP } = useAuth();
  const { hasEarnedToday, markAsEarned, canEarnXP } = useDailyGameXP("dialogue-battle");
  const { addWeeklyXP } = useLeague();

  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [showVocab, setShowVocab] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [xpAwarded, setXpAwarded] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentScenarioKey = selectedScenario === "compliments" && selectedGender 
    ? `compliments_${selectedGender}` 
    : selectedScenario;
  
  const config = currentScenarioKey ? scenarioConfigs[currentScenarioKey] : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (currentScenarioKey && messages.length === 0 && !isLoading) {
      startConversation();
    }
  }, [currentScenarioKey]);

  const startConversation = async () => {
    if (!currentScenarioKey) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("dialogue-chat", {
        body: { scenario: currentScenarioKey, messages: [] },
      });

      if (error) throw error;
      
      setMessages([{ role: "assistant", content: data.reply }]);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text || isLoading || !currentScenarioKey) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);
    setTurnCount((prev) => prev + 1);

    try {
      const { data, error } = await supabase.functions.invoke("dialogue-chat", {
        body: { 
          scenario: currentScenarioKey, 
          messages: updatedMessages,
        },
      });

      if (error) throw error;
      
      const assistantMessage: ChatMessage = { role: "assistant", content: data.reply };
      setMessages([...updatedMessages, assistantMessage]);
      playCorrect();

      // Check for completion
      const lowerReply = data.reply.toLowerCase();
      const isComplete = config?.completionKeywords.some(kw => lowerReply.includes(kw.toLowerCase())) 
        || turnCount >= (config?.maxTurns || 8) - 1;

      if (isComplete) {
        handleGameComplete();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const requestHint = async () => {
    if (isLoading || !currentScenarioKey) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("dialogue-chat", {
        body: { 
          scenario: currentScenarioKey, 
          messages: messages,
          isHint: true,
        },
      });

      if (error) throw error;
      
      toast({
        title: "💡 Hint",
        description: data.reply,
        duration: 8000,
      });
    } catch (error) {
      console.error("Failed to get hint:", error);
      toast({
        title: "Error",
        description: "Failed to get hint. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGameComplete = () => {
    playComplete();
    setGameComplete(true);
    
    const baseXP = Math.max(10, 30 - turnCount * 2);
    
    if (user?.id && canEarnXP) {
      updateXP(baseXP);
      addWeeklyXP(baseXP);
      markAsEarned();
      setXpAwarded(baseXP);
      toast({
        title: "Dialogue Complete! 🎉",
        description: `You earned ${baseXP} XP!`,
      });
    } else if (hasEarnedToday) {
      toast({
        title: "Dialogue Complete!",
        description: "Practice mode - XP already earned today!",
      });
    }
  };

  const resetGame = () => {
    setMessages([]);
    setTurnCount(0);
    setGameComplete(false);
    setXpAwarded(0);
    setTimeout(() => startConversation(), 100);
  };

  const handleBack = () => {
    if (gameComplete || messages.length > 0) {
      setMessages([]);
      setTurnCount(0);
      setGameComplete(false);
      setSelectedScenario(null);
      setSelectedGender(null);
      setXpAwarded(0);
    } else if (selectedGender) {
      setSelectedGender(null);
    } else if (selectedScenario) {
      setSelectedScenario(null);
    } else {
      const fromCategory = location.state?.fromCategory || "games";
      navigate("/", { state: { activeCategory: fromCategory } });
    }
  };

  // Scenario selection screen
  if (!selectedScenario) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <h1 className="text-3xl font-bold text-center mb-2">Dialogue Battle</h1>
          <p className="text-muted-foreground text-center mb-8">Practice real conversations with AI in Bulgarian</p>

          <div className="grid gap-4">
            <Card
              className="p-6 cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedScenario("restaurant")}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Restaurant Ordering</h3>
                  <p className="text-muted-foreground">Order food from a friendly waiter</p>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedScenario("compliments")}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-full text-pink-600">
                  <Heart className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Sweet Compliments</h3>
                  <p className="text-muted-foreground">Tell your partner how beautiful they are</p>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedScenario("directions")}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600">
                  <MapPin className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Giving Directions</h3>
                  <p className="text-muted-foreground">Help someone find the train station</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Gender selection for compliments
  if (selectedScenario === "compliments" && !selectedGender) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <h1 className="text-3xl font-bold text-center mb-2">Sweet Compliments</h1>
          <p className="text-muted-foreground text-center mb-8">Who would you like to compliment?</p>

          <div className="grid grid-cols-2 gap-4">
            <Card
              className="p-6 cursor-pointer hover:border-primary transition-colors text-center"
              onClick={() => setSelectedGender("female")}
            >
              <div className="text-4xl mb-2">👩</div>
              <h3 className="font-semibold">Her</h3>
              <p className="text-sm text-muted-foreground">Girlfriend</p>
            </Card>

            <Card
              className="p-6 cursor-pointer hover:border-primary transition-colors text-center"
              onClick={() => setSelectedGender("male")}
            >
              <div className="text-4xl mb-2">👨</div>
              <h3 className="font-semibold">Him</h3>
              <p className="text-sm text-muted-foreground">Boyfriend</p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Main chat interface
  return (
    <div className="min-h-screen bg-background flex">
      {/* Vocab sidebar */}
      {showVocab && config && (
        <div className="w-80 border-r bg-card p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Book className="w-4 h-4" /> Vocabulary
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setShowVocab(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="space-y-3">
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase">Words</h4>
                {config.vocab.map((item, i) => (
                  <div key={i} className="p-2 bg-muted/50 rounded text-sm">
                    <div className="font-medium">{item.bulgarian}</div>
                    <div className="text-muted-foreground text-xs">{item.romanized}</div>
                    <div className="text-primary text-xs">{item.english}</div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 pt-4 border-t">
                <h4 className="text-xs font-medium text-muted-foreground uppercase">Example Sentences</h4>
                {config.exampleSentences.map((item, i) => (
                  <div key={i} className="p-2 bg-muted/50 rounded text-sm">
                    <div className="font-medium">{item.bulgarian}</div>
                    <div className="text-muted-foreground text-xs">{item.romanized}</div>
                    <div className="text-primary text-xs">{item.english}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="font-semibold">{config?.title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Progress indicator */}
            <div className="text-sm text-muted-foreground">
              Turn {turnCount}/{config?.maxTurns || 8}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVocab(!showVocab)}
            >
              <Book className="w-4 h-4 mr-1" />
              Vocab
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetGame}
              disabled={isLoading}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            
            {gameComplete && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎉</div>
                <h2 className="text-xl font-bold mb-2">Conversation Complete!</h2>
                {xpAwarded > 0 ? (
                  <p className="text-primary font-medium">+{xpAwarded} XP earned!</p>
                ) : hasEarnedToday ? (
                  <p className="text-muted-foreground">Practice mode - XP already earned today</p>
                ) : null}
                <div className="flex justify-center gap-2 mt-4">
                  <Button onClick={resetGame}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={handleBack}>
                    Choose Another
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input area */}
        {!gameComplete && (
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={requestHint}
                disabled={isLoading || messages.length === 0}
                title="Get a hint"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
              
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={inputMode === "bulgarian" ? "Напишете на български..." : "Type in Bulgarian (romanized)..."}
                disabled={isLoading}
                className="flex-1"
              />
              
              <Button
                onClick={() => sendMessage()}
                disabled={isLoading || !inputValue.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Type your response in Bulgarian or click 💡 for a hint
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
