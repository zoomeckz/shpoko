import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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
// Topic Lessons
import ColorsLesson from "./pages/topic/ColorsLesson";
import NumbersTopicLesson from "./pages/topic/NumbersTopicLesson";
import ShapesLesson from "./pages/topic/ShapesLesson";
import AdjectivesLesson from "./pages/topic/AdjectivesLesson";
import Adjectives2Lesson from "./pages/topic/Adjectives2Lesson";
import VerbsLesson from "./pages/topic/VerbsLesson";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/about" element={<About />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/lesson/cyrillic" element={<CyrillicLesson />} />
            <Route path="/lesson/greetings" element={<GreetingsLesson />} />
            <Route path="/lesson/numbers" element={<NumbersLesson />} />
            <Route path="/lesson/type-in" element={<TypeInLesson />} />
            <Route path="/lesson/fill-blanks" element={<FillBlanksLesson />} />
            <Route path="/lesson/match-cyrillic" element={<MatchCyrillicLesson />} />
            <Route path="/lesson/choose-word" element={<ChooseWordLesson />} />
            {/* Topic Lessons (no XP) */}
            <Route path="/topic/colors" element={<ColorsLesson />} />
            <Route path="/topic/numbers" element={<NumbersTopicLesson />} />
            <Route path="/topic/shapes" element={<ShapesLesson />} />
            <Route path="/topic/adjectives" element={<AdjectivesLesson />} />
            <Route path="/topic/adjectives-2" element={<Adjectives2Lesson />} />
            <Route path="/topic/verbs" element={<VerbsLesson />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
