// Translation system for multi-language support
// English (default), Swedish, and Bulgarian translations

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
  animals: string;
  colors: string;
  numbers: string;
  playNow: string;
  accuracy: string;
  speed: string;
  upToPoints: string;
  yourHighScore: string;
  startGame: string;
  gameLocked: string;
  comeBackIn: string;
  gameOver: string;
  finalScore: string;
  answered: string;
  newHighScore: string;
  xpEarned: string;
  close: string;
  skip: string;
  submit: string;
  points: string;
  skipped: string;
  correctAnswer: string;
  typeBulgarianName: string;
  
  // General
  xp: string;
  level: string;
  signIn: string;
  dayStreak: string;
  
  // Lessons categories
  basics: string;
  vocabulary: string;
  grammar: string;
  phrases: string;
  culture: string;
  
  // Category navigation
  daily: string;
  games: string;
  stories: string;
  dailyActivities: string;
  learnBulgarian: string;
  funChallenges: string;
  readAndLearn: string;
  
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
  
  // Short Stories
  shortStories: string;
  readStoriesDescription: string;
  viewAllStories: string;
  
  // Hall of Fame
  hallOfFame: string;
  noChampionsYet: string;
  
  // Leaderboard
  leaderboardRank: string;
  outOfLearners: string;
  topLearners: string;
  noLearnersYet: string;
  you: string;
  notRanked: string;
  loading: string;
  
  // Auth
  welcomeBack: string;
  joinShpoko: string;
  enterCredentials: string;
  createAccountDescription: string;
  username: string;
  chooseUsername: string;
  email: string;
  enterEmail: string;
  password: string;
  enterPassword: string;
  confirmPassword: string;
  confirmYourPassword: string;
  logIn: string;
  createAccount: string;
  newToShpoko: string;
  alreadyHaveAccount: string;
  loginFailed: string;
  invalidCredentials: string;
  signUpFailed: string;
  welcomeToShpoko: string;
  accountCreated: string;
  emailAlreadyRegistered: string;
  emailInUse: string;
  
  // Games
  contexto: string;
  guessTheWord: string;
  rapidFire: string;
  sevenSecRounds: string;
  conjugation: string;
  verbForms: string;
  clozeCombat: string;
  findWrongWord: string;
  fixMyBulgarian: string;
  proofread: string;
  listeningFill: string;
  audioBlanks: string;
  dialogueBattle: string;
  realConversations: string;
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
  animals: 'Animals',
  colors: 'Colors',
  numbers: 'Numbers',
  playNow: 'Play now!',
  accuracy: 'Accuracy',
  speed: 'Speed',
  upToPoints: 'Up to 100 pts',
  yourHighScore: 'Your high score:',
  startGame: 'Start Game (60s)',
  gameLocked: 'Game Locked',
  comeBackIn: 'Come back in',
  gameOver: 'Game Over!',
  finalScore: 'Final Score:',
  answered: 'Answered',
  newHighScore: 'New High Score!',
  xpEarned: 'XP Earned:',
  close: 'Close',
  skip: 'Skip',
  submit: 'Submit',
  points: 'points',
  skipped: 'Skipped',
  correctAnswer: 'Correct:',
  typeBulgarianName: 'Type Bulgarian name...',
  
  // General
  xp: 'XP',
  level: 'Lv.',
  signIn: 'Sign In',
  dayStreak: 'day streak',
  
  // Lessons categories
  basics: 'Basics',
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
  phrases: 'Phrases',
  culture: 'Culture',
  
  // Category navigation
  daily: 'Daily',
  games: 'Games',
  stories: 'Stories',
  dailyActivities: 'Daily activities',
  learnBulgarian: 'Learn Bulgarian',
  funChallenges: 'Fun challenges',
  readAndLearn: 'Read & learn',
  
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
  
  // Short Stories
  shortStories: 'Short Stories',
  readStoriesDescription: 'Read stories & answer questions to earn XP!',
  viewAllStories: 'View All Stories',
  
  // Hall of Fame
  hallOfFame: 'Hall of Fame',
  noChampionsYet: 'No champions yet! Be the first to claim the top spot at the end of the month.',
  
  // Leaderboard
  leaderboardRank: 'Leaderboard Rank',
  outOfLearners: 'out of {count} learners',
  topLearners: 'Top Learners',
  noLearnersYet: 'No learners yet. Be the first!',
  you: 'You',
  notRanked: 'Not ranked',
  loading: 'Loading...',
  
  // Auth
  welcomeBack: 'Welcome Back!',
  joinShpoko: 'Join Shpoko',
  enterCredentials: 'Enter your credentials to continue learning',
  createAccountDescription: 'Create an account to start your Bulgarian learning journey',
  username: 'Username',
  chooseUsername: 'Choose a username',
  email: 'Email',
  enterEmail: 'Enter your email',
  password: 'Password',
  enterPassword: 'Enter your password',
  confirmPassword: 'Confirm Password',
  confirmYourPassword: 'Confirm your password',
  logIn: 'Log In',
  createAccount: 'Create Account',
  newToShpoko: 'New to Shpoko?',
  alreadyHaveAccount: 'Already have an account?',
  loginFailed: 'Login Failed',
  invalidCredentials: 'Invalid email or password. Please try again.',
  signUpFailed: 'Sign Up Failed',
  welcomeToShpoko: 'Welcome to Shpoko!',
  accountCreated: 'Your account has been created. Start learning!',
  emailAlreadyRegistered: 'Email Already Registered',
  emailInUse: 'This email is already in use. Please log in or use a different email.',
  
  // Games
  contexto: 'Contexto',
  guessTheWord: 'Guess the word',
  rapidFire: 'Rapid Fire',
  sevenSecRounds: '7s rounds',
  conjugation: 'Conjugation',
  verbForms: 'Verb forms',
  clozeCombat: 'Cloze Combat',
  findWrongWord: 'Find wrong word',
  fixMyBulgarian: 'Fix My Bulgarian',
  proofread: 'Proofread',
  listeningFill: 'Listening Fill',
  audioBlanks: 'Audio blanks',
  dialogueBattle: 'Dialogue Battle',
  realConversations: 'Real conversations',
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
  animals: 'Djur',
  colors: 'Färger',
  numbers: 'Siffror',
  playNow: 'Spela nu!',
  accuracy: 'Precision',
  speed: 'Hastighet',
  upToPoints: 'Upp till 100 poäng',
  yourHighScore: 'Ditt högsta poäng:',
  startGame: 'Starta spelet (60s)',
  gameLocked: 'Spelet är låst',
  comeBackIn: 'Kom tillbaka om',
  gameOver: 'Spelet är slut!',
  finalScore: 'Slutpoäng:',
  answered: 'Besvarade',
  newHighScore: 'Nytt rekord!',
  xpEarned: 'XP intjänad:',
  close: 'Stäng',
  skip: 'Hoppa över',
  submit: 'Skicka',
  points: 'poäng',
  skipped: 'Hoppade över',
  correctAnswer: 'Rätt:',
  typeBulgarianName: 'Skriv bulgariska namnet...',
  
  // General
  xp: 'XP',
  level: 'Nv.',
  signIn: 'Logga in',
  dayStreak: 'dagars streak',
  
  // Lessons categories
  basics: 'Grunder',
  vocabulary: 'Ordförråd',
  grammar: 'Grammatik',
  phrases: 'Fraser',
  culture: 'Kultur',
  
  // Category navigation
  daily: 'Dagligt',
  games: 'Spel',
  stories: 'Berättelser',
  dailyActivities: 'Dagliga aktiviteter',
  learnBulgarian: 'Lär dig bulgariska',
  funChallenges: 'Roliga utmaningar',
  readAndLearn: 'Läs & lär',
  
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
  
  // Short Stories
  shortStories: 'Korta berättelser',
  readStoriesDescription: 'Läs berättelser & svara på frågor för att tjäna XP!',
  viewAllStories: 'Visa alla berättelser',
  
  // Hall of Fame
  hallOfFame: 'Hall of Fame',
  noChampionsYet: 'Inga mästare ännu! Bli den första att ta topplatsen i slutet av månaden.',
  
  // Leaderboard
  leaderboardRank: 'Topplistaplacering',
  outOfLearners: 'av {count} elever',
  topLearners: 'Topp elever',
  noLearnersYet: 'Inga elever ännu. Bli den första!',
  you: 'Du',
  notRanked: 'Inte rankad',
  loading: 'Laddar...',
  
  // Auth
  welcomeBack: 'Välkommen tillbaka!',
  joinShpoko: 'Gå med i Shpoko',
  enterCredentials: 'Ange dina uppgifter för att fortsätta lära dig',
  createAccountDescription: 'Skapa ett konto för att börja din bulgariska lärresa',
  username: 'Användarnamn',
  chooseUsername: 'Välj ett användarnamn',
  email: 'E-post',
  enterEmail: 'Ange din e-post',
  password: 'Lösenord',
  enterPassword: 'Ange ditt lösenord',
  confirmPassword: 'Bekräfta lösenord',
  confirmYourPassword: 'Bekräfta ditt lösenord',
  logIn: 'Logga in',
  createAccount: 'Skapa konto',
  newToShpoko: 'Ny på Shpoko?',
  alreadyHaveAccount: 'Har du redan ett konto?',
  loginFailed: 'Inloggning misslyckades',
  invalidCredentials: 'Ogiltig e-post eller lösenord. Försök igen.',
  signUpFailed: 'Registrering misslyckades',
  welcomeToShpoko: 'Välkommen till Shpoko!',
  accountCreated: 'Ditt konto har skapats. Börja lära dig!',
  emailAlreadyRegistered: 'E-post redan registrerad',
  emailInUse: 'Denna e-post används redan. Logga in eller använd en annan e-post.',
  
  // Games
  contexto: 'Contexto',
  guessTheWord: 'Gissa ordet',
  rapidFire: 'Snabbeld',
  sevenSecRounds: '7s omgångar',
  conjugation: 'Konjugation',
  verbForms: 'Verbformer',
  clozeCombat: 'Cloze Combat',
  findWrongWord: 'Hitta fel ord',
  fixMyBulgarian: 'Fixa min bulgariska',
  proofread: 'Korrekturläs',
  listeningFill: 'Lyssna & fyll i',
  audioBlanks: 'Ljudluckor',
  dialogueBattle: 'Dialogkamp',
  realConversations: 'Riktiga samtal',
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
  animals: 'Животни',
  colors: 'Цветове',
  numbers: 'Числа',
  playNow: 'Играй сега!',
  accuracy: 'Точност',
  speed: 'Скорост',
  upToPoints: 'До 100 точки',
  yourHighScore: 'Твой рекорд:',
  startGame: 'Започни игра (60с)',
  gameLocked: 'Играта е заключена',
  comeBackIn: 'Върни се след',
  gameOver: 'Край на играта!',
  finalScore: 'Краен резултат:',
  answered: 'Отговорено',
  newHighScore: 'Нов рекорд!',
  xpEarned: 'Спечелен опит:',
  close: 'Затвори',
  skip: 'Пропусни',
  submit: 'Изпрати',
  points: 'точки',
  skipped: 'Пропуснато',
  correctAnswer: 'Отговор:',
  typeBulgarianName: 'Напиши испанското име...',
  
  // General
  xp: 'XP',
  level: 'Ниво',
  signIn: 'Вход',
  dayStreak: 'дни серия',
  
  // Lessons categories
  basics: 'Основи',
  vocabulary: 'Речник',
  grammar: 'Граматика',
  phrases: 'Фрази',
  culture: 'Култура',
  
  // Category navigation
  daily: 'Дневни',
  games: 'Игри',
  stories: 'Истории',
  dailyActivities: 'Ежедневни задачи',
  learnBulgarian: 'Научи испански',
  funChallenges: 'Забавни предизвикателства',
  readAndLearn: 'Чети и учи',
  
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
  
  // Short Stories
  shortStories: 'Кратки истории',
  readStoriesDescription: 'Чети истории и отговаряй на въпроси за XP!',
  viewAllStories: 'Виж всички истории',
  
  // Hall of Fame
  hallOfFame: 'Зала на славата',
  noChampionsYet: 'Все още няма шампиони! Бъди първият да заемеш върха в края на месеца.',
  
  // Leaderboard
  leaderboardRank: 'Позиция в класацията',
  outOfLearners: 'от {count} ученика',
  topLearners: 'Топ ученици',
  noLearnersYet: 'Все още няма ученици. Бъди първият!',
  you: 'Ти',
  notRanked: 'Не си класиран',
  loading: 'Зареждане...',
  
  // Auth
  welcomeBack: 'Добре дошъл отново!',
  joinShpoko: 'Присъедини се към Шпоко',
  enterCredentials: 'Въведи данните си за да продължиш да учиш',
  createAccountDescription: 'Създай акаунт за да започнеш твоето испанско пътешествие',
  username: 'Потребителско име',
  chooseUsername: 'Избери потребителско име',
  email: 'Имейл',
  enterEmail: 'Въведи имейл',
  password: 'Парола',
  enterPassword: 'Въведи парола',
  confirmPassword: 'Потвърди паролата',
  confirmYourPassword: 'Потвърди паролата си',
  logIn: 'Влез',
  createAccount: 'Създай акаунт',
  newToShpoko: 'Нов в Шпоко?',
  alreadyHaveAccount: 'Вече имаш акаунт?',
  loginFailed: 'Неуспешен вход',
  invalidCredentials: 'Невалиден имейл или парола. Опитай пак.',
  signUpFailed: 'Неуспешна регистрация',
  welcomeToShpoko: 'Добре дошъл в Шпоко!',
  accountCreated: 'Твоят акаунт е създаден. Започни да учиш!',
  emailAlreadyRegistered: 'Имейлът вече е регистриран',
  emailInUse: 'Този имейл вече се използва. Влез или използвай друг имейл.',
  
  // Games
  contexto: 'Контексто',
  guessTheWord: 'Познай думата',
  rapidFire: 'Бърза стрелба',
  sevenSecRounds: '7с рундове',
  conjugation: 'Спрежение',
  verbForms: 'Глаголни форми',
  clozeCombat: 'Cloze бой',
  findWrongWord: 'Намери грешна дума',
  fixMyBulgarian: 'Поправи испанския ми',
  proofread: 'Коригирай',
  listeningFill: 'Слушай и попълни',
  audioBlanks: 'Аудио празнини',
  dialogueBattle: 'Диалогова битка',
  realConversations: 'Реални разговори',
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
