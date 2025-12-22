// Translation system for multi-language support
// English (default) and Swedish translations

export type UILanguage = 'english' | 'swedish' | 'bulgarian';

interface Translations {
  // Header
  quizzes: string;
  leaderboard: string;
  premium: string;
  
  // Hero Section
  heroTitle: string;
  heroTitleHighlight: string;
  heroDescription: string;
  startLearning: string;
  lessons: string;
  minPerDay: string;
  meetShpoko: string;
  shpokoDescription: string;
  shpokoGreeting: string;
  shpokoGreetingTranslation: string;
  
  // Lesson Selector
  chooseYourLevel: string;
  beginner: string;
  intermediate: string;
  advanced: string;
  lessonsCount: string;
  completed: string;
  unlocked: string;
  back: string;
  lessonsLabel: string;
  assessment: string;
  testYourKnowledge: string;
  completeMoreLessons: string;
  takeTest: string;
  streak: string;
  revise: string;
  everyStreakUnlocks: string;
  daysToNext: string;
  noLessonsAvailable: string;
  
  // Daily Games
  dailyGames: string;
  dailyChallenge: string;
  
  // General
  xp: string;
  level: string;
  signIn: string;
  
  // Lessons categories
  basics: string;
  vocabulary: string;
  grammar: string;
  phrases: string;
  culture: string;
  
  // Common lesson UI
  correct: string;
  incorrect: string;
  continue: string;
  tryAgain: string;
  finish: string;
  progress: string;
  
  // Word of the Day
  wordOfTheDay: string;
  pronunciation: string;
  meaning: string;
  examples: string;
}

const englishTranslations: Translations = {
  // Header
  quizzes: 'Quizzes',
  leaderboard: 'Leaderboard',
  premium: 'Premium',
  
  // Hero Section
  heroTitle: 'Learn Bulgarian with',
  heroTitleHighlight: 'Shpoko',
  heroDescription: 'Master Bulgarian through fun, bite-sized lessons with your friendly companion. From Cyrillic to conversation in just 15 minutes a day!',
  startLearning: 'Start Learning',
  lessons: 'Lessons',
  minPerDay: '15 Min/Day',
  meetShpoko: 'Meet Shpoko!',
  shpokoDescription: "Your Bulgarian learning companion. I'll guide you through every lesson!",
  shpokoGreeting: '💬 "Здравей! Ready to start?"',
  shpokoGreetingTranslation: '(Hello! Ready to start?)',
  
  // Lesson Selector
  chooseYourLevel: 'Choose Your Level',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  lessonsCount: 'lessons',
  completed: 'completed',
  unlocked: 'unlocked',
  back: '← Back',
  lessonsLabel: 'Lessons',
  assessment: 'Assessment',
  testYourKnowledge: 'Test your knowledge of all lessons!',
  completeMoreLessons: 'more lessons to unlock',
  takeTest: 'Take Test',
  streak: 'Streak',
  revise: 'Revise',
  everyStreakUnlocks: 'Every 5 streak days unlocks 1 premium lesson!',
  daysToNext: 'days to next',
  noLessonsAvailable: 'No lessons available in this category yet.',
  
  // Daily Games
  dailyGames: 'Daily Games',
  dailyChallenge: 'Daily Challenge',
  
  // General
  xp: 'XP',
  level: 'Lv.',
  signIn: 'Sign In',
  
  // Lessons categories
  basics: 'Basics',
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
  phrases: 'Phrases',
  culture: 'Culture',
  
  // Common lesson UI
  correct: 'Correct!',
  incorrect: 'Incorrect',
  continue: 'Continue',
  tryAgain: 'Try Again',
  finish: 'Finish',
  progress: 'Progress',
  
  // Word of the Day
  wordOfTheDay: 'Word of the Day',
  pronunciation: 'Pronunciation',
  meaning: 'Meaning',
  examples: 'Examples',
};

const swedishTranslations: Translations = {
  // Header
  quizzes: 'Quiz',
  leaderboard: 'Topplista',
  premium: 'Premium',
  
  // Hero Section
  heroTitle: 'Lär dig bulgariska med',
  heroTitleHighlight: 'Shpoko',
  heroDescription: 'Lär dig bulgariska genom roliga, korta lektioner med din vänliga kompis. Från kyrilliska till konversation på bara 15 minuter om dagen!',
  startLearning: 'Börja lära dig',
  lessons: 'Lektioner',
  minPerDay: '15 min/dag',
  meetShpoko: 'Träffa Shpoko!',
  shpokoDescription: 'Din bulgariska lärkompis. Jag guidar dig genom varje lektion!',
  shpokoGreeting: '💬 "Здравей! Redo att börja?"',
  shpokoGreetingTranslation: '(Hej! Redo att börja?)',
  
  // Lesson Selector
  chooseYourLevel: 'Välj din nivå',
  beginner: 'Nybörjare',
  intermediate: 'Medel',
  advanced: 'Avancerad',
  lessonsCount: 'lektioner',
  completed: 'avklarat',
  unlocked: 'upplåst',
  back: '← Tillbaka',
  lessonsLabel: 'Lektioner',
  assessment: 'Utvärdering',
  testYourKnowledge: 'Testa dina kunskaper om alla lektioner!',
  completeMoreLessons: 'fler lektioner för att låsa upp',
  takeTest: 'Gör testet',
  streak: 'Streak',
  revise: 'Repetera',
  everyStreakUnlocks: 'Var 5:e streak-dag låser upp 1 premiumlektion!',
  daysToNext: 'dagar till nästa',
  noLessonsAvailable: 'Inga lektioner tillgängliga i denna kategori ännu.',
  
  // Daily Games
  dailyGames: 'Dagliga spel',
  dailyChallenge: 'Daglig utmaning',
  
  // General
  xp: 'XP',
  level: 'Nv.',
  signIn: 'Logga in',
  
  // Lessons categories
  basics: 'Grunder',
  vocabulary: 'Ordförråd',
  grammar: 'Grammatik',
  phrases: 'Fraser',
  culture: 'Kultur',
  
  // Common lesson UI
  correct: 'Rätt!',
  incorrect: 'Fel',
  continue: 'Fortsätt',
  tryAgain: 'Försök igen',
  finish: 'Avsluta',
  progress: 'Framsteg',
  
  // Word of the Day
  wordOfTheDay: 'Dagens ord',
  pronunciation: 'Uttal',
  meaning: 'Betydelse',
  examples: 'Exempel',
};

const bulgarianTranslations: Translations = {
  // Header
  quizzes: 'Тестове',
  leaderboard: 'Класация',
  premium: 'Премиум',
  
  // Hero Section
  heroTitle: 'Научи испански с',
  heroTitleHighlight: 'Шпоко',
  heroDescription: 'Научи испански чрез забавни, кратки уроци с твоя приятелски помощник. От основите до разговори само за 15 минути на ден!',
  startLearning: 'Започни да учиш',
  lessons: 'Уроци',
  minPerDay: '15 мин/ден',
  meetShpoko: 'Запознай се с Шпоко!',
  shpokoDescription: 'Твоят помощник за учене на испански. Ще те водя през всеки урок!',
  shpokoGreeting: '💬 "¡Hola! Готов ли си да започнеш?"',
  shpokoGreetingTranslation: '(Здравей! Готов ли си да започнеш?)',
  
  // Lesson Selector
  chooseYourLevel: 'Избери ниво',
  beginner: 'Начинаещ',
  intermediate: 'Средно',
  advanced: 'Напреднал',
  lessonsCount: 'урока',
  completed: 'завършени',
  unlocked: 'отключени',
  back: '← Назад',
  lessonsLabel: 'Уроци',
  assessment: 'Оценка',
  testYourKnowledge: 'Провери знанията си от всички уроци!',
  completeMoreLessons: 'още урока за отключване',
  takeTest: 'Направи тест',
  streak: 'Поред',
  revise: 'Преговор',
  everyStreakUnlocks: 'На всеки 5 дни поред отключваш 1 премиум урок!',
  daysToNext: 'дни до следващия',
  noLessonsAvailable: 'Все още няма уроци в тази категория.',
  
  // Daily Games
  dailyGames: 'Ежедневни игри',
  dailyChallenge: 'Дневно предизвикателство',
  
  // General
  xp: 'XP',
  level: 'Ниво',
  signIn: 'Вход',
  
  // Lessons categories
  basics: 'Основи',
  vocabulary: 'Речник',
  grammar: 'Граматика',
  phrases: 'Фрази',
  culture: 'Култура',
  
  // Common lesson UI
  correct: 'Правилно!',
  incorrect: 'Грешно',
  continue: 'Продължи',
  tryAgain: 'Опитай пак',
  finish: 'Завърши',
  progress: 'Напредък',
  
  // Word of the Day
  wordOfTheDay: 'Дума на деня',
  pronunciation: 'Произношение',
  meaning: 'Значение',
  examples: 'Примери',
};

export const getTranslations = (language: UILanguage): Translations => {
  switch (language) {
    case 'swedish':
      return swedishTranslations;
    case 'bulgarian':
      return bulgarianTranslations;
    default:
      return englishTranslations;
  }
};

export const useTranslations = () => {
  // This hook should be used with useLanguageMode
  return { getTranslations };
};
