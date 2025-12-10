import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Book, MessageCircle, Heart, MapPin, ChevronRight, Check, X } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useToast } from "@/hooks/use-toast";
import { useInputMode } from "@/contexts/InputModeContext";

type Scenario = "restaurant" | "compliments" | "directions";
type Gender = "male" | "female";

interface VocabItem {
  bulgarian: string;
  romanized: string;
  english: string;
}

interface DialogueStep {
  speaker: "npc" | "player";
  bulgarian: string;
  romanized: string;
  english: string;
  options?: {
    bulgarian: string;
    romanized: string;
    english: string;
    correct: boolean;
  }[];
}

interface ScenarioData {
  title: string;
  description: string;
  icon: React.ReactNode;
  vocab: VocabItem[];
  exampleSentences: { bulgarian: string; romanized: string; english: string }[];
  dialogue: DialogueStep[];
}

const restaurantScenario: ScenarioData = {
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
  ],
  exampleSentences: [
    { bulgarian: "Искам вода, моля.", romanized: "Iskam voda, molya.", english: "I want water, please." },
    { bulgarian: "Сметката, моля.", romanized: "Smetkata, molya.", english: "The bill, please." },
    { bulgarian: "Благодаря много.", romanized: "Blagodarya mnogo.", english: "Thank you very much." },
  ],
  dialogue: [
    {
      speaker: "npc",
      bulgarian: "Здравейте! Добре дошли!",
      romanized: "Zdraveyte! Dobre doshli!",
      english: "Hello! Welcome!",
    },
    {
      speaker: "player",
      bulgarian: "",
      romanized: "",
      english: "How do you respond?",
      options: [
        { bulgarian: "Здравейте!", romanized: "Zdraveyte!", english: "Hello!", correct: true },
        { bulgarian: "Довиждане!", romanized: "Dovizhdane!", english: "Goodbye!", correct: false },
        { bulgarian: "Лека нощ!", romanized: "Leka nosht!", english: "Good night!", correct: false },
      ],
    },
    {
      speaker: "npc",
      bulgarian: "Искате ли вода?",
      romanized: "Iskate li voda?",
      english: "Would you like water?",
    },
    {
      speaker: "player",
      bulgarian: "",
      romanized: "",
      english: "How do you respond?",
      options: [
        { bulgarian: "Да, моля.", romanized: "Da, molya.", english: "Yes, please.", correct: true },
        { bulgarian: "Аз съм котка.", romanized: "Az sam kotka.", english: "I am a cat.", correct: false },
        { bulgarian: "Къде е?", romanized: "Kade e?", english: "Where is it?", correct: false },
      ],
    },
    {
      speaker: "npc",
      bulgarian: "Готови ли сте да поръчате?",
      romanized: "Gotovi li ste da porachate?",
      english: "Are you ready to order?",
    },
    {
      speaker: "player",
      bulgarian: "",
      romanized: "",
      english: "How do you respond?",
      options: [
        { bulgarian: "Да, готов съм.", romanized: "Da, gotov sam.", english: "Yes, I'm ready.", correct: true },
        { bulgarian: "Не разбирам.", romanized: "Ne razbiram.", english: "I don't understand.", correct: false },
        { bulgarian: "Колко е часът?", romanized: "Kolko e chasat?", english: "What time is it?", correct: false },
      ],
    },
    {
      speaker: "npc",
      bulgarian: "Ето сметката.",
      romanized: "Eto smetkata.",
      english: "Here is the bill.",
    },
    {
      speaker: "player",
      bulgarian: "",
      romanized: "",
      english: "How do you respond?",
      options: [
        { bulgarian: "Благодаря!", romanized: "Blagodarya!", english: "Thank you!", correct: true },
        { bulgarian: "Съжалявам.", romanized: "Sazhalyavam.", english: "I'm sorry.", correct: false },
        { bulgarian: "Помощ!", romanized: "Pomosht!", english: "Help!", correct: false },
      ],
    },
  ],
};

const getComplimentsScenario = (gender: Gender): ScenarioData => ({
  title: gender === "female" ? "Complimenting Her" : "Complimenting Him",
  description: `Tell your ${gender === "female" ? "girlfriend" : "boyfriend"} how beautiful they are`,
  icon: <Heart className="w-8 h-8" />,
  vocab: [
    { bulgarian: "Красив", romanized: "Krasiv", english: "Beautiful (m)" },
    { bulgarian: "Красива", romanized: "Krasiva", english: "Beautiful (f)" },
    { bulgarian: "Обичам те", romanized: "Obicham te", english: "I love you" },
    { bulgarian: "Очи", romanized: "Ochi", english: "Eyes" },
    { bulgarian: "Усмивка", romanized: "Usmivka", english: "Smile" },
    { bulgarian: "Сърце", romanized: "Sartse", english: "Heart" },
    { bulgarian: "Щастлив", romanized: "Shtastliv", english: "Happy (m)" },
    { bulgarian: "Щастлива", romanized: "Shtastliva", english: "Happy (f)" },
  ],
  exampleSentences: [
    { 
      bulgarian: gender === "female" ? "Ти си много красива." : "Ти си много красив.", 
      romanized: gender === "female" ? "Ti si mnogo krasiva." : "Ti si mnogo krasiv.", 
      english: "You are very beautiful." 
    },
    { bulgarian: "Обичам усмивката ти.", romanized: "Obicham usmivkata ti.", english: "I love your smile." },
    { bulgarian: "Имаш красиви очи.", romanized: "Imash krasivi ochi.", english: "You have beautiful eyes." },
  ],
  dialogue: [
    {
      speaker: "npc",
      bulgarian: "Здравей, скъпи!",
      romanized: "Zdravey, skapi!",
      english: "Hello, dear!",
    },
    {
      speaker: "player",
      bulgarian: "",
      romanized: "",
      english: "How do you greet them?",
      options: [
        { bulgarian: "Здравей, любов!", romanized: "Zdravey, lyubov!", english: "Hello, love!", correct: true },
        { bulgarian: "Кой си ти?", romanized: "Koy si ti?", english: "Who are you?", correct: false },
        { bulgarian: "Гладен съм.", romanized: "Gladen sam.", english: "I'm hungry.", correct: false },
      ],
    },
    {
      speaker: "npc",
      bulgarian: "Как изглеждам днес?",
      romanized: "Kak izglezhdam dnes?",
      english: "How do I look today?",
    },
    {
      speaker: "player",
      bulgarian: "",
      romanized: "",
      english: "Give a compliment:",
      options: [
        { 
          bulgarian: gender === "female" ? "Много си красива!" : "Много си красив!", 
          romanized: gender === "female" ? "Mnogo si krasiva!" : "Mnogo si krasiv!", 
          english: "You are very beautiful!", 
          correct: true 
        },
        { bulgarian: "Не знам.", romanized: "Ne znam.", english: "I don't know.", correct: false },
        { bulgarian: "Къде е банята?", romanized: "Kade e banyata?", english: "Where is the bathroom?", correct: false },
      ],
    },
    {
      speaker: "npc",
      bulgarian: "Ти си толкова мил!",
      romanized: "Ti si tolkova mil!",
      english: "You are so sweet!",
    },
    {
      speaker: "player",
      bulgarian: "",
      romanized: "",
      english: "Express your feelings:",
      options: [
        { bulgarian: "Обичам те!", romanized: "Obicham te!", english: "I love you!", correct: true },
        { bulgarian: "Време е да вървя.", romanized: "Vreme e da varvya.", english: "It's time to go.", correct: false },
        { bulgarian: "Уморен съм.", romanized: "Umoren sam.", english: "I'm tired.", correct: false },
      ],
    },
    {
      speaker: "npc",
      bulgarian: "И аз те обичам!",
      romanized: "I az te obicham!",
      english: "I love you too!",
    },
    {
      speaker: "player",
      bulgarian: "",
      romanized: "",
      english: "Say something sweet:",
      options: [
        { bulgarian: "Имаш красиви очи.", romanized: "Imash krasivi ochi.", english: "You have beautiful eyes.", correct: true },
        { bulgarian: "Искам кафе.", romanized: "Iskam kafe.", english: "I want coffee.", correct: false },
        { bulgarian: "Студено е.", romanized: "Studeno e.", english: "It's cold.", correct: false },
      ],
    },
  ],
});

const directionsScenario: ScenarioData = {
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
    { bulgarian: "Тук", romanized: "Tuk", english: "Here" },
  ],
  exampleSentences: [
    { bulgarian: "Вървете направо.", romanized: "Varvete napravo.", english: "Go straight." },
    { bulgarian: "Завийте наляво.", romanized: "Zaviyte nalyavo.", english: "Turn left." },
    { bulgarian: "Гарата е близо.", romanized: "Garata e blizo.", english: "The station is near." },
  ],
  dialogue: [
    {
      speaker: "npc",
      bulgarian: "Извинете, къде е гарата?",
      romanized: "Izvinete, kade e garata?",
      english: "Excuse me, where is the station?",
    },
    {
      speaker: "player",
      bulgarian: "",
      romanized: "",
      english: "Give the first direction:",
      options: [
        { bulgarian: "Вървете направо.", romanized: "Varvete napravo.", english: "Go straight.", correct: true },
        { bulgarian: "Не говоря български.", romanized: "Ne govorya balgarski.", english: "I don't speak Bulgarian.", correct: false },
        { bulgarian: "Обичам пица.", romanized: "Obicham pitsa.", english: "I love pizza.", correct: false },
      ],
    },
    {
      speaker: "npc",
      bulgarian: "Добре, и после?",
      romanized: "Dobre, i posle?",
      english: "Okay, and then?",
    },
    {
      speaker: "player",
      bulgarian: "",
      romanized: "",
      english: "Give the next direction:",
      options: [
        { bulgarian: "Завийте наляво.", romanized: "Zaviyte nalyavo.", english: "Turn left.", correct: true },
        { bulgarian: "Искам сладолед.", romanized: "Iskam sladoled.", english: "I want ice cream.", correct: false },
        { bulgarian: "Котката спи.", romanized: "Kotkata spi.", english: "The cat is sleeping.", correct: false },
      ],
    },
    {
      speaker: "npc",
      bulgarian: "Далеч ли е?",
      romanized: "Dalech li e?",
      english: "Is it far?",
    },
    {
      speaker: "player",
      bulgarian: "",
      romanized: "",
      english: "Tell them the distance:",
      options: [
        { bulgarian: "Не, близо е.", romanized: "Ne, blizo e.", english: "No, it's near.", correct: true },
        { bulgarian: "Да, много далеч.", romanized: "Da, mnogo dalech.", english: "Yes, very far.", correct: false },
        { bulgarian: "Не знам.", romanized: "Ne znam.", english: "I don't know.", correct: false },
      ],
    },
    {
      speaker: "npc",
      bulgarian: "Благодаря много!",
      romanized: "Blagodarya mnogo!",
      english: "Thank you very much!",
    },
    {
      speaker: "player",
      bulgarian: "",
      romanized: "",
      english: "Respond politely:",
      options: [
        { bulgarian: "Моля! Приятен ден!", romanized: "Molya! Priyaten den!", english: "You're welcome! Have a nice day!", correct: true },
        { bulgarian: "Гладен съм.", romanized: "Gladen sam.", english: "I'm hungry.", correct: false },
        { bulgarian: "Трябва да вървя.", romanized: "Tryabva da varvya.", english: "I have to go.", correct: false },
      ],
    },
  ],
};

export default function DialogueBattleGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { playCorrect, playIncorrect, playComplete } = useSoundEffects();
  const { inputMode } = useInputMode();

  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [showVocab, setShowVocab] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const getScenarioData = useCallback((): ScenarioData | null => {
    if (!selectedScenario) return null;
    if (selectedScenario === "restaurant") return restaurantScenario;
    if (selectedScenario === "compliments" && selectedGender) return getComplimentsScenario(selectedGender);
    if (selectedScenario === "directions") return directionsScenario;
    return null;
  }, [selectedScenario, selectedGender]);

  const scenarioData = getScenarioData();

  const handleBack = () => {
    if (showVocab) {
      setShowVocab(false);
    } else if (gameComplete) {
      setGameComplete(false);
      setCurrentStep(0);
      setScore(0);
      setSelectedScenario(null);
      setSelectedGender(null);
    } else if (currentStep > 0) {
      setSelectedScenario(null);
      setSelectedGender(null);
      setCurrentStep(0);
      setScore(0);
    } else if (selectedGender) {
      setSelectedGender(null);
    } else if (selectedScenario) {
      setSelectedScenario(null);
    } else {
      const fromCategory = location.state?.fromCategory || "games";
      navigate("/", { state: { activeCategory: fromCategory } });
    }
  };

  const handleSelectOption = (index: number, correct: boolean) => {
    if (showFeedback) return;
    
    setSelectedOption(index);
    setShowFeedback(true);

    if (correct) {
      playCorrect();
      setScore((prev) => prev + 10);
    } else {
      playIncorrect();
    }

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      
      // Find next player turn or end game
      const dialogue = scenarioData?.dialogue || [];
      let nextStep = currentStep + 1;
      
      // Skip NPC lines to find next player turn
      while (nextStep < dialogue.length && dialogue[nextStep].speaker === "npc") {
        nextStep++;
      }
      
      // Check if next step is a player turn
      if (nextStep < dialogue.length && dialogue[nextStep].options) {
        setCurrentStep(nextStep);
      } else {
        // Game complete
        playComplete();
        setGameComplete(true);
      }
    }, 1500);
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
          <p className="text-muted-foreground text-center mb-8">Practice real conversations in Bulgarian</p>

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
                  <h3 className="text-xl font-semibold">Restaurant Ordering</h3>
                  <p className="text-muted-foreground">Order food from a friendly waiter</p>
                </div>
                <ChevronRight className="w-6 h-6 ml-auto text-muted-foreground" />
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
                  <h3 className="text-xl font-semibold">Sweet Compliments</h3>
                  <p className="text-muted-foreground">Tell your partner how beautiful they are</p>
                </div>
                <ChevronRight className="w-6 h-6 ml-auto text-muted-foreground" />
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
                  <h3 className="text-xl font-semibold">Giving Directions</h3>
                  <p className="text-muted-foreground">Help someone find the train station</p>
                </div>
                <ChevronRight className="w-6 h-6 ml-auto text-muted-foreground" />
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

          <h1 className="text-3xl font-bold text-center mb-2">Who are you complimenting?</h1>
          <p className="text-muted-foreground text-center mb-8">Choose your partner's gender for correct grammar</p>

          <div className="grid grid-cols-2 gap-4">
            <Card
              className="p-6 cursor-pointer hover:border-primary transition-colors text-center"
              onClick={() => setSelectedGender("female")}
            >
              <div className="text-6xl mb-4">👩</div>
              <h3 className="text-xl font-semibold">Her</h3>
              <p className="text-sm text-muted-foreground">Girlfriend / Wife</p>
            </Card>

            <Card
              className="p-6 cursor-pointer hover:border-primary transition-colors text-center"
              onClick={() => setSelectedGender("male")}
            >
              <div className="text-6xl mb-4">👨</div>
              <h3 className="text-xl font-semibold">Him</h3>
              <p className="text-sm text-muted-foreground">Boyfriend / Husband</p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!scenarioData) return null;

  // Vocab/Examples view
  if (showVocab) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Game
          </Button>

          <h1 className="text-2xl font-bold mb-6">{scenarioData.title} - Study Materials</h1>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Book className="w-5 h-5" /> Vocabulary
            </h2>
            <div className="grid gap-2">
              {scenarioData.vocab.map((item, i) => (
                <Card key={i} className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold">{item.bulgarian}</span>
                      <span className="text-muted-foreground ml-2">({item.romanized})</span>
                    </div>
                    <span className="text-primary">{item.english}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Example Sentences</h2>
            <div className="grid gap-3">
              {scenarioData.exampleSentences.map((sentence, i) => (
                <Card key={i} className="p-4">
                  <p className="font-semibold">{sentence.bulgarian}</p>
                  <p className="text-muted-foreground text-sm">{sentence.romanized}</p>
                  <p className="text-primary mt-1">{sentence.english}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game complete screen
  if (gameComplete) {
    const maxScore = scenarioData.dialogue.filter(d => d.options).length * 10;
    const percentage = Math.round((score / maxScore) * 100);

    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-2">Dialogue Complete!</h1>
          <p className="text-muted-foreground mb-4">{scenarioData.title}</p>
          
          <div className="text-4xl font-bold text-primary mb-2">{score} pts</div>
          <p className="text-muted-foreground mb-6">{percentage}% accuracy</p>

          <div className="grid gap-3">
            <Button onClick={() => {
              setCurrentStep(0);
              setScore(0);
              setGameComplete(false);
            }}>
              Play Again
            </Button>
            <Button variant="outline" onClick={() => setShowVocab(true)}>
              <Book className="w-4 h-4 mr-2" /> Review Vocab
            </Button>
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Menu
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Main game view
  const dialogue = scenarioData.dialogue;
  const currentDialogue = dialogue[currentStep];

  // Get all dialogue up to current step for display
  const displayDialogue: DialogueStep[] = [];
  for (let i = 0; i <= currentStep; i++) {
    if (dialogue[i].speaker === "npc") {
      displayDialogue.push(dialogue[i]);
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowVocab(true)}>
            <Book className="w-4 h-4 mr-2" /> Vocab
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">{scenarioData.title}</h1>
          <div className="text-lg font-semibold text-primary">{score} pts</div>
        </div>

        {/* Dialogue history */}
        <div className="space-y-4 mb-6">
          {displayDialogue.map((d, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl shrink-0">
                🧑
              </div>
              <Card className="p-4 flex-1">
                <p className="font-semibold">{d.bulgarian}</p>
                <p className="text-sm text-muted-foreground">{d.romanized}</p>
                <p className="text-sm text-primary mt-1">{d.english}</p>
              </Card>
            </div>
          ))}
        </div>

        {/* Player options */}
        {currentDialogue.options && (
          <div className="space-y-3">
            <p className="text-center text-muted-foreground mb-4">{currentDialogue.english}</p>
            {currentDialogue.options.map((option, i) => {
              const isSelected = selectedOption === i;
              const showResult = showFeedback && isSelected;
              
              return (
                <Card
                  key={i}
                  className={`p-4 cursor-pointer transition-all ${
                    showResult
                      ? option.correct
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "hover:border-primary"
                  } ${showFeedback && !isSelected ? "opacity-50" : ""}`}
                  onClick={() => handleSelectOption(i, option.correct)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {inputMode === "bulgarian" ? option.bulgarian : option.romanized}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {inputMode === "bulgarian" ? option.romanized : option.bulgarian}
                      </p>
                      <p className="text-sm text-primary mt-1">{option.english}</p>
                    </div>
                    {showResult && (
                      option.correct 
                        ? <Check className="w-6 h-6 text-green-500" />
                        : <X className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
