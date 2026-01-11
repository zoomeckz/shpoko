// Comprehensive vocabulary list organized by difficulty level
// Users can pick from this list to add words to their quiz/vocabulary

export interface VocabWord {
  id: string;
  word: string;
  romanization: string;
  translation: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  emoji?: string;
}

export const VOCABULARY_LIST: VocabWord[] = [
  // === BEGINNER ===
  // Cyrillic Basics
  { id: "v001", word: "ябълка", romanization: "yabalka", translation: "apple", category: "Food", difficulty: "beginner", emoji: "🍎" },
  { id: "v002", word: "банан", romanization: "banan", translation: "banana", category: "Food", difficulty: "beginner", emoji: "🍌" },
  { id: "v003", word: "вода", romanization: "voda", translation: "water", category: "Food", difficulty: "beginner", emoji: "💧" },
  { id: "v004", word: "хляб", romanization: "hlyab", translation: "bread", category: "Food", difficulty: "beginner", emoji: "🍞" },
  { id: "v005", word: "мляко", romanization: "mlyako", translation: "milk", category: "Food", difficulty: "beginner", emoji: "🥛" },
  { id: "v006", word: "котка", romanization: "kotka", translation: "cat", category: "Animals", difficulty: "beginner", emoji: "🐱" },
  { id: "v007", word: "куче", romanization: "kuche", translation: "dog", category: "Animals", difficulty: "beginner", emoji: "🐕" },
  { id: "v008", word: "птица", romanization: "ptitsa", translation: "bird", category: "Animals", difficulty: "beginner", emoji: "🐦" },
  { id: "v009", word: "риба", romanization: "riba", translation: "fish", category: "Animals", difficulty: "beginner", emoji: "🐟" },
  { id: "v010", word: "заек", romanization: "zaek", translation: "rabbit", category: "Animals", difficulty: "beginner", emoji: "🐰" },
  
  // Numbers
  { id: "v011", word: "едно", romanization: "edno", translation: "one", category: "Numbers", difficulty: "beginner", emoji: "1️⃣" },
  { id: "v012", word: "две", romanization: "dve", translation: "two", category: "Numbers", difficulty: "beginner", emoji: "2️⃣" },
  { id: "v013", word: "три", romanization: "tri", translation: "three", category: "Numbers", difficulty: "beginner", emoji: "3️⃣" },
  { id: "v014", word: "четири", romanization: "chetiri", translation: "four", category: "Numbers", difficulty: "beginner", emoji: "4️⃣" },
  { id: "v015", word: "пет", romanization: "pet", translation: "five", category: "Numbers", difficulty: "beginner", emoji: "5️⃣" },
  { id: "v016", word: "шест", romanization: "shest", translation: "six", category: "Numbers", difficulty: "beginner", emoji: "6️⃣" },
  { id: "v017", word: "седем", romanization: "sedem", translation: "seven", category: "Numbers", difficulty: "beginner", emoji: "7️⃣" },
  { id: "v018", word: "осем", romanization: "osem", translation: "eight", category: "Numbers", difficulty: "beginner", emoji: "8️⃣" },
  { id: "v019", word: "девет", romanization: "devet", translation: "nine", category: "Numbers", difficulty: "beginner", emoji: "9️⃣" },
  { id: "v020", word: "десет", romanization: "deset", translation: "ten", category: "Numbers", difficulty: "beginner", emoji: "🔟" },
  
  // Colors
  { id: "v021", word: "червено", romanization: "cherveno", translation: "red", category: "Colors", difficulty: "beginner", emoji: "🔴" },
  { id: "v022", word: "синьо", romanization: "sinyo", translation: "blue", category: "Colors", difficulty: "beginner", emoji: "🔵" },
  { id: "v023", word: "зелено", romanization: "zeleno", translation: "green", category: "Colors", difficulty: "beginner", emoji: "🟢" },
  { id: "v024", word: "жълто", romanization: "zhalto", translation: "yellow", category: "Colors", difficulty: "beginner", emoji: "🟡" },
  { id: "v025", word: "черно", romanization: "cherno", translation: "black", category: "Colors", difficulty: "beginner", emoji: "⚫" },
  { id: "v026", word: "бяло", romanization: "byalo", translation: "white", category: "Colors", difficulty: "beginner", emoji: "⚪" },
  
  // Greetings
  { id: "v027", word: "здравей", romanization: "zdravey", translation: "hello", category: "Greetings", difficulty: "beginner", emoji: "👋" },
  { id: "v028", word: "довиждане", romanization: "dovizhdane", translation: "goodbye", category: "Greetings", difficulty: "beginner", emoji: "👋" },
  { id: "v029", word: "благодаря", romanization: "blagodarya", translation: "thank you", category: "Greetings", difficulty: "beginner", emoji: "🙏" },
  { id: "v030", word: "моля", romanization: "molya", translation: "please/you're welcome", category: "Greetings", difficulty: "beginner", emoji: "🤝" },
  { id: "v031", word: "да", romanization: "da", translation: "yes", category: "Basics", difficulty: "beginner", emoji: "✅" },
  { id: "v032", word: "не", romanization: "ne", translation: "no", category: "Basics", difficulty: "beginner", emoji: "❌" },
  
  // Family
  { id: "v033", word: "мама", romanization: "mama", translation: "mom", category: "Family", difficulty: "beginner", emoji: "👩" },
  { id: "v034", word: "татко", romanization: "tatko", translation: "dad", category: "Family", difficulty: "beginner", emoji: "👨" },
  { id: "v035", word: "баба", romanization: "baba", translation: "grandmother", category: "Family", difficulty: "beginner", emoji: "👵" },
  { id: "v036", word: "дядо", romanization: "dyado", translation: "grandfather", category: "Family", difficulty: "beginner", emoji: "👴" },
  { id: "v037", word: "брат", romanization: "brat", translation: "brother", category: "Family", difficulty: "beginner", emoji: "👦" },
  { id: "v038", word: "сестра", romanization: "sestra", translation: "sister", category: "Family", difficulty: "beginner", emoji: "👧" },
  
  // House
  { id: "v039", word: "дом", romanization: "dom", translation: "home", category: "House", difficulty: "beginner", emoji: "🏠" },
  { id: "v040", word: "врата", romanization: "vrata", translation: "door", category: "House", difficulty: "beginner", emoji: "🚪" },
  { id: "v041", word: "прозорец", romanization: "prozorets", translation: "window", category: "House", difficulty: "beginner", emoji: "🪟" },
  { id: "v042", word: "маса", romanization: "masa", translation: "table", category: "House", difficulty: "beginner", emoji: "🪑" },
  { id: "v043", word: "стол", romanization: "stol", translation: "chair", category: "House", difficulty: "beginner", emoji: "🪑" },
  
  // === INTERMEDIATE ===
  // Food & Drinks Extended
  { id: "v101", word: "месо", romanization: "meso", translation: "meat", category: "Food", difficulty: "intermediate", emoji: "🥩" },
  { id: "v102", word: "пиле", romanization: "pile", translation: "chicken", category: "Food", difficulty: "intermediate", emoji: "🍗" },
  { id: "v103", word: "салата", romanization: "salata", translation: "salad", category: "Food", difficulty: "intermediate", emoji: "🥗" },
  { id: "v104", word: "супа", romanization: "supa", translation: "soup", category: "Food", difficulty: "intermediate", emoji: "🍲" },
  { id: "v105", word: "кафе", romanization: "kafe", translation: "coffee", category: "Food", difficulty: "intermediate", emoji: "☕" },
  { id: "v106", word: "чай", romanization: "chay", translation: "tea", category: "Food", difficulty: "intermediate", emoji: "🍵" },
  { id: "v107", word: "бира", romanization: "bira", translation: "beer", category: "Food", difficulty: "intermediate", emoji: "🍺" },
  { id: "v108", word: "вино", romanization: "vino", translation: "wine", category: "Food", difficulty: "intermediate", emoji: "🍷" },
  
  // Verbs
  { id: "v109", word: "ходя", romanization: "hodya", translation: "to walk/go", category: "Verbs", difficulty: "intermediate", emoji: "🚶" },
  { id: "v110", word: "ям", romanization: "yam", translation: "to eat", category: "Verbs", difficulty: "intermediate", emoji: "🍽️" },
  { id: "v111", word: "пия", romanization: "piya", translation: "to drink", category: "Verbs", difficulty: "intermediate", emoji: "🥤" },
  { id: "v112", word: "искам", romanization: "iskam", translation: "to want", category: "Verbs", difficulty: "intermediate", emoji: "🙋" },
  { id: "v113", word: "давам", romanization: "davam", translation: "to give", category: "Verbs", difficulty: "intermediate", emoji: "🎁" },
  { id: "v114", word: "взимам", romanization: "vzimam", translation: "to take", category: "Verbs", difficulty: "intermediate", emoji: "✋" },
  { id: "v115", word: "работя", romanization: "rabotya", translation: "to work", category: "Verbs", difficulty: "intermediate", emoji: "💼" },
  { id: "v116", word: "уча", romanization: "ucha", translation: "to learn/study", category: "Verbs", difficulty: "intermediate", emoji: "📚" },
  { id: "v117", word: "говоря", romanization: "govorya", translation: "to speak", category: "Verbs", difficulty: "intermediate", emoji: "🗣️" },
  { id: "v118", word: "слушам", romanization: "slusham", translation: "to listen", category: "Verbs", difficulty: "intermediate", emoji: "👂" },
  { id: "v119", word: "чета", romanization: "cheta", translation: "to read", category: "Verbs", difficulty: "intermediate", emoji: "📖" },
  { id: "v120", word: "пиша", romanization: "pisha", translation: "to write", category: "Verbs", difficulty: "intermediate", emoji: "✍️" },
  
  // Time
  { id: "v121", word: "понеделник", romanization: "ponedelnik", translation: "Monday", category: "Time", difficulty: "intermediate", emoji: "📅" },
  { id: "v122", word: "вторник", romanization: "vtornik", translation: "Tuesday", category: "Time", difficulty: "intermediate", emoji: "📅" },
  { id: "v123", word: "сряда", romanization: "sryada", translation: "Wednesday", category: "Time", difficulty: "intermediate", emoji: "📅" },
  { id: "v124", word: "четвъртък", romanization: "chetvurtak", translation: "Thursday", category: "Time", difficulty: "intermediate", emoji: "📅" },
  { id: "v125", word: "петък", romanization: "petak", translation: "Friday", category: "Time", difficulty: "intermediate", emoji: "📅" },
  { id: "v126", word: "събота", romanization: "sabota", translation: "Saturday", category: "Time", difficulty: "intermediate", emoji: "📅" },
  { id: "v127", word: "неделя", romanization: "nedelya", translation: "Sunday", category: "Time", difficulty: "intermediate", emoji: "📅" },
  { id: "v128", word: "днес", romanization: "dnes", translation: "today", category: "Time", difficulty: "intermediate", emoji: "📆" },
  { id: "v129", word: "утре", romanization: "utre", translation: "tomorrow", category: "Time", difficulty: "intermediate", emoji: "➡️" },
  { id: "v130", word: "вчера", romanization: "vchera", translation: "yesterday", category: "Time", difficulty: "intermediate", emoji: "⬅️" },
  
  // Directions
  { id: "v131", word: "ляво", romanization: "lyavo", translation: "left", category: "Directions", difficulty: "intermediate", emoji: "⬅️" },
  { id: "v132", word: "дясно", romanization: "dyasno", translation: "right", category: "Directions", difficulty: "intermediate", emoji: "➡️" },
  { id: "v133", word: "напред", romanization: "napred", translation: "forward", category: "Directions", difficulty: "intermediate", emoji: "⬆️" },
  { id: "v134", word: "назад", romanization: "nazad", translation: "back", category: "Directions", difficulty: "intermediate", emoji: "⬇️" },
  { id: "v135", word: "тук", romanization: "tuk", translation: "here", category: "Directions", difficulty: "intermediate", emoji: "📍" },
  { id: "v136", word: "там", romanization: "tam", translation: "there", category: "Directions", difficulty: "intermediate", emoji: "👉" },
  
  // === ADVANCED ===
  // Abstract Concepts
  { id: "v201", word: "щастие", romanization: "shtastie", translation: "happiness", category: "Emotions", difficulty: "advanced", emoji: "😊" },
  { id: "v202", word: "любов", romanization: "lyubov", translation: "love", category: "Emotions", difficulty: "advanced", emoji: "❤️" },
  { id: "v203", word: "страх", romanization: "strah", translation: "fear", category: "Emotions", difficulty: "advanced", emoji: "😨" },
  { id: "v204", word: "гняв", romanization: "gnyav", translation: "anger", category: "Emotions", difficulty: "advanced", emoji: "😠" },
  { id: "v205", word: "тъга", romanization: "taga", translation: "sadness", category: "Emotions", difficulty: "advanced", emoji: "😢" },
  { id: "v206", word: "надежда", romanization: "nadezhda", translation: "hope", category: "Emotions", difficulty: "advanced", emoji: "🌈" },
  
  // Weather
  { id: "v207", word: "слънце", romanization: "slantse", translation: "sun", category: "Weather", difficulty: "advanced", emoji: "☀️" },
  { id: "v208", word: "дъжд", romanization: "dazht", translation: "rain", category: "Weather", difficulty: "advanced", emoji: "🌧️" },
  { id: "v209", word: "сняг", romanization: "snyag", translation: "snow", category: "Weather", difficulty: "advanced", emoji: "❄️" },
  { id: "v210", word: "вятър", romanization: "vyatar", translation: "wind", category: "Weather", difficulty: "advanced", emoji: "💨" },
  { id: "v211", word: "облак", romanization: "oblak", translation: "cloud", category: "Weather", difficulty: "advanced", emoji: "☁️" },
  { id: "v212", word: "буря", romanization: "burya", translation: "storm", category: "Weather", difficulty: "advanced", emoji: "⛈️" },
  
  // Jobs
  { id: "v213", word: "учител", romanization: "uchitel", translation: "teacher", category: "Jobs", difficulty: "advanced", emoji: "👨‍🏫" },
  { id: "v214", word: "лекар", romanization: "lekar", translation: "doctor", category: "Jobs", difficulty: "advanced", emoji: "👨‍⚕️" },
  { id: "v215", word: "инженер", romanization: "inzhener", translation: "engineer", category: "Jobs", difficulty: "advanced", emoji: "👷" },
  { id: "v216", word: "готвач", romanization: "gotvach", translation: "chef/cook", category: "Jobs", difficulty: "advanced", emoji: "👨‍🍳" },
  { id: "v217", word: "полицай", romanization: "politsay", translation: "police officer", category: "Jobs", difficulty: "advanced", emoji: "👮" },
  { id: "v218", word: "адвокат", romanization: "advokat", translation: "lawyer", category: "Jobs", difficulty: "advanced", emoji: "⚖️" },
  
  // Complex Verbs
  { id: "v219", word: "разбирам", romanization: "razbiram", translation: "to understand", category: "Verbs", difficulty: "advanced", emoji: "💡" },
  { id: "v220", word: "забравям", romanization: "zabravyam", translation: "to forget", category: "Verbs", difficulty: "advanced", emoji: "🤔" },
  { id: "v221", word: "помня", romanization: "pomnya", translation: "to remember", category: "Verbs", difficulty: "advanced", emoji: "🧠" },
  { id: "v222", word: "обичам", romanization: "obicham", translation: "to love", category: "Verbs", difficulty: "advanced", emoji: "❤️" },
  { id: "v223", word: "мразя", romanization: "mrazya", translation: "to hate", category: "Verbs", difficulty: "advanced", emoji: "😤" },
  { id: "v224", word: "мисля", romanization: "mislya", translation: "to think", category: "Verbs", difficulty: "advanced", emoji: "🤔" },
  { id: "v225", word: "знам", romanization: "znam", translation: "to know", category: "Verbs", difficulty: "advanced", emoji: "📚" },
];

// Get unique categories
export const VOCAB_CATEGORIES = [...new Set(VOCABULARY_LIST.map(v => v.category))].sort();

// Get words by difficulty
export const getWordsByDifficulty = (difficulty: VocabWord["difficulty"]) => 
  VOCABULARY_LIST.filter(v => v.difficulty === difficulty);

// Get words by category
export const getWordsByCategory = (category: string) => 
  VOCABULARY_LIST.filter(v => v.category === category);

// Search words
export const searchWords = (query: string) => {
  const lower = query.toLowerCase();
  return VOCABULARY_LIST.filter(v => 
    v.word.toLowerCase().includes(lower) ||
    v.romanization.toLowerCase().includes(lower) ||
    v.translation.toLowerCase().includes(lower)
  );
};
