import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { InputModeProvider } from "@/contexts/InputModeContext";
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
import Stories from "./pages/Stories";
import ContextoGame from "./pages/ContextoGame";
import TierAssessment from "./pages/TierAssessment";
import RapidFireGame from "./pages/RapidFireGame";
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
import WeatherLesson from "./pages/topic/WeatherLesson";
import AnimalsLesson from "./pages/topic/AnimalsLesson";
import JobsLesson from "./pages/topic/JobsLesson";
import FamilyLesson from "./pages/topic/FamilyLesson";
import RestaurantOrderingLesson from "./pages/topic/RestaurantOrderingLesson";
import SynonymsLesson from "./pages/topic/SynonymsLesson";
import DialogueBattleGame from "./pages/DialogueBattleGame";
const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <InputModeProvider>
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
              {/* Stories */}
              <Route path="/stories" element={<Stories />} />
              <Route path="/stories/:storyId" element={<Stories />} />
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
              <Route path="/topic/weather" element={<WeatherLesson />} />
              <Route path="/topic/animals" element={<AnimalsLesson />} />
              <Route path="/topic/jobs" element={<JobsLesson />} />
              <Route path="/topic/family" element={<FamilyLesson />} />
              <Route path="/topic/restaurant-ordering" element={<RestaurantOrderingLesson />} />
              <Route path="/topic/synonyms" element={<SynonymsLesson />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </InputModeProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;