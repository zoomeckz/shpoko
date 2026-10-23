import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { GuestProvider } from "@/contexts/GuestContext";
import { InputModeProvider } from "@/contexts/InputModeContext";
import { LanguageModeProvider } from "@/contexts/LanguageModeContext";
import { SoundSettingsProvider } from "@/contexts/SoundSettingsContext";
import { ThemeProvider } from "next-themes";
import { RouteGate } from "@/components/RouteGate";
import { SHOW_LEGACY } from "@/config/features";
import { I18nProvider } from "@/i18n";
import { lazy, Suspense, useEffect } from "react";
import { initSmoothScroll } from "@/lib/smoothScroll";
import Index from "./pages/Index";
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const About = lazy(() => import("./pages/About"));
const CyrillicLesson = lazy(() => import("./pages/CyrillicLesson").then((m) => ({ default: m.CyrillicLesson })));
const GreetingsLesson = lazy(() => import("./pages/GreetingsLesson").then((m) => ({ default: m.GreetingsLesson })));
const NumbersLesson = lazy(() => import("./pages/NumbersLesson").then((m) => ({ default: m.NumbersLesson })));
const TypeInLesson = lazy(() => import("./pages/TypeInLesson"));
const FillBlanksLesson = lazy(() => import("./pages/FillBlanksLesson"));
const MatchCyrillicLesson = lazy(() => import("./pages/MatchCyrillicLesson"));
const ChooseWordLesson = lazy(() => import("./pages/ChooseWordLesson"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Premium = lazy(() => import("./pages/Premium"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LingqReader = lazy(() => import("./pages/LingqReader"));
const ChildrenStories = lazy(() => import("./pages/ChildrenStories"));
const ContextoGame = lazy(() => import("./pages/ContextoGame"));
const TierAssessment = lazy(() => import("./pages/TierAssessment"));
const ConjugationGame = lazy(() => import("./pages/ConjugationGame"));
const PhraseClozeCombat = lazy(() => import("./pages/PhraseClozeCombat"));
const FixMyBulgarianGame = lazy(() => import("./pages/FixMyBulgarianGame"));
const ListeningFillGame = lazy(() => import("./pages/ListeningFillGame"));
// Topic Lessons
const ColorsLesson = lazy(() => import("./pages/topic/ColorsLesson"));
const NumbersTopicLesson = lazy(() => import("./pages/topic/NumbersTopicLesson"));
const ShapesLesson = lazy(() => import("./pages/topic/ShapesLesson"));
const AdjectivesLesson = lazy(() => import("./pages/topic/AdjectivesLesson"));
const Adjectives2Lesson = lazy(() => import("./pages/topic/Adjectives2Lesson"));
const VerbsLesson = lazy(() => import("./pages/topic/VerbsLesson"));
const WeekdaysLesson = lazy(() => import("./pages/topic/WeekdaysLesson"));
const FoodDrinksLesson = lazy(() => import("./pages/topic/FoodDrinksLesson"));
const RestaurantLesson = lazy(() => import("./pages/topic/RestaurantLesson"));
const DirectionsLesson = lazy(() => import("./pages/topic/DirectionsLesson"));
const DirectionsBeginnerLesson = lazy(() => import("./pages/topic/DirectionsBeginnerLesson"));
const DirectionsIntermediateLesson = lazy(() => import("./pages/topic/DirectionsIntermediateLesson"));
const DirectionsAdvancedLesson = lazy(() => import("./pages/topic/DirectionsAdvancedLesson"));
const WeatherLesson = lazy(() => import("./pages/topic/WeatherLesson"));
const AnimalsLesson = lazy(() => import("./pages/topic/AnimalsLesson"));
const JobsLesson = lazy(() => import("./pages/topic/JobsLesson"));
const FamilyLesson = lazy(() => import("./pages/topic/FamilyLesson"));
const RestaurantOrderingLesson = lazy(() => import("./pages/topic/RestaurantOrderingLesson"));
const SynonymsLesson = lazy(() => import("./pages/topic/SynonymsLesson"));
const DialogueBattleGame = lazy(() => import("./pages/DialogueBattleGame"));
const PronounsLesson = lazy(() => import("./pages/topic/PronounsLesson"));
const EssentialVerbsLesson = lazy(() => import("./pages/topic/EssentialVerbsLesson"));
const SurvivalPhrasesLesson = lazy(() => import("./pages/topic/SurvivalPhrasesLesson"));
const FoodDrinksStarterLesson = lazy(() => import("./pages/topic/FoodDrinksStarterLesson"));
const ParticlesBeginnerLesson = lazy(() => import("./pages/topic/ParticlesBeginnerLesson"));
const ParticlesIntermediateLesson = lazy(() => import("./pages/topic/ParticlesIntermediateLesson"));
const ParticlesAdvancedLesson = lazy(() => import("./pages/topic/ParticlesAdvancedLesson"));
const CyrillicLettersLesson = lazy(() => import("./pages/topic/CyrillicLettersLesson").then((m) => ({ default: m.CyrillicLettersLesson })));
// Spanish Lessons
const SpanishAlphabetLesson = lazy(() => import("./pages/spanish/SpanishAlphabetLesson"));
const SpanishGreetingsLesson = lazy(() => import("./pages/spanish/SpanishGreetingsLesson"));
const SpanishNumbersLesson = lazy(() => import("./pages/spanish/SpanishNumbersLesson"));
const SpanishColorsLesson = lazy(() => import("./pages/spanish/SpanishColorsLesson"));
const SpanishAnimalsLesson = lazy(() => import("./pages/spanish/SpanishAnimalsLesson"));
const SpanishFamilyLesson = lazy(() => import("./pages/spanish/SpanishFamilyLesson"));
const SpanishFoodLesson = lazy(() => import("./pages/spanish/SpanishFoodLesson"));
// Quiz
const QuizPage = lazy(() => import("./pages/QuizPage"));
const QuizDiscover = lazy(() => import("./pages/QuizDiscover"));
// Flashcards
const Flashcards = lazy(() => import("./pages/Flashcards"));
const FlashcardStudy = lazy(() => import("./pages/FlashcardStudy"));
// Lesson Screen
const LessonScreen = lazy(() => import("./pages/LessonScreen"));
const CourseLesson = lazy(() => import("./pages/CourseLesson"));
// Forum
const Forum = lazy(() => import("./pages/Forum"));
const ForumCategory = lazy(() => import("./pages/ForumCategory"));
const ForumThread = lazy(() => import("./pages/ForumThread"));
// Mini Games
const FruitSlicer = lazy(() => import("./pages/FruitSlicer"));
const RapidFireGame = lazy(() => import("./pages/RapidFireGame"));
const ShpokoEndlessWord = lazy(() => import("./pages/ShpokoEndlessWord"));
// Profile & Quests
const Profile = lazy(() => import("./pages/Profile"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const MyWords = lazy(() => import("./pages/MyWords"));
const UnitGuide = lazy(() => import("./pages/UnitGuide"));
const Quests = lazy(() => import("./pages/Quests"));
const AchievementsPage = lazy(() => import("./pages/AchievementsPage"));
const Friends = lazy(() => import("./pages/Friends"));
const Shop = lazy(() => import("./pages/Shop"));
const TradeHistory = lazy(() => import("./pages/TradeHistory"));
const ImageAnalyzer = lazy(() => import("./pages/ImageAnalyzer"));
// Admin
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminForum = lazy(() => import("./pages/admin/AdminForum"));
const AdminQuizzes = lazy(() => import("./pages/admin/AdminQuizzes"));
const AdminLeagues = lazy(() => import("./pages/admin/AdminLeagues"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminLessons = lazy(() => import("./pages/admin/AdminLessons"));
const AdminVocabulary = lazy(() => import("./pages/admin/AdminVocabulary"));
const AdminSkins = lazy(() => import("./pages/admin/AdminSkins"));
const AdminShop = lazy(() => import("./pages/admin/AdminShop"));
const AdminPremium = lazy(() => import("./pages/admin/AdminPremium"));
const AdminHallOfFame = lazy(() => import("./pages/admin/AdminHallOfFame"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminQuests = lazy(() => import("./pages/admin/AdminQuests"));

const queryClient = new QueryClient();

// Smooth mouse-wheel scrolling everywhere (see src/lib/smoothScroll.ts).
const SmoothScroll = () => {
  useEffect(() => initSmoothScroll(), []);
  return null;
};

// Shown for a moment while a page's code is downloaded.
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-10 h-10 rounded-full border-4 border-primary/25 border-t-primary animate-spin" />
  </div>
);

const App = () => (
  <I18nProvider>
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SmoothScroll />
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <GuestProvider>
            <SoundSettingsProvider>
            <InputModeProvider>
            <LanguageModeProvider>
            <RouteGate>
            <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/welcome" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/course/:lessonId" element={<CourseLesson />} />
              <Route path="/about" element={<About />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/quiz-discover" element={<QuizDiscover />} />
              <Route path="/contexto" element={<ContextoGame />} />
              <Route path="/assessment/:tier" element={<TierAssessment />} />
              <Route path="/game/rapid-fire" element={<RapidFireGame />} />
              <Route path="/game/endless-words" element={<ShpokoEndlessWord />} />
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
              {/* Stories - Children's Stories */}
              <Route path="/stories" element={<ChildrenStories />} />
              <Route path="/stories/:storyId" element={<ChildrenStories />} />
              <Route path="/stories/:storyId/:partId" element={<ChildrenStories />} />
              {/* Legacy path (keep working) */}
              <Route path="/children-stories" element={<ChildrenStories />} />
              <Route path="/children-stories/:storyId" element={<ChildrenStories />} />
              <Route path="/children-stories/:storyId/:partId" element={<ChildrenStories />} />
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
              {/* Mini Games */}
              <Route path="/game/fruit-slicer" element={<FruitSlicer />} />
              {/* Profile & Quests */}
              <Route path="/profile" element={SHOW_LEGACY ? <Profile /> : <MyProfile />} />
              <Route path="/words" element={<MyWords />} />
              <Route path="/guide/:unitId" element={<UnitGuide />} />
              <Route path="/quests" element={<Quests />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/trade-history" element={<TradeHistory />} />
              <Route path="/image-analyzer" element={<ImageAnalyzer />} />
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/lessons" element={<AdminLessons />} />
              <Route path="/admin/quizzes" element={<AdminQuizzes />} />
              <Route path="/admin/vocabulary" element={<AdminVocabulary />} />
              <Route path="/admin/leagues" element={<AdminLeagues />} />
              <Route path="/admin/quests" element={<AdminQuests />} />
              <Route path="/admin/skins" element={<AdminSkins />} />
              <Route path="/admin/shop" element={<AdminShop />} />
              <Route path="/admin/premium" element={<AdminPremium />} />
              <Route path="/admin/forum" element={<AdminForum />} />
              <Route path="/admin/hall-of-fame" element={<AdminHallOfFame />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
            </RouteGate>
            </LanguageModeProvider>
            </InputModeProvider>
            </SoundSettingsProvider>
            </GuestProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
  </I18nProvider>
);

export default App;