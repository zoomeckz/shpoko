import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { InputModeProvider } from "@/contexts/InputModeContext";
import { LanguageModeProvider } from "@/contexts/LanguageModeContext";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import About from "./pages/About";
import { CyrillicLesson } from "./pages/CyrillicLesson";
import { GreetingsLesson } from "./pages/GreetingsLesson";
import { NumbersLesson } from "./pages/NumbersLesson";
import TypeInLesson from "./pages/TypeInLesson";
import FillBlanksLesson from "./pages/FillBlanksLesson";
import MatchCyrillicLesson from "./pages/MatchCyrillicLesson";
import ChooseWordLesson from "./pages/ChooseWordLesson";
import Leaderboard from "./pages/Leaderboard";
import Premium from "./pages/Premium";
import NotFound from "./pages/NotFound";
import LingqReader from "./pages/LingqReader";
import ChildrenStories from "./pages/ChildrenStories";
import ContextoGame from "./pages/ContextoGame";
import TierAssessment from "./pages/TierAssessment";
import ConjugationGame from "./pages/ConjugationGame";
import PhraseClozeCombat from "./pages/PhraseClozeCombat";
import FixMyBulgarianGame from "./pages/FixMyBulgarianGame";
import ListeningFillGame from "./pages/ListeningFillGame";
// Topic Lessons
import ColorsLesson from "./pages/topic/ColorsLesson";
import NumbersTopicLesson from "./pages/topic/NumbersTopicLesson";
import ShapesLesson from "./pages/topic/ShapesLesson";
import AdjectivesLesson from "./pages/topic/AdjectivesLesson";
import Adjectives2Lesson from "./pages/topic/Adjectives2Lesson";
import VerbsLesson from "./pages/topic/VerbsLesson";
import WeekdaysLesson from "./pages/topic/WeekdaysLesson";
import FoodDrinksLesson from "./pages/topic/FoodDrinksLesson";
import RestaurantLesson from "./pages/topic/RestaurantLesson";
import DirectionsLesson from "./pages/topic/DirectionsLesson";
import DirectionsBeginnerLesson from "./pages/topic/DirectionsBeginnerLesson";
import DirectionsIntermediateLesson from "./pages/topic/DirectionsIntermediateLesson";
import DirectionsAdvancedLesson from "./pages/topic/DirectionsAdvancedLesson";
import WeatherLesson from "./pages/topic/WeatherLesson";
import AnimalsLesson from "./pages/topic/AnimalsLesson";
import JobsLesson from "./pages/topic/JobsLesson";
import FamilyLesson from "./pages/topic/FamilyLesson";
import RestaurantOrderingLesson from "./pages/topic/RestaurantOrderingLesson";
import SynonymsLesson from "./pages/topic/SynonymsLesson";
import DialogueBattleGame from "./pages/DialogueBattleGame";
import PronounsLesson from "./pages/topic/PronounsLesson";
import EssentialVerbsLesson from "./pages/topic/EssentialVerbsLesson";
import SurvivalPhrasesLesson from "./pages/topic/SurvivalPhrasesLesson";
import FoodDrinksStarterLesson from "./pages/topic/FoodDrinksStarterLesson";
import ParticlesBeginnerLesson from "./pages/topic/ParticlesBeginnerLesson";
import ParticlesIntermediateLesson from "./pages/topic/ParticlesIntermediateLesson";
import ParticlesAdvancedLesson from "./pages/topic/ParticlesAdvancedLesson";
import { CyrillicLettersLesson } from "./pages/topic/CyrillicLettersLesson";
// Spanish Lessons
import SpanishAlphabetLesson from "./pages/spanish/SpanishAlphabetLesson";
import SpanishGreetingsLesson from "./pages/spanish/SpanishGreetingsLesson";
import SpanishNumbersLesson from "./pages/spanish/SpanishNumbersLesson";
import SpanishColorsLesson from "./pages/spanish/SpanishColorsLesson";
import SpanishAnimalsLesson from "./pages/spanish/SpanishAnimalsLesson";
import SpanishFamilyLesson from "./pages/spanish/SpanishFamilyLesson";
import SpanishFoodLesson from "./pages/spanish/SpanishFoodLesson";
// Quiz
import QuizPage from "./pages/QuizPage";
// Adventure & Flashcards
import Adventure from "./pages/Adventure";
import DungeonGame from "./pages/DungeonGame";
import Flashcards from "./pages/Flashcards";
import FlashcardStudy from "./pages/FlashcardStudy";
// Lesson Screen
import LessonScreen from "./pages/LessonScreen";
// Forum & Roguelike
import Forum from "./pages/Forum";
import ForumCategory from "./pages/ForumCategory";
import ForumThread from "./pages/ForumThread";
import RoguelikeMap from "./pages/RoguelikeMap";
// Mini Games
import ShpokoFruitGame from "./pages/ShpokoFruitGame";
// Profile & Quests
import Profile from "./pages/Profile";
import Quests from "./pages/Quests";
import AchievementsPage from "./pages/AchievementsPage";
import Friends from "./pages/Friends";
import Shop from "./pages/Shop";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <InputModeProvider>
            <LanguageModeProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/about" element={<About />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/contexto" element={<ContextoGame />} />
              <Route path="/assessment/:tier" element={<TierAssessment />} />
              <Route path="/game/rapid-fire" element={<RapidFireGame />} />
              <Route path="/game/conjugation" element={<ConjugationGame />} />
              <Route path="/game/cloze-combat" element={<PhraseClozeCombat />} />
              <Route path="/game/fix-bulgarian" element={<FixMyBulgarianGame />} />
              <Route path="/game/listening-fill" element={<ListeningFillGame />} />
              <Route path="/game/dialogue-battle" element={<DialogueBattleGame />} />
              <Route path="/lesson/cyrillic" element={<CyrillicLesson />} />
              <Route path="/lesson/greetings" element={<GreetingsLesson />} />
              <Route path="/lesson/numbers" element={<NumbersLesson />} />
              <Route path="/lesson/type-in" element={<TypeInLesson />} />
              <Route path="/lesson/fill-blanks" element={<FillBlanksLesson />} />
              <Route path="/lesson/match-cyrillic" element={<MatchCyrillicLesson />} />
              <Route path="/lesson/choose-word" element={<ChooseWordLesson />} />
              {/* Scenarios - LingQ Reader */}
              <Route path="/scenarios" element={<LingqReader />} />
              <Route path="/scenarios/:storyId" element={<LingqReader />} />
              {/* Children's Stories */}
              <Route path="/children-stories" element={<ChildrenStories />} />
              <Route path="/children-stories/:storyId" element={<ChildrenStories />} />
              {/* Topic Lessons */}
              <Route path="/topic/colors" element={<ColorsLesson />} />
              <Route path="/topic/numbers" element={<NumbersTopicLesson />} />
              <Route path="/topic/shapes" element={<ShapesLesson />} />
              <Route path="/topic/adjectives" element={<AdjectivesLesson />} />
              <Route path="/topic/adjectives-2" element={<Adjectives2Lesson />} />
              <Route path="/topic/verbs" element={<VerbsLesson />} />
              <Route path="/topic/weekdays" element={<WeekdaysLesson />} />
              <Route path="/topic/food-drinks" element={<FoodDrinksLesson />} />
              <Route path="/topic/restaurant" element={<RestaurantLesson />} />
              <Route path="/topic/directions" element={<DirectionsLesson />} />
              <Route path="/topic/directions-beginner" element={<DirectionsBeginnerLesson />} />
              <Route path="/topic/directions-intermediate" element={<DirectionsIntermediateLesson />} />
              <Route path="/topic/directions-advanced" element={<DirectionsAdvancedLesson />} />
              <Route path="/topic/weather" element={<WeatherLesson />} />
              <Route path="/topic/animals" element={<AnimalsLesson />} />
              <Route path="/topic/jobs" element={<JobsLesson />} />
              <Route path="/topic/family" element={<FamilyLesson />} />
              <Route path="/topic/restaurant-ordering" element={<RestaurantOrderingLesson />} />
              <Route path="/topic/synonyms" element={<SynonymsLesson />} />
              <Route path="/topic/pronouns" element={<PronounsLesson />} />
              <Route path="/topic/essential-verbs" element={<EssentialVerbsLesson />} />
              <Route path="/topic/survival-phrases" element={<SurvivalPhrasesLesson />} />
              <Route path="/topic/food-drinks-starter" element={<FoodDrinksStarterLesson />} />
              <Route path="/topic/particles-beginner" element={<ParticlesBeginnerLesson />} />
              <Route path="/topic/particles-intermediate" element={<ParticlesIntermediateLesson />} />
              <Route path="/topic/particles-advanced" element={<ParticlesAdvancedLesson />} />
              <Route path="/topic/cyrillic-letters" element={<CyrillicLettersLesson />} />
              {/* Spanish Lessons */}
              <Route path="/spanish/alphabet" element={<SpanishAlphabetLesson />} />
              <Route path="/spanish/greetings" element={<SpanishGreetingsLesson />} />
              <Route path="/spanish/numbers" element={<SpanishNumbersLesson />} />
              <Route path="/spanish/colors" element={<SpanishColorsLesson />} />
              <Route path="/spanish/animals" element={<SpanishAnimalsLesson />} />
              <Route path="/spanish/family" element={<SpanishFamilyLesson />} />
              <Route path="/spanish/food" element={<SpanishFoodLesson />} />
              {/* Quiz */}
              <Route path="/quiz" element={<QuizPage />} />
              {/* Adventure Mode */}
              <Route path="/adventure" element={<Adventure />} />
              <Route path="/adventure/dungeon/:dungeonId" element={<DungeonGame />} />
              {/* Flashcards */}
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/flashcards/:deckId" element={<FlashcardStudy />} />
              {/* Lesson Screen */}
              <Route path="/learn" element={<LessonScreen />} />
              <Route path="/learn/:lessonId" element={<LessonScreen />} />
              {/* Forum */}
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/:categoryId" element={<ForumCategory />} />
              <Route path="/forum/thread/:threadId" element={<ForumThread />} />
{/* Roguelike */}
              <Route path="/roguelike" element={<RoguelikeMap />} />
              {/* Mini Games */}
              <Route path="/game/fruit-slicer" element={<ShpokoFruitGame />} />
              {/* Profile & Quests */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/quests" element={<Quests />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="*" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </LanguageModeProvider>
            </InputModeProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;