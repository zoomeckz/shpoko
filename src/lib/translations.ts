// Translation system for multi-language support
// English (default), Swedish, Bulgarian, Tunisian Arabic, Dutch, Greek, Russian, Ukrainian, Italian, Polish translations

export type UILanguage = 'english' | 'swedish' | 'bulgarian' | 'tunisian' | 'dutch' | 'greek' | 'russian' | 'ukrainian' | 'italian' | 'polish';

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
  
  // Lesson UI
  lessonComplete: string;
  revisionComplete: string;
  greatPractice: string;
  correctAnswers: string;
  reviseAgain: string;
  nextLesson: string;
  previousLesson: string;
  backToLessons: string;
  typeTransliteration: string;
  fillInBlank: string;
  chooseCorrect: string;
  showHint: string;
  check: string;
  next: string;
  complete: string;
  completeLesson: string;
  theAnswerIs: string;
  revision: string;
  revisionMode: string;
  
  // Lesson titles
  colorsLesson: string;
  animalsLesson: string;
  numbersLesson: string;
  familyLesson: string;
  weatherLesson: string;
  foodDrinksLesson: string;
  verbsLesson: string;
  adjectivesLesson: string;
  pronounsLesson: string;
  directionsLesson: string;
  weekdaysLesson: string;
  jobsLesson: string;
  shapesLesson: string;
  survivalPhrasesLesson: string;
  
  // Lesson hints (translations for Bulgarian words)
  hintRed: string;
  hintBlue: string;
  hintGreen: string;
  hintYellow: string;
  hintOrange: string;
  hintDog: string;
  hintCat: string;
  hintBird: string;
  hintFish: string;
  hintHorse: string;
  hintMother: string;
  hintFather: string;
  hintSister: string;
  hintBrother: string;
  hintGrandmother: string;
  hintSun: string;
  hintRain: string;
  hintSnow: string;
  hintWind: string;
  hintCold: string;
  hintBread: string;
  hintWater: string;
  hintCoffee: string;
  hintTea: string;
  hintMilk: string;
  hintMeat: string;
  hintEgg: string;
  hintCheese: string;
  hintFruit: string;
  hintVegetable: string;
  hintBeer: string;
  hintWine: string;
  hintJuice: string;
  hintSoup: string;
  
  // Fill blank translations
  theSkyIsBlue: string;
  theGrassIsGreen: string;
  theSunIsYellow: string;
  theCowGivesMilk: string;
  thePigLivesOnFarm: string;
  theRabbitEatsCarrots: string;
  myMotherIsKind: string;
  myGrandfatherIs70: string;
  iHaveOneSister: string;
  todayIsVeryHot: string;
  itIsRaining: string;
  winterIsCold: string;
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
  
  // Lesson UI
  lessonComplete: 'Lesson Complete!',
  revisionComplete: 'Revision Complete!',
  greatPractice: 'Great practice session!',
  correctAnswers: 'correct answers',
  reviseAgain: 'Revise Again',
  nextLesson: 'Next:',
  previousLesson: 'Previous:',
  backToLessons: 'Back to Lessons',
  typeTransliteration: 'Type the transliteration',
  fillInBlank: 'Fill in the blank',
  chooseCorrect: 'Choose the correct answer',
  showHint: 'Show Hint',
  check: 'Check',
  next: 'Next',
  complete: 'Complete',
  completeLesson: 'Complete Lesson',
  theAnswerIs: 'The answer is:',
  revision: 'Revision',
  revisionMode: 'Revision Mode',
  
  // Lesson titles
  colorsLesson: 'Colors',
  animalsLesson: 'Animals',
  numbersLesson: 'Numbers',
  familyLesson: 'Family',
  weatherLesson: 'Weather',
  foodDrinksLesson: 'Food & Drinks',
  verbsLesson: 'Verbs',
  adjectivesLesson: 'Adjectives',
  pronounsLesson: 'Pronouns',
  directionsLesson: 'Directions',
  weekdaysLesson: 'Weekdays',
  jobsLesson: 'Jobs',
  shapesLesson: 'Shapes',
  survivalPhrasesLesson: 'Survival Phrases',
  
  // Lesson hints
  hintRed: 'Red',
  hintBlue: 'Blue',
  hintGreen: 'Green',
  hintYellow: 'Yellow',
  hintOrange: 'Orange',
  hintDog: 'Dog',
  hintCat: 'Cat',
  hintBird: 'Bird',
  hintFish: 'Fish',
  hintHorse: 'Horse',
  hintMother: 'Mother',
  hintFather: 'Father',
  hintSister: 'Sister',
  hintBrother: 'Brother',
  hintGrandmother: 'Grandmother',
  hintSun: 'Sun',
  hintRain: 'Rain',
  hintSnow: 'Snow',
  hintWind: 'Wind',
  hintCold: 'Cold',
  hintBread: 'Bread',
  hintWater: 'Water',
  hintCoffee: 'Coffee',
  hintTea: 'Tea',
  hintMilk: 'Milk',
  hintMeat: 'Meat',
  hintEgg: 'Egg',
  hintCheese: 'Cheese',
  hintFruit: 'Fruit',
  hintVegetable: 'Vegetable',
  hintBeer: 'Beer',
  hintWine: 'Wine',
  hintJuice: 'Juice',
  hintSoup: 'Soup',
  
  // Fill blank translations
  theSkyIsBlue: 'The sky is blue',
  theGrassIsGreen: 'The grass is green',
  theSunIsYellow: 'The sun is yellow',
  theCowGivesMilk: 'The cow gives milk',
  thePigLivesOnFarm: 'The pig lives on a farm',
  theRabbitEatsCarrots: 'The rabbit eats carrots',
  myMotherIsKind: 'My mother is very kind',
  myGrandfatherIs70: 'My grandfather is 70 years old',
  iHaveOneSister: 'I have one sister',
  todayIsVeryHot: 'Today is very hot',
  itIsRaining: 'It is raining outside',
  winterIsCold: 'Winter is cold',
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
  
  // Lesson UI
  lessonComplete: 'Lektion klar!',
  revisionComplete: 'Repetition klar!',
  greatPractice: 'Bra övning!',
  correctAnswers: 'rätta svar',
  reviseAgain: 'Repetera igen',
  nextLesson: 'Nästa:',
  previousLesson: 'Föregående:',
  backToLessons: 'Tillbaka till lektioner',
  typeTransliteration: 'Skriv translittereringen',
  fillInBlank: 'Fyll i luckan',
  chooseCorrect: 'Välj rätt svar',
  showHint: 'Visa ledtråd',
  check: 'Kontrollera',
  next: 'Nästa',
  complete: 'Slutför',
  completeLesson: 'Slutför lektion',
  theAnswerIs: 'Svaret är:',
  revision: 'Repetition',
  revisionMode: 'Repetitionsläge',
  
  // Lesson titles
  colorsLesson: 'Färger',
  animalsLesson: 'Djur',
  numbersLesson: 'Siffror',
  familyLesson: 'Familj',
  weatherLesson: 'Väder',
  foodDrinksLesson: 'Mat & Dryck',
  verbsLesson: 'Verb',
  adjectivesLesson: 'Adjektiv',
  pronounsLesson: 'Pronomen',
  directionsLesson: 'Riktningar',
  weekdaysLesson: 'Veckodagar',
  jobsLesson: 'Yrken',
  shapesLesson: 'Former',
  survivalPhrasesLesson: 'Överlevnadsfraser',
  
  // Lesson hints
  hintRed: 'Röd',
  hintBlue: 'Blå',
  hintGreen: 'Grön',
  hintYellow: 'Gul',
  hintOrange: 'Orange',
  hintDog: 'Hund',
  hintCat: 'Katt',
  hintBird: 'Fågel',
  hintFish: 'Fisk',
  hintHorse: 'Häst',
  hintMother: 'Mamma',
  hintFather: 'Pappa',
  hintSister: 'Syster',
  hintBrother: 'Bror',
  hintGrandmother: 'Mormor/Farmor',
  hintSun: 'Sol',
  hintRain: 'Regn',
  hintSnow: 'Snö',
  hintWind: 'Vind',
  hintCold: 'Kallt',
  hintBread: 'Bröd',
  hintWater: 'Vatten',
  hintCoffee: 'Kaffe',
  hintTea: 'Te',
  hintMilk: 'Mjölk',
  hintMeat: 'Kött',
  hintEgg: 'Ägg',
  hintCheese: 'Ost',
  hintFruit: 'Frukt',
  hintVegetable: 'Grönsak',
  hintBeer: 'Öl',
  hintWine: 'Vin',
  hintJuice: 'Juice',
  hintSoup: 'Soppa',
  
  // Fill blank translations
  theSkyIsBlue: 'Himlen är blå',
  theGrassIsGreen: 'Gräset är grönt',
  theSunIsYellow: 'Solen är gul',
  theCowGivesMilk: 'Kon ger mjölk',
  thePigLivesOnFarm: 'Grisen bor på en gård',
  theRabbitEatsCarrots: 'Kaninen äter morötter',
  myMotherIsKind: 'Min mamma är väldigt snäll',
  myGrandfatherIs70: 'Min farfar/morfar är 70 år',
  iHaveOneSister: 'Jag har en syster',
  todayIsVeryHot: 'Idag är det väldigt varmt',
  itIsRaining: 'Det regnar ute',
  winterIsCold: 'Vintern är kall',
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
  
  // Lesson UI
  lessonComplete: 'Урокът е завършен!',
  revisionComplete: 'Преговорът е завършен!',
  greatPractice: 'Страхотна практика!',
  correctAnswers: 'правилни отговори',
  reviseAgain: 'Преговори отново',
  nextLesson: 'Следващ:',
  previousLesson: 'Предишен:',
  backToLessons: 'Към уроците',
  typeTransliteration: 'Напиши транслитерацията',
  fillInBlank: 'Попълни празното',
  chooseCorrect: 'Избери правилния отговор',
  showHint: 'Покажи подсказка',
  check: 'Провери',
  next: 'Напред',
  complete: 'Завърши',
  completeLesson: 'Завърши урока',
  theAnswerIs: 'Отговорът е:',
  revision: 'Преговор',
  revisionMode: 'Режим преговор',
  
  // Lesson titles
  colorsLesson: 'Цветове',
  animalsLesson: 'Животни',
  numbersLesson: 'Числа',
  familyLesson: 'Семейство',
  weatherLesson: 'Времето',
  foodDrinksLesson: 'Храна и напитки',
  verbsLesson: 'Глаголи',
  adjectivesLesson: 'Прилагателни',
  pronounsLesson: 'Местоимения',
  directionsLesson: 'Посоки',
  weekdaysLesson: 'Дни от седмицата',
  jobsLesson: 'Професии',
  shapesLesson: 'Форми',
  survivalPhrasesLesson: 'Фрази за оцеляване',
  
  // Lesson hints (Spanish translations for Bulgarian speakers)
  hintRed: 'Rojo',
  hintBlue: 'Azul',
  hintGreen: 'Verde',
  hintYellow: 'Amarillo',
  hintOrange: 'Naranja',
  hintDog: 'Perro',
  hintCat: 'Gato',
  hintBird: 'Pájaro',
  hintFish: 'Pez',
  hintHorse: 'Caballo',
  hintMother: 'Madre',
  hintFather: 'Padre',
  hintSister: 'Hermana',
  hintBrother: 'Hermano',
  hintGrandmother: 'Abuela',
  hintSun: 'Sol',
  hintRain: 'Lluvia',
  hintSnow: 'Nieve',
  hintWind: 'Viento',
  hintCold: 'Frío',
  hintBread: 'Pan',
  hintWater: 'Agua',
  hintCoffee: 'Café',
  hintTea: 'Té',
  hintMilk: 'Leche',
  hintMeat: 'Carne',
  hintEgg: 'Huevo',
  hintCheese: 'Queso',
  hintFruit: 'Fruta',
  hintVegetable: 'Verdura',
  hintBeer: 'Cerveza',
  hintWine: 'Vino',
  hintJuice: 'Jugo',
  hintSoup: 'Sopa',
  
  // Fill blank translations
  theSkyIsBlue: 'El cielo es azul',
  theGrassIsGreen: 'La hierba es verde',
  theSunIsYellow: 'El sol es amarillo',
  theCowGivesMilk: 'La vaca da leche',
  thePigLivesOnFarm: 'El cerdo vive en una granja',
  theRabbitEatsCarrots: 'El conejo come zanahorias',
  myMotherIsKind: 'Mi madre es muy amable',
  myGrandfatherIs70: 'Mi abuelo tiene 70 años',
  iHaveOneSister: 'Tengo una hermana',
  todayIsVeryHot: 'Hoy hace mucho calor',
  itIsRaining: 'Está lloviendo afuera',
  winterIsCold: 'El invierno es frío',
};

const tunisianTranslations: Translations = {
  // Header
  quizzes: 'اختبارات',
  leaderboard: 'لوحة المتصدرين',
  premium: 'بريميوم',
  
  // Hero Section
  heroTitle: 'تعلّم البلغاري مع',
  heroTitleHighlight: 'شبوكو',
  heroDescription: 'تعلّم البلغاري من خلال دروس قصيرة وممتعة مع صاحبك. من الكيريلية للمحادثة في 15 دقيقة في اليوم!',
  startLearning: 'ابدأ التعلّم',
  lessons: 'دروس',
  minPerDay: '15 دقيقة/يوم',
  meetShpoko: 'تعرّف على شبوكو!',
  shpokoDescription: 'صاحبك في تعلّم البلغاري. باش نعاونك في كل درس!',
  shpokoGreeting: '💬 "Здравей! مستعد تبدأ؟"',
  shpokoGreetingTranslation: '(أهلا! مستعد تبدأ؟)',
  
  // Lesson Selector
  chooseYourLevel: 'اختار مستواك',
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
  lessonsCount: 'دروس',
  completed: 'مكملين',
  unlocked: 'مفتوح',
  back: '← رجوع',
  lessonsLabel: 'الدروس',
  assessment: 'تقييم',
  testYourKnowledge: 'جرّب معلوماتك من كل الدروس!',
  completeMoreLessons: 'دروس إضافية للفتح',
  takeTest: 'دير الاختبار',
  streak: 'سلسلة',
  revise: 'راجع',
  everyStreakUnlocks: 'كل 5 أيام سلسلة يفتحلك درس بريميوم!',
  daysToNext: 'يوم للجاي',
  noLessonsAvailable: 'ما فماش دروس في هالفئة توا.',
  
  // Daily Games
  dailyGames: 'ألعاب يومية',
  dailyChallenge: 'تحدي اليوم',
  animals: 'حيوانات',
  colors: 'ألوان',
  numbers: 'أرقام',
  playNow: 'العب توا!',
  accuracy: 'الدقة',
  speed: 'السرعة',
  upToPoints: 'حتى 100 نقطة',
  yourHighScore: 'أعلى نتيجة:',
  startGame: 'ابدأ اللعب (60ث)',
  gameLocked: 'اللعبة مقفولة',
  comeBackIn: 'ارجع بعد',
  gameOver: 'انتهت اللعبة!',
  finalScore: 'النتيجة النهائية:',
  answered: 'أجوبة',
  newHighScore: 'رقم قياسي جديد!',
  xpEarned: 'XP ربحتهم:',
  close: 'أغلق',
  skip: 'تجاوز',
  submit: 'أرسل',
  points: 'نقاط',
  skipped: 'متجاوز',
  correctAnswer: 'الصحيح:',
  typeBulgarianName: 'اكتب الاسم بالبلغاري...',
  
  // General
  xp: 'XP',
  level: 'مستوى',
  signIn: 'سجّل دخول',
  dayStreak: 'يوم سلسلة',
  
  // Lessons categories
  basics: 'الأساسيات',
  vocabulary: 'المفردات',
  grammar: 'القواعد',
  phrases: 'عبارات',
  culture: 'الثقافة',
  
  // Category navigation
  daily: 'يومي',
  games: 'ألعاب',
  stories: 'قصص',
  dailyActivities: 'نشاطات يومية',
  learnBulgarian: 'تعلّم البلغاري',
  funChallenges: 'تحديات ممتعة',
  readAndLearn: 'اقرأ وتعلّم',
  
  // Common lesson UI
  correct: 'صحيح!',
  incorrect: 'خطأ',
  continue: 'واصل',
  tryAgain: 'حاول مرة أخرى',
  finish: 'خلّص',
  progress: 'التقدم',
  
  // Word of the Day
  wordOfTheDay: 'كلمة اليوم',
  pronunciation: 'النطق',
  meaning: 'المعنى',
  examples: 'أمثلة',
  
  // Short Stories
  shortStories: 'قصص قصيرة',
  readStoriesDescription: 'اقرأ قصص وجاوب على أسئلة باش تربح XP!',
  viewAllStories: 'شوف كل القصص',
  
  // Hall of Fame
  hallOfFame: 'قاعة المشاهير',
  noChampionsYet: 'ما فماش أبطال توا! كون أول واحد يوصل للقمة في آخر الشهر.',
  
  // Leaderboard
  leaderboardRank: 'مرتبة في اللوحة',
  outOfLearners: 'من {count} متعلّم',
  topLearners: 'أفضل المتعلّمين',
  noLearnersYet: 'ما فماش متعلّمين توا. كون الأول!',
  you: 'أنت',
  notRanked: 'ما عندكش ترتيب',
  loading: 'جاري التحميل...',
  
  // Auth
  welcomeBack: 'مرحبا بيك مرة أخرى!',
  joinShpoko: 'انضم لشبوكو',
  enterCredentials: 'دخّل بياناتك باش تواصل التعلّم',
  createAccountDescription: 'اخلق حساب باش تبدأ رحلتك في تعلّم البلغاري',
  username: 'اسم المستخدم',
  chooseUsername: 'اختار اسم مستخدم',
  email: 'الإيميل',
  enterEmail: 'دخّل إيميلك',
  password: 'كلمة السر',
  enterPassword: 'دخّل كلمة السر',
  confirmPassword: 'أكّد كلمة السر',
  confirmYourPassword: 'أكّد كلمة السر متاعك',
  logIn: 'ادخل',
  createAccount: 'اخلق حساب',
  newToShpoko: 'جديد في شبوكو؟',
  alreadyHaveAccount: 'عندك حساب؟',
  loginFailed: 'فشل الدخول',
  invalidCredentials: 'إيميل أو كلمة سر غالطة. حاول مرة أخرى.',
  signUpFailed: 'فشل التسجيل',
  welcomeToShpoko: 'مرحبا بيك في شبوكو!',
  accountCreated: 'حسابك تخلق. ابدأ التعلّم!',
  emailAlreadyRegistered: 'الإيميل مسجّل مسبقا',
  emailInUse: 'هالإيميل مستعمل. سجّل دخول أو استعمل إيميل آخر.',
  
  // Games
  contexto: 'كونتكستو',
  guessTheWord: 'خمّن الكلمة',
  rapidFire: 'نار سريعة',
  sevenSecRounds: 'جولات 7ث',
  conjugation: 'تصريف',
  verbForms: 'أشكال الفعل',
  clozeCombat: 'معركة الفراغات',
  findWrongWord: 'لقى الكلمة الغالطة',
  fixMyBulgarian: 'صحّح بلغاريتي',
  proofread: 'راجع',
  listeningFill: 'اسمع واملأ',
  audioBlanks: 'فراغات صوتية',
  dialogueBattle: 'معركة الحوار',
  realConversations: 'محادثات حقيقية',
  
  // Lesson UI
  lessonComplete: 'الدرس كمل!',
  revisionComplete: 'المراجعة كملت!',
  greatPractice: 'تمرين ممتاز!',
  correctAnswers: 'أجوبة صحيحة',
  reviseAgain: 'راجع مرة أخرى',
  nextLesson: 'الجاي:',
  previousLesson: 'اللي فات:',
  backToLessons: 'ارجع للدروس',
  typeTransliteration: 'اكتب النقل الحرفي',
  fillInBlank: 'عبّي الفراغ',
  chooseCorrect: 'اختار الجواب الصحيح',
  showHint: 'ورّي تلميح',
  check: 'تحقق',
  next: 'التالي',
  complete: 'كمّل',
  completeLesson: 'كمّل الدرس',
  theAnswerIs: 'الجواب هو:',
  revision: 'مراجعة',
  revisionMode: 'وضع المراجعة',
  
  // Lesson titles
  colorsLesson: 'الألوان',
  animalsLesson: 'الحيوانات',
  numbersLesson: 'الأرقام',
  familyLesson: 'العائلة',
  weatherLesson: 'الطقس',
  foodDrinksLesson: 'الماكلة والشراب',
  verbsLesson: 'الأفعال',
  adjectivesLesson: 'الصفات',
  pronounsLesson: 'الضمائر',
  directionsLesson: 'الاتجاهات',
  weekdaysLesson: 'أيام الأسبوع',
  jobsLesson: 'المهن',
  shapesLesson: 'الأشكال',
  survivalPhrasesLesson: 'عبارات البقاء',
  
  // Lesson hints (Tunisian Arabic translations)
  hintRed: 'أحمر',
  hintBlue: 'أزرق',
  hintGreen: 'أخضر',
  hintYellow: 'أصفر',
  hintOrange: 'برتقالي',
  hintDog: 'كلب',
  hintCat: 'قطوس',
  hintBird: 'عصفور',
  hintFish: 'حوت',
  hintHorse: 'عود',
  hintMother: 'أم',
  hintFather: 'بو',
  hintSister: 'أخت',
  hintBrother: 'خو',
  hintGrandmother: 'عمّة/جدّة',
  hintSun: 'شمس',
  hintRain: 'مطر',
  hintSnow: 'ثلج',
  hintWind: 'ريح',
  hintCold: 'برد',
  hintBread: 'خبز',
  hintWater: 'ماء',
  hintCoffee: 'قهوة',
  hintTea: 'تاي',
  hintMilk: 'حليب',
  hintMeat: 'لحم',
  hintEgg: 'بيضة',
  hintCheese: 'جبن',
  hintFruit: 'غلّة',
  hintVegetable: 'خضرة',
  hintBeer: 'بيرة',
  hintWine: 'نبيذ',
  hintJuice: 'عصير',
  hintSoup: 'شربة',
  
  // Fill blank translations
  theSkyIsBlue: 'السما زرقاء',
  theGrassIsGreen: 'العشب أخضر',
  theSunIsYellow: 'الشمس صفراء',
  theCowGivesMilk: 'البقرة تعطي حليب',
  thePigLivesOnFarm: 'الحلوف يعيش في المزرعة',
  theRabbitEatsCarrots: 'الأرنب ياكل جزر',
  myMotherIsKind: 'أمي طيّبة برشا',
  myGrandfatherIs70: 'جدي عمرو 70 سنة',
  iHaveOneSister: 'عندي أخت وحدة',
  todayIsVeryHot: 'اليوم سخانة برشا',
  itIsRaining: 'الدنيا تمطر برّا',
  winterIsCold: 'الشتاء بارد',
};

const dutchTranslations: Translations = {
  // Header
  quizzes: 'Quizzen',
  leaderboard: 'Ranglijst',
  premium: 'Premium',
  
  // Hero Section
  heroTitle: 'Leer Bulgaars met',
  heroTitleHighlight: 'Shpoko',
  heroDescription: 'Leer Bulgaars door leuke, korte lessen met je vriendelijke maatje. Van Cyrillisch naar gesprekken in slechts 15 minuten per dag!',
  startLearning: 'Begin met leren',
  lessons: 'Lessen',
  minPerDay: '15 min/dag',
  meetShpoko: 'Ontmoet Shpoko!',
  shpokoDescription: 'Je Bulgaarse leermaatje. Ik begeleid je door elke les!',
  shpokoGreeting: '💬 "Здравей! Klaar om te beginnen?"',
  shpokoGreetingTranslation: '(Hallo! Klaar om te beginnen?)',
  
  // Lesson Selector
  chooseYourLevel: 'Kies je niveau',
  beginner: 'Beginner',
  intermediate: 'Gemiddeld',
  advanced: 'Gevorderd',
  lessonsCount: 'lessen',
  completed: 'voltooid',
  unlocked: 'ontgrendeld',
  back: '← Terug',
  lessonsLabel: 'Lessen',
  assessment: 'Beoordeling',
  testYourKnowledge: 'Test je kennis van alle lessen!',
  completeMoreLessons: 'meer lessen om te ontgrendelen',
  takeTest: 'Doe de test',
  streak: 'Streak',
  revise: 'Herhalen',
  everyStreakUnlocks: 'Elke 5 streak-dagen ontgrendelt 1 premium les!',
  daysToNext: 'dagen tot volgende',
  noLessonsAvailable: 'Nog geen lessen beschikbaar in deze categorie.',
  
  // Daily Games
  dailyGames: 'Dagelijkse spelletjes',
  dailyChallenge: 'Dagelijkse uitdaging',
  animals: 'Dieren',
  colors: 'Kleuren',
  numbers: 'Nummers',
  playNow: 'Speel nu!',
  accuracy: 'Nauwkeurigheid',
  speed: 'Snelheid',
  upToPoints: 'Tot 100 punten',
  yourHighScore: 'Jouw hoogste score:',
  startGame: 'Start spel (60s)',
  gameLocked: 'Spel vergrendeld',
  comeBackIn: 'Kom terug over',
  gameOver: 'Spel voorbij!',
  finalScore: 'Eindscore:',
  answered: 'Beantwoord',
  newHighScore: 'Nieuw record!',
  xpEarned: 'XP verdiend:',
  close: 'Sluiten',
  skip: 'Overslaan',
  submit: 'Versturen',
  points: 'punten',
  skipped: 'Overgeslagen',
  correctAnswer: 'Juist:',
  typeBulgarianName: 'Typ de Bulgaarse naam...',
  
  // General
  xp: 'XP',
  level: 'Nv.',
  signIn: 'Inloggen',
  dayStreak: 'dagen streak',
  
  // Lessons categories
  basics: 'Basis',
  vocabulary: 'Woordenschat',
  grammar: 'Grammatica',
  phrases: 'Zinnen',
  culture: 'Cultuur',
  
  // Category navigation
  daily: 'Dagelijks',
  games: 'Spelletjes',
  stories: 'Verhalen',
  dailyActivities: 'Dagelijkse activiteiten',
  learnBulgarian: 'Leer Bulgaars',
  funChallenges: 'Leuke uitdagingen',
  readAndLearn: 'Lees & leer',
  
  // Common lesson UI
  correct: 'Goed!',
  incorrect: 'Fout',
  continue: 'Doorgaan',
  tryAgain: 'Probeer opnieuw',
  finish: 'Voltooien',
  progress: 'Voortgang',
  
  // Word of the Day
  wordOfTheDay: 'Woord van de dag',
  pronunciation: 'Uitspraak',
  meaning: 'Betekenis',
  examples: 'Voorbeelden',
  
  // Short Stories
  shortStories: 'Korte verhalen',
  readStoriesDescription: 'Lees verhalen & beantwoord vragen om XP te verdienen!',
  viewAllStories: 'Bekijk alle verhalen',
  
  // Hall of Fame
  hallOfFame: 'Hall of Fame',
  noChampionsYet: 'Nog geen kampioenen! Wees de eerste die de top bereikt aan het einde van de maand.',
  
  // Leaderboard
  leaderboardRank: 'Ranglijst positie',
  outOfLearners: 'van {count} leerlingen',
  topLearners: 'Top leerlingen',
  noLearnersYet: 'Nog geen leerlingen. Wees de eerste!',
  you: 'Jij',
  notRanked: 'Niet gerangschikt',
  loading: 'Laden...',
  
  // Auth
  welcomeBack: 'Welkom terug!',
  joinShpoko: 'Word lid van Shpoko',
  enterCredentials: 'Voer je gegevens in om door te gaan met leren',
  createAccountDescription: 'Maak een account aan om je Bulgaarse leerreis te beginnen',
  username: 'Gebruikersnaam',
  chooseUsername: 'Kies een gebruikersnaam',
  email: 'E-mail',
  enterEmail: 'Voer je e-mail in',
  password: 'Wachtwoord',
  enterPassword: 'Voer je wachtwoord in',
  confirmPassword: 'Bevestig wachtwoord',
  confirmYourPassword: 'Bevestig je wachtwoord',
  logIn: 'Inloggen',
  createAccount: 'Account aanmaken',
  newToShpoko: 'Nieuw bij Shpoko?',
  alreadyHaveAccount: 'Heb je al een account?',
  loginFailed: 'Inloggen mislukt',
  invalidCredentials: 'Ongeldige e-mail of wachtwoord. Probeer opnieuw.',
  signUpFailed: 'Registratie mislukt',
  welcomeToShpoko: 'Welkom bij Shpoko!',
  accountCreated: 'Je account is aangemaakt. Begin met leren!',
  emailAlreadyRegistered: 'E-mail al geregistreerd',
  emailInUse: 'Deze e-mail is al in gebruik. Log in of gebruik een andere e-mail.',
  
  // Games
  contexto: 'Contexto',
  guessTheWord: 'Raad het woord',
  rapidFire: 'Snelvuur',
  sevenSecRounds: '7s rondes',
  conjugation: 'Vervoeging',
  verbForms: 'Werkwoordvormen',
  clozeCombat: 'Cloze gevecht',
  findWrongWord: 'Vind het foute woord',
  fixMyBulgarian: 'Verbeter mijn Bulgaars',
  proofread: 'Proeflezen',
  listeningFill: 'Luister & vul in',
  audioBlanks: 'Audio lege plekken',
  dialogueBattle: 'Dialooggevecht',
  realConversations: 'Echte gesprekken',
  
  // Lesson UI
  lessonComplete: 'Les voltooid!',
  revisionComplete: 'Herhaling voltooid!',
  greatPractice: 'Geweldige oefening!',
  correctAnswers: 'goede antwoorden',
  reviseAgain: 'Opnieuw herhalen',
  nextLesson: 'Volgende:',
  previousLesson: 'Vorige:',
  backToLessons: 'Terug naar lessen',
  typeTransliteration: 'Typ de transliteratie',
  fillInBlank: 'Vul de lege plek in',
  chooseCorrect: 'Kies het juiste antwoord',
  showHint: 'Toon hint',
  check: 'Controleren',
  next: 'Volgende',
  complete: 'Voltooien',
  completeLesson: 'Les voltooien',
  theAnswerIs: 'Het antwoord is:',
  revision: 'Herhaling',
  revisionMode: 'Herhalingsmodus',
  
  // Lesson titles
  colorsLesson: 'Kleuren',
  animalsLesson: 'Dieren',
  numbersLesson: 'Nummers',
  familyLesson: 'Familie',
  weatherLesson: 'Weer',
  foodDrinksLesson: 'Eten & Drinken',
  verbsLesson: 'Werkwoorden',
  adjectivesLesson: 'Bijvoeglijke naamwoorden',
  pronounsLesson: 'Voornaamwoorden',
  directionsLesson: 'Richtingen',
  weekdaysLesson: 'Weekdagen',
  jobsLesson: 'Beroepen',
  shapesLesson: 'Vormen',
  survivalPhrasesLesson: 'Overlevingszinnen',
  
  // Lesson hints (Dutch translations)
  hintRed: 'Rood',
  hintBlue: 'Blauw',
  hintGreen: 'Groen',
  hintYellow: 'Geel',
  hintOrange: 'Oranje',
  hintDog: 'Hond',
  hintCat: 'Kat',
  hintBird: 'Vogel',
  hintFish: 'Vis',
  hintHorse: 'Paard',
  hintMother: 'Moeder',
  hintFather: 'Vader',
  hintSister: 'Zus',
  hintBrother: 'Broer',
  hintGrandmother: 'Oma',
  hintSun: 'Zon',
  hintRain: 'Regen',
  hintSnow: 'Sneeuw',
  hintWind: 'Wind',
  hintCold: 'Koud',
  hintBread: 'Brood',
  hintWater: 'Water',
  hintCoffee: 'Koffie',
  hintTea: 'Thee',
  hintMilk: 'Melk',
  hintMeat: 'Vlees',
  hintEgg: 'Ei',
  hintCheese: 'Kaas',
  hintFruit: 'Fruit',
  hintVegetable: 'Groente',
  hintBeer: 'Bier',
  hintWine: 'Wijn',
  hintJuice: 'Sap',
  hintSoup: 'Soep',
  
  // Fill blank translations
  theSkyIsBlue: 'De lucht is blauw',
  theGrassIsGreen: 'Het gras is groen',
  theSunIsYellow: 'De zon is geel',
  theCowGivesMilk: 'De koe geeft melk',
  thePigLivesOnFarm: 'Het varken woont op een boerderij',
  theRabbitEatsCarrots: 'Het konijn eet wortels',
  myMotherIsKind: 'Mijn moeder is erg aardig',
  myGrandfatherIs70: 'Mijn opa is 70 jaar oud',
  iHaveOneSister: 'Ik heb één zus',
  todayIsVeryHot: 'Vandaag is het erg warm',
  itIsRaining: 'Het regent buiten',
  winterIsCold: 'De winter is koud',
};

export const getTranslations = (language: UILanguage): Translations => {
  switch (language) {
    case 'swedish':
      return swedishTranslations;
    case 'bulgarian':
      return bulgarianTranslations;
    case 'tunisian':
      return tunisianTranslations;
    case 'dutch':
      return dutchTranslations;
    case 'greek':
      return greekTranslations;
    case 'russian':
      return russianTranslations;
    case 'ukrainian':
      return ukrainianTranslations;
    case 'italian':
      return italianTranslations;
    case 'polish':
      return polishTranslations;
    default:
      return englishTranslations;
  }
};

// Greek translations - Complete
const greekTranslations: Translations = {
  // Header
  quizzes: 'Κουίζ',
  leaderboard: 'Κατάταξη',
  premium: 'Premium',
  
  // Hero Section
  heroTitle: 'Μάθε Βουλγαρικά με',
  heroTitleHighlight: 'Shpoko',
  heroDescription: 'Κατάκτησε τα Βουλγαρικά μέσα από διασκεδαστικά μαθήματα με τον φιλικό σου σύντροφο. Από το Κυριλλικό αλφάβητο στη συνομιλία σε 15 λεπτά την ημέρα!',
  startLearning: 'Ξεκίνα να Μαθαίνεις',
  lessons: 'Μαθήματα',
  minPerDay: '15 Λεπτά/Ημέρα',
  meetShpoko: 'Γνώρισε τον Shpoko!',
  shpokoDescription: 'Ο σύντροφος σου για τα Βουλγαρικά. Θα σε καθοδηγήσω σε κάθε μάθημα!',
  shpokoGreeting: '💬 "Здравей! Έτοιμος να ξεκινήσεις;"',
  shpokoGreetingTranslation: '(Γεια! Έτοιμος να ξεκινήσεις;)',
  
  // Lesson Selector
  chooseYourLevel: 'Διάλεξε το Επίπεδό σου',
  beginner: 'Αρχάριος',
  intermediate: 'Μεσαίος',
  advanced: 'Προχωρημένος',
  lessonsCount: 'μαθήματα',
  completed: 'ολοκληρώθηκαν',
  unlocked: 'ξεκλειδώθηκαν',
  back: '← Πίσω',
  lessonsLabel: 'Μαθήματα',
  assessment: 'Αξιολόγηση',
  testYourKnowledge: 'Δοκίμασε τις γνώσεις σου από όλα τα μαθήματα!',
  completeMoreLessons: 'ακόμα μαθήματα για ξεκλείδωμα',
  takeTest: 'Κάνε το Τεστ',
  streak: 'Σερί',
  revise: 'Επανάληψη',
  everyStreakUnlocks: 'Κάθε 5 ημέρες σερί ξεκλειδώνει 1 premium μάθημα!',
  daysToNext: 'ημέρες μέχρι το επόμενο',
  noLessonsAvailable: 'Δεν υπάρχουν μαθήματα σε αυτή την κατηγορία ακόμα.',
  
  // Daily Games
  dailyGames: 'Καθημερινά Παιχνίδια',
  dailyChallenge: 'Καθημερινή Πρόκληση',
  animals: 'Ζώα',
  colors: 'Χρώματα',
  numbers: 'Αριθμοί',
  playNow: 'Παίξε τώρα!',
  accuracy: 'Ακρίβεια',
  speed: 'Ταχύτητα',
  upToPoints: 'Έως 100 πόντοι',
  yourHighScore: 'Το ρεκόρ σου:',
  startGame: 'Ξεκίνα το Παιχνίδι (60δ)',
  gameLocked: 'Κλειδωμένο Παιχνίδι',
  comeBackIn: 'Έλα ξανά σε',
  gameOver: 'Τέλος Παιχνιδιού!',
  finalScore: 'Τελικό Σκορ:',
  answered: 'Απαντήθηκαν',
  newHighScore: 'Νέο Ρεκόρ!',
  xpEarned: 'XP που κέρδισες:',
  close: 'Κλείσιμο',
  skip: 'Παράλειψη',
  submit: 'Υποβολή',
  points: 'πόντοι',
  skipped: 'Παραλείφθηκε',
  correctAnswer: 'Σωστό:',
  typeBulgarianName: 'Γράψε το βουλγαρικό όνομα...',
  
  // General
  xp: 'XP',
  level: 'Επ.',
  signIn: 'Σύνδεση',
  dayStreak: 'ημέρες σερί',
  
  // Lessons categories
  basics: 'Βασικά',
  vocabulary: 'Λεξιλόγιο',
  grammar: 'Γραμματική',
  phrases: 'Φράσεις',
  culture: 'Πολιτισμός',
  
  // Category navigation
  daily: 'Καθημερινά',
  games: 'Παιχνίδια',
  stories: 'Ιστορίες',
  dailyActivities: 'Καθημερινές δραστηριότητες',
  learnBulgarian: 'Μάθε Βουλγαρικά',
  funChallenges: 'Διασκεδαστικές προκλήσεις',
  readAndLearn: 'Διάβασε & μάθε',
  
  // Common lesson UI
  correct: 'Σωστά!',
  incorrect: 'Λάθος',
  continue: 'Συνέχεια',
  tryAgain: 'Δοκίμασε Ξανά',
  finish: 'Τέλος',
  progress: 'Πρόοδος',
  
  // Word of the Day
  wordOfTheDay: 'Λέξη της Ημέρας',
  pronunciation: 'Προφορά',
  meaning: 'Σημασία',
  examples: 'Παραδείγματα',
  
  // Short Stories
  shortStories: 'Σύντομες Ιστορίες',
  readStoriesDescription: 'Διάβασε ιστορίες & απάντησε σε ερωτήσεις για XP!',
  viewAllStories: 'Δες Όλες τις Ιστορίες',
  
  // Hall of Fame
  hallOfFame: 'Αίθουσα της Φήμης',
  noChampionsYet: 'Δεν υπάρχουν πρωταθλητές ακόμα! Γίνε ο πρώτος που θα κατακτήσει την κορυφή στο τέλος του μήνα.',
  
  // Leaderboard
  leaderboardRank: 'Θέση στην Κατάταξη',
  outOfLearners: 'από {count} μαθητές',
  topLearners: 'Κορυφαίοι Μαθητές',
  noLearnersYet: 'Δεν υπάρχουν μαθητές ακόμα. Γίνε ο πρώτος!',
  you: 'Εσύ',
  notRanked: 'Χωρίς κατάταξη',
  loading: 'Φόρτωση...',
  
  // Auth
  welcomeBack: 'Καλώς Ήρθες Πίσω!',
  joinShpoko: 'Γίνε Μέλος του Shpoko',
  enterCredentials: 'Εισάγαγε τα στοιχεία σου για να συνεχίσεις να μαθαίνεις',
  createAccountDescription: 'Δημιούργησε λογαριασμό για να ξεκινήσεις το ταξίδι σου στα Βουλγαρικά',
  username: 'Όνομα χρήστη',
  chooseUsername: 'Διάλεξε όνομα χρήστη',
  email: 'Email',
  enterEmail: 'Εισάγαγε το email σου',
  password: 'Κωδικός',
  enterPassword: 'Εισάγαγε τον κωδικό σου',
  confirmPassword: 'Επιβεβαίωση Κωδικού',
  confirmYourPassword: 'Επιβεβαίωσε τον κωδικό σου',
  logIn: 'Σύνδεση',
  createAccount: 'Δημιουργία Λογαριασμού',
  newToShpoko: 'Νέος στο Shpoko;',
  alreadyHaveAccount: 'Έχεις ήδη λογαριασμό;',
  loginFailed: 'Η Σύνδεση Απέτυχε',
  invalidCredentials: 'Λάθος email ή κωδικός. Δοκίμασε ξανά.',
  signUpFailed: 'Η Εγγραφή Απέτυχε',
  welcomeToShpoko: 'Καλώς ήρθες στο Shpoko!',
  accountCreated: 'Ο λογαριασμός σου δημιουργήθηκε. Ξεκίνα να μαθαίνεις!',
  emailAlreadyRegistered: 'Το Email Υπάρχει Ήδη',
  emailInUse: 'Αυτό το email χρησιμοποιείται ήδη. Συνδέσου ή χρησιμοποίησε διαφορετικό email.',
  
  // Games
  contexto: 'Contexto',
  guessTheWord: 'Μάντεψε τη λέξη',
  rapidFire: 'Γρήγορη Φωτιά',
  sevenSecRounds: 'γύροι 7δ',
  conjugation: 'Κλίση',
  verbForms: 'Ρηματικές μορφές',
  clozeCombat: 'Cloze Combat',
  findWrongWord: 'Βρες τη λάθος λέξη',
  fixMyBulgarian: 'Διόρθωσε τα Βουλγαρικά μου',
  proofread: 'Διόρθωση',
  listeningFill: 'Άκου & Συμπλήρωσε',
  audioBlanks: 'Ηχητικά κενά',
  dialogueBattle: 'Μάχη Διαλόγου',
  realConversations: 'Πραγματικές συνομιλίες',
  
  // Lesson UI
  lessonComplete: 'Μάθημα Ολοκληρώθηκε!',
  revisionComplete: 'Επανάληψη Ολοκληρώθηκε!',
  greatPractice: 'Εξαιρετική εξάσκηση!',
  correctAnswers: 'σωστές απαντήσεις',
  reviseAgain: 'Επανάληψη Ξανά',
  nextLesson: 'Επόμενο:',
  previousLesson: 'Προηγούμενο:',
  backToLessons: 'Πίσω στα Μαθήματα',
  typeTransliteration: 'Γράψε τη μεταγραφή',
  fillInBlank: 'Συμπλήρωσε το κενό',
  chooseCorrect: 'Διάλεξε τη σωστή απάντηση',
  showHint: 'Δείξε Υπόδειξη',
  check: 'Έλεγχος',
  next: 'Επόμενο',
  complete: 'Ολοκλήρωση',
  completeLesson: 'Ολοκλήρωσε το Μάθημα',
  theAnswerIs: 'Η απάντηση είναι:',
  revision: 'Επανάληψη',
  revisionMode: 'Λειτουργία Επανάληψης',
  
  // Lesson titles
  colorsLesson: 'Χρώματα',
  animalsLesson: 'Ζώα',
  numbersLesson: 'Αριθμοί',
  familyLesson: 'Οικογένεια',
  weatherLesson: 'Καιρός',
  foodDrinksLesson: 'Φαγητό & Ποτά',
  verbsLesson: 'Ρήματα',
  adjectivesLesson: 'Επίθετα',
  pronounsLesson: 'Αντωνυμίες',
  directionsLesson: 'Κατευθύνσεις',
  weekdaysLesson: 'Ημέρες της εβδομάδας',
  jobsLesson: 'Επαγγέλματα',
  shapesLesson: 'Σχήματα',
  survivalPhrasesLesson: 'Φράσεις Επιβίωσης',
  
  // Lesson hints
  hintRed: 'Κόκκινο',
  hintBlue: 'Μπλε',
  hintGreen: 'Πράσινο',
  hintYellow: 'Κίτρινο',
  hintOrange: 'Πορτοκαλί',
  hintDog: 'Σκύλος',
  hintCat: 'Γάτα',
  hintBird: 'Πουλί',
  hintFish: 'Ψάρι',
  hintHorse: 'Άλογο',
  hintMother: 'Μητέρα',
  hintFather: 'Πατέρας',
  hintSister: 'Αδερφή',
  hintBrother: 'Αδερφός',
  hintGrandmother: 'Γιαγιά',
  hintSun: 'Ήλιος',
  hintRain: 'Βροχή',
  hintSnow: 'Χιόνι',
  hintWind: 'Άνεμος',
  hintCold: 'Κρύο',
  hintBread: 'Ψωμί',
  hintWater: 'Νερό',
  hintCoffee: 'Καφές',
  hintTea: 'Τσάι',
  hintMilk: 'Γάλα',
  hintMeat: 'Κρέας',
  hintEgg: 'Αυγό',
  hintCheese: 'Τυρί',
  hintFruit: 'Φρούτο',
  hintVegetable: 'Λαχανικό',
  hintBeer: 'Μπύρα',
  hintWine: 'Κρασί',
  hintJuice: 'Χυμός',
  hintSoup: 'Σούπα',
  
  // Fill blank translations
  theSkyIsBlue: 'Ο ουρανός είναι μπλε',
  theGrassIsGreen: 'Το γρασίδι είναι πράσινο',
  theSunIsYellow: 'Ο ήλιος είναι κίτρινος',
  theCowGivesMilk: 'Η αγελάδα δίνει γάλα',
  thePigLivesOnFarm: 'Το γουρούνι ζει σε φάρμα',
  theRabbitEatsCarrots: 'Το κουνέλι τρώει καρότα',
  myMotherIsKind: 'Η μητέρα μου είναι πολύ καλή',
  myGrandfatherIs70: 'Ο παππούς μου είναι 70 ετών',
  iHaveOneSister: 'Έχω μία αδερφή',
  todayIsVeryHot: 'Σήμερα κάνει πολύ ζέστη',
  itIsRaining: 'Βρέχει έξω',
  winterIsCold: 'Ο χειμώνας είναι κρύος',
};

// Russian translations - Complete
const russianTranslations: Translations = {
  // Header
  quizzes: 'Викторины',
  leaderboard: 'Таблица лидеров',
  premium: 'Премиум',
  
  // Hero Section
  heroTitle: 'Учи болгарский с',
  heroTitleHighlight: 'Shpoko',
  heroDescription: 'Освой болгарский через веселые мини-уроки с дружелюбным компаньоном. От кириллицы до разговора за 15 минут в день!',
  startLearning: 'Начать учиться',
  lessons: 'Уроки',
  minPerDay: '15 мин/день',
  meetShpoko: 'Познакомься с Shpoko!',
  shpokoDescription: 'Твой компаньон для изучения болгарского. Я проведу тебя через каждый урок!',
  shpokoGreeting: '💬 "Здравей! Готов начать?"',
  shpokoGreetingTranslation: '(Привет! Готов начать?)',
  
  // Lesson Selector
  chooseYourLevel: 'Выбери свой уровень',
  beginner: 'Начинающий',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
  lessonsCount: 'уроков',
  completed: 'завершено',
  unlocked: 'разблокировано',
  back: '← Назад',
  lessonsLabel: 'Уроки',
  assessment: 'Оценка',
  testYourKnowledge: 'Проверь свои знания по всем урокам!',
  completeMoreLessons: 'ещё уроков для разблокировки',
  takeTest: 'Пройти тест',
  streak: 'Серия',
  revise: 'Повторить',
  everyStreakUnlocks: 'Каждые 5 дней серии открывают 1 премиум урок!',
  daysToNext: 'дней до следующего',
  noLessonsAvailable: 'В этой категории пока нет уроков.',
  
  // Daily Games
  dailyGames: 'Ежедневные игры',
  dailyChallenge: 'Ежедневный вызов',
  animals: 'Животные',
  colors: 'Цвета',
  numbers: 'Числа',
  playNow: 'Играть!',
  accuracy: 'Точность',
  speed: 'Скорость',
  upToPoints: 'До 100 очков',
  yourHighScore: 'Твой рекорд:',
  startGame: 'Начать игру (60с)',
  gameLocked: 'Игра заблокирована',
  comeBackIn: 'Возвращайся через',
  gameOver: 'Игра окончена!',
  finalScore: 'Итоговый счёт:',
  answered: 'Отвечено',
  newHighScore: 'Новый рекорд!',
  xpEarned: 'Заработано XP:',
  close: 'Закрыть',
  skip: 'Пропустить',
  submit: 'Отправить',
  points: 'очков',
  skipped: 'Пропущено',
  correctAnswer: 'Правильно:',
  typeBulgarianName: 'Введи болгарское название...',
  
  // General
  xp: 'XP',
  level: 'Ур.',
  signIn: 'Войти',
  dayStreak: 'дней серия',
  
  // Lessons categories
  basics: 'Основы',
  vocabulary: 'Словарь',
  grammar: 'Грамматика',
  phrases: 'Фразы',
  culture: 'Культура',
  
  // Category navigation
  daily: 'Ежедневно',
  games: 'Игры',
  stories: 'Рассказы',
  dailyActivities: 'Ежедневные задания',
  learnBulgarian: 'Учи болгарский',
  funChallenges: 'Весёлые вызовы',
  readAndLearn: 'Читай и учись',
  
  // Common lesson UI
  correct: 'Правильно!',
  incorrect: 'Неправильно',
  continue: 'Продолжить',
  tryAgain: 'Попробуй снова',
  finish: 'Завершить',
  progress: 'Прогресс',
  
  // Word of the Day
  wordOfTheDay: 'Слово дня',
  pronunciation: 'Произношение',
  meaning: 'Значение',
  examples: 'Примеры',
  
  // Short Stories
  shortStories: 'Короткие рассказы',
  readStoriesDescription: 'Читай рассказы и отвечай на вопросы для XP!',
  viewAllStories: 'Все рассказы',
  
  // Hall of Fame
  hallOfFame: 'Зал славы',
  noChampionsYet: 'Пока нет чемпионов! Стань первым, кто займёт первое место в конце месяца.',
  
  // Leaderboard
  leaderboardRank: 'Место в рейтинге',
  outOfLearners: 'из {count} учеников',
  topLearners: 'Лучшие ученики',
  noLearnersYet: 'Пока нет учеников. Будь первым!',
  you: 'Ты',
  notRanked: 'Нет в рейтинге',
  loading: 'Загрузка...',
  
  // Auth
  welcomeBack: 'С возвращением!',
  joinShpoko: 'Присоединяйся к Shpoko',
  enterCredentials: 'Введи данные для продолжения обучения',
  createAccountDescription: 'Создай аккаунт, чтобы начать изучение болгарского',
  username: 'Имя пользователя',
  chooseUsername: 'Выбери имя пользователя',
  email: 'Email',
  enterEmail: 'Введи email',
  password: 'Пароль',
  enterPassword: 'Введи пароль',
  confirmPassword: 'Подтверди пароль',
  confirmYourPassword: 'Подтверди свой пароль',
  logIn: 'Войти',
  createAccount: 'Создать аккаунт',
  newToShpoko: 'Новичок в Shpoko?',
  alreadyHaveAccount: 'Уже есть аккаунт?',
  loginFailed: 'Ошибка входа',
  invalidCredentials: 'Неверный email или пароль. Попробуй снова.',
  signUpFailed: 'Ошибка регистрации',
  welcomeToShpoko: 'Добро пожаловать в Shpoko!',
  accountCreated: 'Твой аккаунт создан. Начинай учиться!',
  emailAlreadyRegistered: 'Email уже зарегистрирован',
  emailInUse: 'Этот email уже используется. Войди или используй другой email.',
  
  // Games
  contexto: 'Контексто',
  guessTheWord: 'Угадай слово',
  rapidFire: 'Скорострел',
  sevenSecRounds: 'раунды 7с',
  conjugation: 'Спряжение',
  verbForms: 'Формы глаголов',
  clozeCombat: 'Cloze Combat',
  findWrongWord: 'Найди ошибку',
  fixMyBulgarian: 'Исправь мой болгарский',
  proofread: 'Корректура',
  listeningFill: 'Слушай и заполняй',
  audioBlanks: 'Аудио пробелы',
  dialogueBattle: 'Диалоговый бой',
  realConversations: 'Реальные разговоры',
  
  // Lesson UI
  lessonComplete: 'Урок завершён!',
  revisionComplete: 'Повторение завершено!',
  greatPractice: 'Отличная практика!',
  correctAnswers: 'правильных ответов',
  reviseAgain: 'Повторить снова',
  nextLesson: 'Далее:',
  previousLesson: 'Назад:',
  backToLessons: 'К урокам',
  typeTransliteration: 'Введи транслитерацию',
  fillInBlank: 'Заполни пробел',
  chooseCorrect: 'Выбери правильный ответ',
  showHint: 'Показать подсказку',
  check: 'Проверить',
  next: 'Далее',
  complete: 'Завершить',
  completeLesson: 'Завершить урок',
  theAnswerIs: 'Ответ:',
  revision: 'Повторение',
  revisionMode: 'Режим повторения',
  
  // Lesson titles
  colorsLesson: 'Цвета',
  animalsLesson: 'Животные',
  numbersLesson: 'Числа',
  familyLesson: 'Семья',
  weatherLesson: 'Погода',
  foodDrinksLesson: 'Еда и напитки',
  verbsLesson: 'Глаголы',
  adjectivesLesson: 'Прилагательные',
  pronounsLesson: 'Местоимения',
  directionsLesson: 'Направления',
  weekdaysLesson: 'Дни недели',
  jobsLesson: 'Профессии',
  shapesLesson: 'Формы',
  survivalPhrasesLesson: 'Фразы для выживания',
  
  // Lesson hints
  hintRed: 'Красный',
  hintBlue: 'Синий',
  hintGreen: 'Зелёный',
  hintYellow: 'Жёлтый',
  hintOrange: 'Оранжевый',
  hintDog: 'Собака',
  hintCat: 'Кошка',
  hintBird: 'Птица',
  hintFish: 'Рыба',
  hintHorse: 'Лошадь',
  hintMother: 'Мать',
  hintFather: 'Отец',
  hintSister: 'Сестра',
  hintBrother: 'Брат',
  hintGrandmother: 'Бабушка',
  hintSun: 'Солнце',
  hintRain: 'Дождь',
  hintSnow: 'Снег',
  hintWind: 'Ветер',
  hintCold: 'Холодно',
  hintBread: 'Хлеб',
  hintWater: 'Вода',
  hintCoffee: 'Кофе',
  hintTea: 'Чай',
  hintMilk: 'Молоко',
  hintMeat: 'Мясо',
  hintEgg: 'Яйцо',
  hintCheese: 'Сыр',
  hintFruit: 'Фрукт',
  hintVegetable: 'Овощ',
  hintBeer: 'Пиво',
  hintWine: 'Вино',
  hintJuice: 'Сок',
  hintSoup: 'Суп',
  
  // Fill blank translations
  theSkyIsBlue: 'Небо голубое',
  theGrassIsGreen: 'Трава зелёная',
  theSunIsYellow: 'Солнце жёлтое',
  theCowGivesMilk: 'Корова даёт молоко',
  thePigLivesOnFarm: 'Свинья живёт на ферме',
  theRabbitEatsCarrots: 'Кролик ест морковь',
  myMotherIsKind: 'Моя мама очень добрая',
  myGrandfatherIs70: 'Моему дедушке 70 лет',
  iHaveOneSister: 'У меня есть одна сестра',
  todayIsVeryHot: 'Сегодня очень жарко',
  itIsRaining: 'На улице дождь',
  winterIsCold: 'Зима холодная',
};

// Ukrainian translations - Complete
const ukrainianTranslations: Translations = {
  // Header
  quizzes: 'Вікторини',
  leaderboard: 'Таблиця лідерів',
  premium: 'Преміум',
  
  // Hero Section
  heroTitle: 'Вивчай болгарську з',
  heroTitleHighlight: 'Shpoko',
  heroDescription: 'Опануй болгарську через веселі міні-уроки з дружнім компаньйоном. Від кирилиці до розмови за 15 хвилин на день!',
  startLearning: 'Почати вчитися',
  lessons: 'Уроки',
  minPerDay: '15 хв/день',
  meetShpoko: 'Познайомся з Shpoko!',
  shpokoDescription: 'Твій компаньйон для вивчення болгарської. Я проведу тебе через кожен урок!',
  shpokoGreeting: '💬 "Здравей! Готовий почати?"',
  shpokoGreetingTranslation: '(Привіт! Готовий почати?)',
  
  // Lesson Selector
  chooseYourLevel: 'Обери свій рівень',
  beginner: 'Початківець',
  intermediate: 'Середній',
  advanced: 'Просунутий',
  lessonsCount: 'уроків',
  completed: 'завершено',
  unlocked: 'розблоковано',
  back: '← Назад',
  lessonsLabel: 'Уроки',
  assessment: 'Оцінка',
  testYourKnowledge: 'Перевір свої знання з усіх уроків!',
  completeMoreLessons: 'ще уроків для розблокування',
  takeTest: 'Пройти тест',
  streak: 'Серія',
  revise: 'Повторити',
  everyStreakUnlocks: 'Кожні 5 днів серії відкривають 1 преміум урок!',
  daysToNext: 'днів до наступного',
  noLessonsAvailable: 'У цій категорії поки немає уроків.',
  
  // Daily Games
  dailyGames: 'Щоденні ігри',
  dailyChallenge: 'Щоденний виклик',
  animals: 'Тварини',
  colors: 'Кольори',
  numbers: 'Числа',
  playNow: 'Грати!',
  accuracy: 'Точність',
  speed: 'Швидкість',
  upToPoints: 'До 100 очок',
  yourHighScore: 'Твій рекорд:',
  startGame: 'Почати гру (60с)',
  gameLocked: 'Гра заблокована',
  comeBackIn: 'Повертайся через',
  gameOver: 'Гра закінчена!',
  finalScore: 'Підсумковий рахунок:',
  answered: 'Відповіли',
  newHighScore: 'Новий рекорд!',
  xpEarned: 'Зароблено XP:',
  close: 'Закрити',
  skip: 'Пропустити',
  submit: 'Надіслати',
  points: 'очок',
  skipped: 'Пропущено',
  correctAnswer: 'Правильно:',
  typeBulgarianName: 'Введи болгарську назву...',
  
  // General
  xp: 'XP',
  level: 'Рів.',
  signIn: 'Увійти',
  dayStreak: 'днів серія',
  
  // Lessons categories
  basics: 'Основи',
  vocabulary: 'Словник',
  grammar: 'Граматика',
  phrases: 'Фрази',
  culture: 'Культура',
  
  // Category navigation
  daily: 'Щоденно',
  games: 'Ігри',
  stories: 'Оповідання',
  dailyActivities: 'Щоденні завдання',
  learnBulgarian: 'Вивчай болгарську',
  funChallenges: 'Веселі виклики',
  readAndLearn: 'Читай і вчися',
  
  // Common lesson UI
  correct: 'Правильно!',
  incorrect: 'Неправильно',
  continue: 'Продовжити',
  tryAgain: 'Спробуй знову',
  finish: 'Завершити',
  progress: 'Прогрес',
  
  // Word of the Day
  wordOfTheDay: 'Слово дня',
  pronunciation: 'Вимова',
  meaning: 'Значення',
  examples: 'Приклади',
  
  // Short Stories
  shortStories: 'Короткі оповідання',
  readStoriesDescription: 'Читай оповідання та відповідай на питання для XP!',
  viewAllStories: 'Всі оповідання',
  
  // Hall of Fame
  hallOfFame: 'Зала слави',
  noChampionsYet: 'Поки немає чемпіонів! Стань першим, хто займе перше місце в кінці місяця.',
  
  // Leaderboard
  leaderboardRank: 'Місце в рейтингу',
  outOfLearners: 'з {count} учнів',
  topLearners: 'Найкращі учні',
  noLearnersYet: 'Поки немає учнів. Будь першим!',
  you: 'Ти',
  notRanked: 'Не в рейтингу',
  loading: 'Завантаження...',
  
  // Auth
  welcomeBack: 'З поверненням!',
  joinShpoko: 'Приєднуйся до Shpoko',
  enterCredentials: 'Введи дані для продовження навчання',
  createAccountDescription: 'Створи акаунт, щоб почати вивчення болгарської',
  username: "Ім'я користувача",
  chooseUsername: "Обери ім'я користувача",
  email: 'Email',
  enterEmail: 'Введи email',
  password: 'Пароль',
  enterPassword: 'Введи пароль',
  confirmPassword: 'Підтверди пароль',
  confirmYourPassword: 'Підтверди свій пароль',
  logIn: 'Увійти',
  createAccount: 'Створити акаунт',
  newToShpoko: 'Новачок у Shpoko?',
  alreadyHaveAccount: 'Вже є акаунт?',
  loginFailed: 'Помилка входу',
  invalidCredentials: 'Невірний email або пароль. Спробуй знову.',
  signUpFailed: 'Помилка реєстрації',
  welcomeToShpoko: 'Ласкаво просимо до Shpoko!',
  accountCreated: 'Твій акаунт створено. Починай вчитися!',
  emailAlreadyRegistered: 'Email вже зареєстрований',
  emailInUse: 'Цей email вже використовується. Увійди або використай інший email.',
  
  // Games
  contexto: 'Контексто',
  guessTheWord: 'Вгадай слово',
  rapidFire: 'Швидкострільність',
  sevenSecRounds: 'раунди 7с',
  conjugation: 'Відмінювання',
  verbForms: 'Форми дієслів',
  clozeCombat: 'Cloze Combat',
  findWrongWord: 'Знайди помилку',
  fixMyBulgarian: 'Виправ мою болгарську',
  proofread: 'Коректура',
  listeningFill: 'Слухай і заповнюй',
  audioBlanks: 'Аудіо пробіли',
  dialogueBattle: 'Діалоговий бій',
  realConversations: 'Реальні розмови',
  
  // Lesson UI
  lessonComplete: 'Урок завершено!',
  revisionComplete: 'Повторення завершено!',
  greatPractice: 'Чудова практика!',
  correctAnswers: 'правильних відповідей',
  reviseAgain: 'Повторити знову',
  nextLesson: 'Далі:',
  previousLesson: 'Назад:',
  backToLessons: 'До уроків',
  typeTransliteration: 'Введи транслітерацію',
  fillInBlank: 'Заповни пробіл',
  chooseCorrect: 'Обери правильну відповідь',
  showHint: 'Показати підказку',
  check: 'Перевірити',
  next: 'Далі',
  complete: 'Завершити',
  completeLesson: 'Завершити урок',
  theAnswerIs: 'Відповідь:',
  revision: 'Повторення',
  revisionMode: 'Режим повторення',
  
  // Lesson titles
  colorsLesson: 'Кольори',
  animalsLesson: 'Тварини',
  numbersLesson: 'Числа',
  familyLesson: "Сім'я",
  weatherLesson: 'Погода',
  foodDrinksLesson: 'Їжа та напої',
  verbsLesson: 'Дієслова',
  adjectivesLesson: 'Прикметники',
  pronounsLesson: 'Займенники',
  directionsLesson: 'Напрямки',
  weekdaysLesson: 'Дні тижня',
  jobsLesson: 'Професії',
  shapesLesson: 'Форми',
  survivalPhrasesLesson: 'Фрази для виживання',
  
  // Lesson hints
  hintRed: 'Червоний',
  hintBlue: 'Синій',
  hintGreen: 'Зелений',
  hintYellow: 'Жовтий',
  hintOrange: 'Помаранчевий',
  hintDog: 'Собака',
  hintCat: 'Кіт',
  hintBird: 'Птах',
  hintFish: 'Риба',
  hintHorse: 'Кінь',
  hintMother: 'Мати',
  hintFather: 'Батько',
  hintSister: 'Сестра',
  hintBrother: 'Брат',
  hintGrandmother: 'Бабуся',
  hintSun: 'Сонце',
  hintRain: 'Дощ',
  hintSnow: 'Сніг',
  hintWind: 'Вітер',
  hintCold: 'Холодно',
  hintBread: 'Хліб',
  hintWater: 'Вода',
  hintCoffee: 'Кава',
  hintTea: 'Чай',
  hintMilk: 'Молоко',
  hintMeat: "М'ясо",
  hintEgg: 'Яйце',
  hintCheese: 'Сир',
  hintFruit: 'Фрукт',
  hintVegetable: 'Овоч',
  hintBeer: 'Пиво',
  hintWine: 'Вино',
  hintJuice: 'Сік',
  hintSoup: 'Суп',
  
  // Fill blank translations
  theSkyIsBlue: 'Небо блакитне',
  theGrassIsGreen: 'Трава зелена',
  theSunIsYellow: 'Сонце жовте',
  theCowGivesMilk: 'Корова дає молоко',
  thePigLivesOnFarm: 'Свиня живе на фермі',
  theRabbitEatsCarrots: 'Кролик їсть моркву',
  myMotherIsKind: 'Моя мама дуже добра',
  myGrandfatherIs70: 'Моєму дідусю 70 років',
  iHaveOneSister: 'У мене є одна сестра',
  todayIsVeryHot: 'Сьогодні дуже спекотно',
  itIsRaining: 'Надворі дощ',
  winterIsCold: 'Зима холодна',
};

// Italian translations - Complete
const italianTranslations: Translations = {
  // Header
  quizzes: 'Quiz',
  leaderboard: 'Classifica',
  premium: 'Premium',
  
  // Hero Section
  heroTitle: 'Impara il bulgaro con',
  heroTitleHighlight: 'Shpoko',
  heroDescription: 'Padroneggia il bulgaro attraverso lezioni divertenti e brevi con il tuo compagno amichevole. Dal cirillico alla conversazione in soli 15 minuti al giorno!',
  startLearning: 'Inizia a imparare',
  lessons: 'Lezioni',
  minPerDay: '15 min/giorno',
  meetShpoko: 'Conosci Shpoko!',
  shpokoDescription: 'Il tuo compagno per imparare il bulgaro. Ti guiderò attraverso ogni lezione!',
  shpokoGreeting: '💬 "Здравей! Pronto a iniziare?"',
  shpokoGreetingTranslation: '(Ciao! Pronto a iniziare?)',
  
  // Lesson Selector
  chooseYourLevel: 'Scegli il tuo livello',
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzato',
  lessonsCount: 'lezioni',
  completed: 'completate',
  unlocked: 'sbloccate',
  back: '← Indietro',
  lessonsLabel: 'Lezioni',
  assessment: 'Valutazione',
  testYourKnowledge: 'Metti alla prova le tue conoscenze di tutte le lezioni!',
  completeMoreLessons: 'altre lezioni per sbloccare',
  takeTest: 'Fai il test',
  streak: 'Serie',
  revise: 'Ripassa',
  everyStreakUnlocks: 'Ogni 5 giorni di serie sblocca 1 lezione premium!',
  daysToNext: 'giorni al prossimo',
  noLessonsAvailable: 'Non ci sono ancora lezioni in questa categoria.',
  
  // Daily Games
  dailyGames: 'Giochi quotidiani',
  dailyChallenge: 'Sfida quotidiana',
  animals: 'Animali',
  colors: 'Colori',
  numbers: 'Numeri',
  playNow: 'Gioca ora!',
  accuracy: 'Precisione',
  speed: 'Velocità',
  upToPoints: 'Fino a 100 punti',
  yourHighScore: 'Il tuo record:',
  startGame: 'Inizia gioco (60s)',
  gameLocked: 'Gioco bloccato',
  comeBackIn: 'Torna tra',
  gameOver: 'Fine partita!',
  finalScore: 'Punteggio finale:',
  answered: 'Risposte',
  newHighScore: 'Nuovo record!',
  xpEarned: 'XP guadagnati:',
  close: 'Chiudi',
  skip: 'Salta',
  submit: 'Invia',
  points: 'punti',
  skipped: 'Saltato',
  correctAnswer: 'Corretto:',
  typeBulgarianName: 'Scrivi il nome bulgaro...',
  
  // General
  xp: 'XP',
  level: 'Liv.',
  signIn: 'Accedi',
  dayStreak: 'giorni di serie',
  
  // Lessons categories
  basics: 'Base',
  vocabulary: 'Vocabolario',
  grammar: 'Grammatica',
  phrases: 'Frasi',
  culture: 'Cultura',
  
  // Category navigation
  daily: 'Quotidiano',
  games: 'Giochi',
  stories: 'Storie',
  dailyActivities: 'Attività quotidiane',
  learnBulgarian: 'Impara il bulgaro',
  funChallenges: 'Sfide divertenti',
  readAndLearn: 'Leggi e impara',
  
  // Common lesson UI
  correct: 'Corretto!',
  incorrect: 'Sbagliato',
  continue: 'Continua',
  tryAgain: 'Riprova',
  finish: 'Termina',
  progress: 'Progresso',
  
  // Word of the Day
  wordOfTheDay: 'Parola del giorno',
  pronunciation: 'Pronuncia',
  meaning: 'Significato',
  examples: 'Esempi',
  
  // Short Stories
  shortStories: 'Racconti brevi',
  readStoriesDescription: 'Leggi storie e rispondi alle domande per guadagnare XP!',
  viewAllStories: 'Vedi tutte le storie',
  
  // Hall of Fame
  hallOfFame: 'Hall of Fame',
  noChampionsYet: 'Nessun campione ancora! Sii il primo a conquistare la vetta alla fine del mese.',
  
  // Leaderboard
  leaderboardRank: 'Posizione in classifica',
  outOfLearners: 'su {count} studenti',
  topLearners: 'Migliori studenti',
  noLearnersYet: 'Nessuno studente ancora. Sii il primo!',
  you: 'Tu',
  notRanked: 'Non classificato',
  loading: 'Caricamento...',
  
  // Auth
  welcomeBack: 'Bentornato!',
  joinShpoko: 'Unisciti a Shpoko',
  enterCredentials: 'Inserisci le tue credenziali per continuare a imparare',
  createAccountDescription: 'Crea un account per iniziare il tuo viaggio nel bulgaro',
  username: 'Nome utente',
  chooseUsername: 'Scegli un nome utente',
  email: 'Email',
  enterEmail: 'Inserisci la tua email',
  password: 'Password',
  enterPassword: 'Inserisci la tua password',
  confirmPassword: 'Conferma password',
  confirmYourPassword: 'Conferma la tua password',
  logIn: 'Accedi',
  createAccount: 'Crea account',
  newToShpoko: 'Nuovo su Shpoko?',
  alreadyHaveAccount: 'Hai già un account?',
  loginFailed: 'Accesso fallito',
  invalidCredentials: 'Email o password non validi. Riprova.',
  signUpFailed: 'Registrazione fallita',
  welcomeToShpoko: 'Benvenuto su Shpoko!',
  accountCreated: 'Il tuo account è stato creato. Inizia a imparare!',
  emailAlreadyRegistered: 'Email già registrata',
  emailInUse: 'Questa email è già in uso. Accedi o usa un altro indirizzo email.',
  
  // Games
  contexto: 'Contexto',
  guessTheWord: 'Indovina la parola',
  rapidFire: 'Fuoco rapido',
  sevenSecRounds: 'round 7s',
  conjugation: 'Coniugazione',
  verbForms: 'Forme verbali',
  clozeCombat: 'Cloze Combat',
  findWrongWord: 'Trova la parola sbagliata',
  fixMyBulgarian: 'Correggi il mio bulgaro',
  proofread: 'Correzione',
  listeningFill: 'Ascolta e completa',
  audioBlanks: 'Spazi audio',
  dialogueBattle: 'Battaglia di dialogo',
  realConversations: 'Conversazioni reali',
  
  // Lesson UI
  lessonComplete: 'Lezione completata!',
  revisionComplete: 'Ripasso completato!',
  greatPractice: 'Ottima pratica!',
  correctAnswers: 'risposte corrette',
  reviseAgain: 'Ripassa ancora',
  nextLesson: 'Prossima:',
  previousLesson: 'Precedente:',
  backToLessons: 'Torna alle lezioni',
  typeTransliteration: 'Scrivi la traslitterazione',
  fillInBlank: 'Riempi lo spazio',
  chooseCorrect: 'Scegli la risposta corretta',
  showHint: 'Mostra suggerimento',
  check: 'Verifica',
  next: 'Avanti',
  complete: 'Completa',
  completeLesson: 'Completa la lezione',
  theAnswerIs: 'La risposta è:',
  revision: 'Ripasso',
  revisionMode: 'Modalità ripasso',
  
  // Lesson titles
  colorsLesson: 'Colori',
  animalsLesson: 'Animali',
  numbersLesson: 'Numeri',
  familyLesson: 'Famiglia',
  weatherLesson: 'Meteo',
  foodDrinksLesson: 'Cibo e bevande',
  verbsLesson: 'Verbi',
  adjectivesLesson: 'Aggettivi',
  pronounsLesson: 'Pronomi',
  directionsLesson: 'Direzioni',
  weekdaysLesson: 'Giorni della settimana',
  jobsLesson: 'Lavori',
  shapesLesson: 'Forme',
  survivalPhrasesLesson: 'Frasi di sopravvivenza',
  
  // Lesson hints
  hintRed: 'Rosso',
  hintBlue: 'Blu',
  hintGreen: 'Verde',
  hintYellow: 'Giallo',
  hintOrange: 'Arancione',
  hintDog: 'Cane',
  hintCat: 'Gatto',
  hintBird: 'Uccello',
  hintFish: 'Pesce',
  hintHorse: 'Cavallo',
  hintMother: 'Madre',
  hintFather: 'Padre',
  hintSister: 'Sorella',
  hintBrother: 'Fratello',
  hintGrandmother: 'Nonna',
  hintSun: 'Sole',
  hintRain: 'Pioggia',
  hintSnow: 'Neve',
  hintWind: 'Vento',
  hintCold: 'Freddo',
  hintBread: 'Pane',
  hintWater: 'Acqua',
  hintCoffee: 'Caffè',
  hintTea: 'Tè',
  hintMilk: 'Latte',
  hintMeat: 'Carne',
  hintEgg: 'Uovo',
  hintCheese: 'Formaggio',
  hintFruit: 'Frutta',
  hintVegetable: 'Verdura',
  hintBeer: 'Birra',
  hintWine: 'Vino',
  hintJuice: 'Succo',
  hintSoup: 'Zuppa',
  
  // Fill blank translations
  theSkyIsBlue: 'Il cielo è blu',
  theGrassIsGreen: "L'erba è verde",
  theSunIsYellow: 'Il sole è giallo',
  theCowGivesMilk: 'La mucca dà latte',
  thePigLivesOnFarm: 'Il maiale vive in una fattoria',
  theRabbitEatsCarrots: 'Il coniglio mangia carote',
  myMotherIsKind: 'Mia madre è molto gentile',
  myGrandfatherIs70: 'Mio nonno ha 70 anni',
  iHaveOneSister: 'Ho una sorella',
  todayIsVeryHot: 'Oggi fa molto caldo',
  itIsRaining: 'Sta piovendo fuori',
  winterIsCold: "L'inverno è freddo",
};

// Polish translations - Complete
const polishTranslations: Translations = {
  // Header
  quizzes: 'Quizy',
  leaderboard: 'Ranking',
  premium: 'Premium',
  
  // Hero Section
  heroTitle: 'Ucz się bułgarskiego z',
  heroTitleHighlight: 'Shpoko',
  heroDescription: 'Opanuj bułgarski poprzez zabawne, krótkie lekcje z przyjaznym towarzyszem. Od cyrylicy do rozmowy w zaledwie 15 minut dziennie!',
  startLearning: 'Zacznij się uczyć',
  lessons: 'Lekcje',
  minPerDay: '15 min/dzień',
  meetShpoko: 'Poznaj Shpoko!',
  shpokoDescription: 'Twój towarzysz do nauki bułgarskiego. Poprowadzę cię przez każdą lekcję!',
  shpokoGreeting: '💬 "Здравей! Gotowy zacząć?"',
  shpokoGreetingTranslation: '(Cześć! Gotowy zacząć?)',
  
  // Lesson Selector
  chooseYourLevel: 'Wybierz swój poziom',
  beginner: 'Początkujący',
  intermediate: 'Średniozaawansowany',
  advanced: 'Zaawansowany',
  lessonsCount: 'lekcji',
  completed: 'ukończono',
  unlocked: 'odblokowano',
  back: '← Wstecz',
  lessonsLabel: 'Lekcje',
  assessment: 'Ocena',
  testYourKnowledge: 'Sprawdź swoją wiedzę ze wszystkich lekcji!',
  completeMoreLessons: 'więcej lekcji do odblokowania',
  takeTest: 'Zrób test',
  streak: 'Seria',
  revise: 'Powtórz',
  everyStreakUnlocks: 'Każde 5 dni serii odblokowuje 1 lekcję premium!',
  daysToNext: 'dni do następnej',
  noLessonsAvailable: 'Brak lekcji w tej kategorii.',
  
  // Daily Games
  dailyGames: 'Codzienne gry',
  dailyChallenge: 'Codzienne wyzwanie',
  animals: 'Zwierzęta',
  colors: 'Kolory',
  numbers: 'Liczby',
  playNow: 'Graj teraz!',
  accuracy: 'Dokładność',
  speed: 'Szybkość',
  upToPoints: 'Do 100 punktów',
  yourHighScore: 'Twój rekord:',
  startGame: 'Rozpocznij grę (60s)',
  gameLocked: 'Gra zablokowana',
  comeBackIn: 'Wróć za',
  gameOver: 'Koniec gry!',
  finalScore: 'Wynik końcowy:',
  answered: 'Odpowiedzi',
  newHighScore: 'Nowy rekord!',
  xpEarned: 'Zdobyte XP:',
  close: 'Zamknij',
  skip: 'Pomiń',
  submit: 'Wyślij',
  points: 'punktów',
  skipped: 'Pominięto',
  correctAnswer: 'Poprawnie:',
  typeBulgarianName: 'Wpisz bułgarską nazwę...',
  
  // General
  xp: 'XP',
  level: 'Poz.',
  signIn: 'Zaloguj się',
  dayStreak: 'dni serii',
  
  // Lessons categories
  basics: 'Podstawy',
  vocabulary: 'Słownictwo',
  grammar: 'Gramatyka',
  phrases: 'Zwroty',
  culture: 'Kultura',
  
  // Category navigation
  daily: 'Codziennie',
  games: 'Gry',
  stories: 'Historie',
  dailyActivities: 'Codzienne zadania',
  learnBulgarian: 'Ucz się bułgarskiego',
  funChallenges: 'Zabawne wyzwania',
  readAndLearn: 'Czytaj i ucz się',
  
  // Common lesson UI
  correct: 'Poprawnie!',
  incorrect: 'Niepoprawnie',
  continue: 'Kontynuuj',
  tryAgain: 'Spróbuj ponownie',
  finish: 'Zakończ',
  progress: 'Postęp',
  
  // Word of the Day
  wordOfTheDay: 'Słowo dnia',
  pronunciation: 'Wymowa',
  meaning: 'Znaczenie',
  examples: 'Przykłady',
  
  // Short Stories
  shortStories: 'Krótkie historie',
  readStoriesDescription: 'Czytaj historie i odpowiadaj na pytania, aby zdobyć XP!',
  viewAllStories: 'Zobacz wszystkie historie',
  
  // Hall of Fame
  hallOfFame: 'Galeria sławy',
  noChampionsYet: 'Brak mistrzów! Bądź pierwszym, który zdobędzie szczyt na koniec miesiąca.',
  
  // Leaderboard
  leaderboardRank: 'Pozycja w rankingu',
  outOfLearners: 'z {count} uczniów',
  topLearners: 'Najlepsi uczniowie',
  noLearnersYet: 'Brak uczniów. Bądź pierwszy!',
  you: 'Ty',
  notRanked: 'Bez rankingu',
  loading: 'Ładowanie...',
  
  // Auth
  welcomeBack: 'Witaj ponownie!',
  joinShpoko: 'Dołącz do Shpoko',
  enterCredentials: 'Wprowadź dane, aby kontynuować naukę',
  createAccountDescription: 'Utwórz konto, aby rozpocząć naukę bułgarskiego',
  username: 'Nazwa użytkownika',
  chooseUsername: 'Wybierz nazwę użytkownika',
  email: 'Email',
  enterEmail: 'Wprowadź email',
  password: 'Hasło',
  enterPassword: 'Wprowadź hasło',
  confirmPassword: 'Potwierdź hasło',
  confirmYourPassword: 'Potwierdź swoje hasło',
  logIn: 'Zaloguj się',
  createAccount: 'Utwórz konto',
  newToShpoko: 'Nowy w Shpoko?',
  alreadyHaveAccount: 'Masz już konto?',
  loginFailed: 'Logowanie nie powiodło się',
  invalidCredentials: 'Nieprawidłowy email lub hasło. Spróbuj ponownie.',
  signUpFailed: 'Rejestracja nie powiodła się',
  welcomeToShpoko: 'Witaj w Shpoko!',
  accountCreated: 'Twoje konto zostało utworzone. Zacznij się uczyć!',
  emailAlreadyRegistered: 'Email już zarejestrowany',
  emailInUse: 'Ten email jest już używany. Zaloguj się lub użyj innego emaila.',
  
  // Games
  contexto: 'Contexto',
  guessTheWord: 'Zgadnij słowo',
  rapidFire: 'Szybki ogień',
  sevenSecRounds: 'rundy 7s',
  conjugation: 'Koniugacja',
  verbForms: 'Formy czasowników',
  clozeCombat: 'Cloze Combat',
  findWrongWord: 'Znajdź błędne słowo',
  fixMyBulgarian: 'Popraw mój bułgarski',
  proofread: 'Korekta',
  listeningFill: 'Słuchaj i uzupełnij',
  audioBlanks: 'Luki audio',
  dialogueBattle: 'Bitwa dialogowa',
  realConversations: 'Prawdziwe rozmowy',
  
  // Lesson UI
  lessonComplete: 'Lekcja ukończona!',
  revisionComplete: 'Powtórka ukończona!',
  greatPractice: 'Świetna praktyka!',
  correctAnswers: 'poprawnych odpowiedzi',
  reviseAgain: 'Powtórz ponownie',
  nextLesson: 'Następna:',
  previousLesson: 'Poprzednia:',
  backToLessons: 'Powrót do lekcji',
  typeTransliteration: 'Wpisz transliterację',
  fillInBlank: 'Uzupełnij lukę',
  chooseCorrect: 'Wybierz poprawną odpowiedź',
  showHint: 'Pokaż podpowiedź',
  check: 'Sprawdź',
  next: 'Dalej',
  complete: 'Ukończ',
  completeLesson: 'Ukończ lekcję',
  theAnswerIs: 'Odpowiedź to:',
  revision: 'Powtórka',
  revisionMode: 'Tryb powtórki',
  
  // Lesson titles
  colorsLesson: 'Kolory',
  animalsLesson: 'Zwierzęta',
  numbersLesson: 'Liczby',
  familyLesson: 'Rodzina',
  weatherLesson: 'Pogoda',
  foodDrinksLesson: 'Jedzenie i napoje',
  verbsLesson: 'Czasowniki',
  adjectivesLesson: 'Przymiotniki',
  pronounsLesson: 'Zaimki',
  directionsLesson: 'Kierunki',
  weekdaysLesson: 'Dni tygodnia',
  jobsLesson: 'Zawody',
  shapesLesson: 'Kształty',
  survivalPhrasesLesson: 'Zwroty przetrwania',
  
  // Lesson hints
  hintRed: 'Czerwony',
  hintBlue: 'Niebieski',
  hintGreen: 'Zielony',
  hintYellow: 'Żółty',
  hintOrange: 'Pomarańczowy',
  hintDog: 'Pies',
  hintCat: 'Kot',
  hintBird: 'Ptak',
  hintFish: 'Ryba',
  hintHorse: 'Koń',
  hintMother: 'Matka',
  hintFather: 'Ojciec',
  hintSister: 'Siostra',
  hintBrother: 'Brat',
  hintGrandmother: 'Babcia',
  hintSun: 'Słońce',
  hintRain: 'Deszcz',
  hintSnow: 'Śnieg',
  hintWind: 'Wiatr',
  hintCold: 'Zimno',
  hintBread: 'Chleb',
  hintWater: 'Woda',
  hintCoffee: 'Kawa',
  hintTea: 'Herbata',
  hintMilk: 'Mleko',
  hintMeat: 'Mięso',
  hintEgg: 'Jajko',
  hintCheese: 'Ser',
  hintFruit: 'Owoc',
  hintVegetable: 'Warzywo',
  hintBeer: 'Piwo',
  hintWine: 'Wino',
  hintJuice: 'Sok',
  hintSoup: 'Zupa',
  
  // Fill blank translations
  theSkyIsBlue: 'Niebo jest niebieskie',
  theGrassIsGreen: 'Trawa jest zielona',
  theSunIsYellow: 'Słońce jest żółte',
  theCowGivesMilk: 'Krowa daje mleko',
  thePigLivesOnFarm: 'Świnia mieszka na farmie',
  theRabbitEatsCarrots: 'Królik je marchewki',
  myMotherIsKind: 'Moja mama jest bardzo miła',
  myGrandfatherIs70: 'Mój dziadek ma 70 lat',
  iHaveOneSister: 'Mam jedną siostrę',
  todayIsVeryHot: 'Dzisiaj jest bardzo gorąco',
  itIsRaining: 'Na zewnątrz pada deszcz',
  winterIsCold: 'Zima jest zimna',
};

export const useTranslations = () => {
  // This hook should be used with useLanguageMode
  return { getTranslations };
};
