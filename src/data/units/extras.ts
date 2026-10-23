import type { CourseLesson, Exercise } from "../course";

// Extras: short bonus lessons beside each unit's path, one per lesson. They
// open with XP (see course.ts) and give a little XP back. Each one goes off on
// a fun, useful tangent of what the unit teaches: brands, menus, small talk,
// tongue twisters…

const read = (display: string, options: string[], answer: string, explain?: string): Exercise => ({
  type: "choice",
  prompt: "How do you read this?",
  display,
  options: options.map((label) => ({ label })),
  answer,
  explain,
});

const means = (display: string, options: string[], answer: string, explain?: string): Exercise => ({
  type: "choice",
  prompt: "What does this mean?",
  display,
  options: options.map((label) => ({ label })),
  answer,
  explain,
});

const pick = (prompt: string, options: string[], answer: string, display?: string, explain?: string): Exercise => ({
  type: "choice",
  prompt,
  display,
  options: options.map((label) => ({ label })),
  answer,
  explain,
});

const number = (display: string, options: string[], answer: string, prompt = "Which number is this?"): Exercise => ({
  type: "choice",
  prompt,
  display,
  optionStyle: "letters",
  options: options.map((label) => ({ label })),
  answer,
});

const sound = (letter: string, options: string[], answer: string): Exercise => ({
  type: "choice",
  prompt: "What sound does this letter make?",
  display: letter,
  options: options.map((label) => ({ label })),
  answer,
});

const extra = (id: string, title: string, description: string, exercises: Exercise[]): CourseLesson => ({
  id,
  title,
  description,
  kind: "extra",
  xp: 5,
  exercises,
});

/* ---------- Unit 1: the alphabet ---------- */

const unit1: CourseLesson[] = [
  extra("x1-1", "Lookalike sprint", "Р В Н С Х У", [
    {
      type: "tip",
      title: "Six sneaky letters",
      text: "These look like English letters but make other sounds. Let's make sure they never trick you again!",
      items: [
        { big: "Р", small: "r, not p" },
        { big: "В", small: "v, not b" },
        { big: "Н", small: "n, not h" },
        { big: "С", small: "s, never k" },
        { big: "Х", small: "h, not x" },
        { big: "У", small: "u, not y" },
      ],
    },
    sound("Р", ["p", "r", "b"], "r"),
    sound("В", ["b", "f", "v"], "v"),
    sound("Н", ["n", "h", "m"], "n"),
    sound("Х", ["x", "k", "h"], "h"),
    sound("У", ["y", "u", "i"], "u"),
    {
      type: "match",
      prompt: "Match the sneaky letters",
      pairs: [
        { left: "Р", right: "r" },
        { left: "В", right: "v" },
        { left: "Н", right: "n" },
        { left: "С", right: "s" },
        { left: "Х", right: "h" },
      ],
    },
    read("ХОР", ["hop", "hor", "xop"], "hor", "ХОР means choir 🎶"),
    read("ВРАНА", ["bpaha", "brana", "vrana"], "vrana", "ВРАНА means crow 🐦"),
  ]),
  extra("x1-2", "Read the brands", "КОКА-КОЛА, ИКЕА, ЛИДЛ", [
    {
      type: "tip",
      title: "Brands in Cyrillic",
      text: "Shop signs and adverts in Bulgaria often write big brand names in Cyrillic. Sound them out and you'll recognise them!",
    },
    pick("Which brand is this?", ["Pepsi", "Coca-Cola", "Fanta"], "Coca-Cola", "КОКА-КОЛА"),
    pick("Which brand is this?", ["IKEA", "Nike", "Lego"], "IKEA", "ИКЕА"),
    pick("Which brand is this?", ["Aldi", "Lego", "Lidl"], "Lidl", "ЛИДЛ"),
    pick("Which brand is this?", ["McDonald's", "KFC", "Burger King"], "McDonald's", "МАКДОНАЛДС"),
    pick("Which brand is this?", ["YouTube", "Facebook", "Netflix"], "Facebook", "ФЕЙСБУК"),
    pick("Which brand is this?", ["Uber", "Tesla", "YouTube"], "YouTube", "ЮТЮБ"),
    {
      type: "build",
      prompt: "Write “Lego” in Cyrillic",
      target: "Lego",
      answer: ["Л", "Е", "Г", "О"],
      tiles: ["О", "П", "Л", "К", "Е", "Г"],
    },
  ]),
  extra("x1-3", "Your name in Cyrillic", "САМ, АННА, ДЖОН", [
    {
      type: "tip",
      title: "Names sound the same",
      text: "Names are written the way they sound, so you can write any name in Cyrillic.",
      items: [
        { big: "САМ", small: "Sam" },
        { big: "АННА", small: "Anna" },
        { big: "ТОМ", small: "Tom" },
        { big: "ЛИЗА", small: "Lisa" },
      ],
    },
    {
      type: "tip",
      title: "Two letters, one sound",
      text: "There's no single letter for the English j. Bulgarians write it with two: Д + Ж = ДЖ.",
      items: [
        { big: "ДЖОН", small: "John" },
        { big: "ДЖАК", small: "Jack" },
      ],
    },
    pick("Whose name is this?", ["Jim", "John", "Don"], "John", "ДЖОН"),
    pick("Whose name is this?", ["Mike", "Max", "Mark"], "Mike", "МАЙК"),
    pick("Whose name is this?", ["Anna", "Eva", "Emma"], "Emma", "ЕМА"),
    pick("Whose name is this?", ["Daniel", "David", "Edward"], "David", "ДЕЙВИД"),
    {
      type: "build",
      prompt: "Write “Sam” in Cyrillic",
      target: "Sam",
      answer: ["С", "А", "М"],
      tiles: ["Ш", "М", "С", "А", "Н"],
    },
    {
      type: "build",
      prompt: "Write “Tom” in Cyrillic",
      target: "Tom",
      answer: ["Т", "О", "М"],
      tiles: ["Д", "О", "Н", "Т", "М"],
    },
  ]),
  extra("x1-4", "Where Cyrillic was born", "АЗБУКА", [
    {
      type: "tip",
      title: "Made in Bulgaria",
      text: "Cyrillic was created in Bulgaria in the 9th century, by students of the brothers Cyril and Methodius, and it's named after Saint Cyril. Today about 250 million people use it!",
    },
    { type: "word", word: "АЗБУКА", reading: "azbuka", meaning: "alphabet", emoji: "🔤" },
    pick("Where was Cyrillic created?", ["Russia", "Bulgaria", "Greece"], "Bulgaria"),
    pick("Who is Cyrillic named after?", ["Saint Cyril", "Saint Peter", "King Simeon"], "Saint Cyril"),
    {
      type: "tip",
      title: "A day for letters",
      text: "Every 24 May, Bulgaria celebrates its alphabet with a national holiday, with parades, flowers and school concerts.",
    },
    pick("When does Bulgaria celebrate its alphabet?", ["1 January", "24 May", "3 March"], "24 May"),
    {
      type: "tip",
      title: "Look at a euro note",
      text: "Since Bulgaria joined the EU, euro banknotes say EURO in Latin letters, ΕΥΡΩ in Greek and ЕВРО in Cyrillic.",
    },
    read("ЕВРО", ["euro", "evro", "ebpo"], "evro"),
  ]),
  extra("x1-5", "Speed round", "Read fast!", [
    {
      type: "tip",
      title: "Speed round!",
      text: "Read each word as fast as you can. Don't overthink it, trust your eyes!",
    },
    read("ДОМ", ["bom", "dom", "gom"], "dom"),
    read("ЧАЙ", ["chay", "shay", "chau"], "chay"),
    read("СОК", ["cok", "zok", "sok"], "sok"),
    read("ПИЦА", ["pitsa", "nitsa", "pisa"], "pitsa"),
    read("ШАПКА", ["shanka", "shapka", "schapka"], "shapka"),
    read("ЖАБА", ["shaba", "zhava", "zhaba"], "zhaba"),
    read("КЪЩА", ["kăshta", "kashta", "kăsha"], "kăshta"),
    read("ЯБЪЛКА", ["rabălka", "yabălka", "yablka"], "yabălka"),
  ]),
];

/* ---------- Unit 2: reading the world ---------- */

const unit2: CourseLesson[] = [
  extra("x2-1", "On the menu", "БАНИЦА, ШОПСКА САЛАТА", [
    {
      type: "tip",
      title: "Bulgarian classics",
      text: "Time to read a real Bulgarian menu. These are the dishes everyone should try at least once!",
    },
    { type: "word", word: "БАНИЦА", reading: "banitsa", meaning: "flaky pastry with white cheese", emoji: "🥐" },
    { type: "word", word: "ШОПСКА САЛАТА", reading: "shopska salata", meaning: "tomato and cucumber salad with white cheese", emoji: "🥗" },
    { type: "word", word: "КЕБАПЧЕ", reading: "kebapche", meaning: "grilled minced-meat roll", emoji: "🍢" },
    { type: "word", word: "ТАРАТОР", reading: "tarator", meaning: "cold yogurt and cucumber soup", emoji: "🥒" },
    { type: "word", word: "АЙРЯН", reading: "ayryan", meaning: "salty yogurt drink", emoji: "🥛" },
    {
      type: "match",
      prompt: "Match the dishes",
      pairs: [
        { left: "БАНИЦА", right: "cheese pastry" },
        { left: "ТАРАТОР", right: "cold soup" },
        { left: "АЙРЯН", right: "yogurt drink" },
        { left: "КЕБАПЧЕ", right: "grilled meat" },
      ],
    },
    pick("It's 35 °C outside. Which cold soup do you order?", ["БАНИЦА", "ТАРАТОР", "КЕБАПЧЕ"], "ТАРАТОР"),
    read("ШОПСКА САЛАТА", ["chopska salata", "shonska salata", "shopska salata"], "shopska salata"),
  ]),
  extra("x2-2", "Around town", "БАНКА, ПОЩА, БОЛНИЦА", [
    { type: "word", word: "БАНКА", reading: "banka", meaning: "bank", emoji: "🏦", sign: "blue" },
    { type: "word", word: "ПОЩА", reading: "poshta", meaning: "post office", emoji: "✉️", sign: "yellow" },
    { type: "word", word: "БОЛНИЦА", reading: "bolnitsa", meaning: "hospital", emoji: "🏥", sign: "red" },
    { type: "word", word: "ПОЛИЦИЯ", reading: "politsiya", meaning: "police", emoji: "🚓", sign: "blue" },
    {
      type: "choice",
      prompt: "You need cash. Which sign do you look for?",
      optionStyle: "signs",
      options: [
        { label: "ПОЩА", sign: "yellow" },
        { label: "БАНКА", sign: "blue" },
        { label: "БОЛНИЦА", sign: "red" },
      ],
      answer: "БАНКА",
    },
    {
      type: "choice",
      prompt: "You want to send a postcard home.",
      optionStyle: "signs",
      options: [
        { label: "ПОЛИЦИЯ", sign: "blue" },
        { label: "БАНКА", sign: "blue" },
        { label: "ПОЩА", sign: "yellow" },
      ],
      answer: "ПОЩА",
    },
    {
      type: "match",
      prompt: "Match the places",
      pairs: [
        { left: "БАНКА", right: "bank" },
        { left: "ПОЩА", right: "post office" },
        { left: "БОЛНИЦА", right: "hospital" },
        { left: "ПОЛИЦИЯ", right: "police" },
      ],
    },
    read("ПАРКИНГ", ["narking", "parking", "parkink"], "parking", "ПАРКИНГ is where you park 🅿️"),
  ]),
  extra("x2-3", "At the airport", "ЗАМИНАВАНЕ, ПРИСТИГАНЕ", [
    { type: "word", word: "ЗАМИНАВАНЕ", reading: "zaminavane", meaning: "departures", emoji: "🛫", sign: "yellow" },
    { type: "word", word: "ПРИСТИГАНЕ", reading: "pristigane", meaning: "arrivals", emoji: "🛬", sign: "yellow" },
    { type: "word", word: "ПАСПОРТ", reading: "pasport", meaning: "passport", emoji: "🛂" },
    { type: "word", word: "БАГАЖ", reading: "bagazh", meaning: "baggage", emoji: "🧳" },
    { type: "word", word: "ПОЛЕТ", reading: "polet", meaning: "flight", emoji: "✈️" },
    {
      type: "choice",
      prompt: "You're flying home. Which sign do you follow?",
      optionStyle: "signs",
      options: [
        { label: "ПРИСТИГАНЕ", sign: "yellow" },
        { label: "ЗАМИНАВАНЕ", sign: "yellow" },
        { label: "ИЗХОД", sign: "green" },
      ],
      answer: "ЗАМИНАВАНЕ",
    },
    {
      type: "match",
      prompt: "Match the pairs",
      pairs: [
        { left: "ПАСПОРТ", right: "passport" },
        { left: "БАГАЖ", right: "baggage" },
        { left: "ПОЛЕТ", right: "flight" },
        { left: "ПРИСТИГАНЕ", right: "arrivals" },
      ],
    },
    read("БАГАЖ", ["vagazh", "bagash", "bagazh"], "bagazh"),
  ]),
  extra("x2-4", "Bulgaria on the map", "ДУНАВ, РИЛА, ЧЕРНО МОРЕ", [
    {
      type: "tip",
      title: "Big places",
      text: "Read these and you can find your way around a map of Bulgaria.",
      items: [
        { big: "ЧЕРНО МОРЕ", small: "the Black Sea, in the east" },
        { big: "ДУНАВ", small: "the Danube, in the north" },
        { big: "РИЛА", small: "the Rila mountains, in the south-west" },
      ],
    },
    pick("Which one is a river?", ["РИЛА", "ВАРНА", "ДУНАВ"], "ДУНАВ"),
    pick("Varna and Burgas are by the…", ["ЧЕРНО МОРЕ", "ДУНАВ", "РИЛА"], "ЧЕРНО МОРЕ", undefined, "ЧЕРНО МОРЕ means Black Sea 🌊"),
    {
      type: "tip",
      title: "Did you know?",
      text: "Plovdiv is one of the oldest cities in Europe, and Musala in the Rila mountains is the highest peak in the Balkans, at 2,925 metres.",
    },
    read("МУСАЛА", ["mucala", "musala", "musana"], "musala"),
    {
      type: "match",
      prompt: "Match the places",
      pairs: [
        { left: "ЧЕРНО МОРЕ", right: "Black Sea" },
        { left: "ДУНАВ", right: "Danube" },
        { left: "РИЛА", right: "Rila" },
        { left: "СОФИЯ", right: "Sofia" },
      ],
    },
    read("ЧЕРНО МОРЕ", ["sherno more", "cherno more", "cherno mope"], "cherno more"),
  ]),
  extra("x2-5", "Speed round", "Read fast!", [
    {
      type: "tip",
      title: "Speed round!",
      text: "Signs, menus, cities. Read each one as fast as you can!",
    },
    read("ВХОД", ["vhod", "bhod", "vxod"], "vhod"),
    read("ИЗХОД", ["izxod", "izhot", "izhod"], "izhod"),
    read("АПТЕКА", ["anteka", "apteka", "aptera"], "apteka"),
    read("ОТВОРЕНО", ["otvoreno", "otboreno", "otvopeno"], "otvoreno"),
    read("ХОТЕЛ", ["xotel", "kotel", "hotel"], "hotel"),
    read("МУЗИКА", ["musika", "muzika", "mizuka"], "muzika"),
    read("ТАКСИ", ["tacsi", "takzi", "taksi"], "taksi"),
    read("ПЛОВДИВ", ["plovdiv", "plobdib", "nlovdiv"], "plovdiv"),
  ]),
];

/* ---------- Unit 3: everyday questions ---------- */

const unit3: CourseLesson[] = [
  extra("x3-1", "Hello and goodbye", "Здравей, Довиждане", [
    {
      type: "phrase",
      text: "Здравей!",
      reading: "zdravey!",
      meaning: "Hi!",
      words: [{ bg: "Здравей!", en: "hi", isNew: true }],
      note: "Use здравей with one friend. With a stranger or a group, say здравейте.",
    },
    {
      type: "phrase",
      text: "Добро утро!",
      reading: "dobro utro!",
      meaning: "Good morning!",
      words: [
        { bg: "Добро", en: "good" },
        { bg: "утро!", en: "morning", isNew: true },
      ],
    },
    {
      type: "phrase",
      text: "Добър вечер!",
      reading: "dobăr vecher!",
      meaning: "Good evening!",
      words: [
        { bg: "Добър", en: "good" },
        { bg: "вечер!", en: "evening", isNew: true },
      ],
    },
    {
      type: "phrase",
      text: "Довиждане! Чао!",
      reading: "dovizhdane! chao!",
      meaning: "Goodbye! Bye!",
      words: [
        { bg: "Довиждане!", en: "goodbye", isNew: true },
        { bg: "Чао!", en: "bye", isNew: true },
      ],
      note: "чао is casual, just like “ciao” in Italian.",
    },
    pick("It's 8 in the morning. What do you say?", ["Добър вечер!", "Добро утро!", "Довиждане!"], "Добро утро!"),
    {
      type: "fill",
      sentence: "Добър ___!",
      meaning: "Good evening!",
      options: ["утро", "вечер", "ден"],
      answer: "вечер",
    },
    pick("You walk into a shop. The polite hello is…", ["Здравейте!", "Чао!", "Довиждане!"], "Здравейте!"),
    {
      type: "match",
      prompt: "Match the pairs",
      pairs: [
        { left: "здравей", right: "hi" },
        { left: "довиждане", right: "goodbye" },
        { left: "утро", right: "morning" },
        { left: "вечер", right: "evening" },
      ],
    },
  ]),
  extra("x3-2", "Excuse me!", "Извинете, Съжалявам", [
    {
      type: "phrase",
      text: "Извинете!",
      reading: "izvinete!",
      meaning: "Excuse me!",
      words: [{ bg: "Извинете!", en: "excuse me", isNew: true }],
      note: "Use it to get someone's attention, or to squeeze past on the bus.",
    },
    {
      type: "phrase",
      text: "Съжалявам.",
      reading: "săzhalyavam.",
      meaning: "I'm sorry.",
      words: [{ bg: "Съжалявам.", en: "I'm sorry", isNew: true }],
    },
    {
      type: "phrase",
      text: "Няма проблем!",
      reading: "nyama problem!",
      meaning: "No problem!",
      words: [
        { bg: "Няма", en: "there's no", isNew: true },
        { bg: "проблем!", en: "problem" },
      ],
    },
    {
      type: "phrase",
      text: "Моля!",
      reading: "molya!",
      meaning: "You're welcome!",
      words: [{ bg: "Моля!", en: "you're welcome" }],
      note: "моля means please, and it's also the answer to благодаря.",
    },
    pick("You bump into someone. What do you say?", ["Моля!", "Съжалявам!", "Чао!"], "Съжалявам!"),
    pick("Someone says “Благодаря!” to you. What do you answer?", ["Извинете!", "Довиждане!", "Моля!"], "Моля!"),
    {
      type: "fill",
      sentence: "Няма ___!",
      meaning: "No problem!",
      options: ["моля", "проблем", "утро"],
      answer: "проблем",
    },
    {
      type: "match",
      prompt: "Match the pairs",
      pairs: [
        { left: "извинете", right: "excuse me" },
        { left: "съжалявам", right: "I'm sorry" },
        { left: "моля", right: "please" },
        { left: "няма проблем", right: "no problem" },
      ],
    },
  ]),
  extra("x3-3", "When you're stuck", "Не разбирам", [
    {
      type: "phrase",
      text: "Не разбирам.",
      reading: "ne razbiram.",
      meaning: "I don't understand.",
      words: [
        { bg: "Не", en: "not", isNew: true },
        { bg: "разбирам.", en: "I understand", isNew: true },
      ],
    },
    {
      type: "phrase",
      text: "Говорите ли английски?",
      reading: "govorite li angliyski?",
      meaning: "Do you speak English?",
      words: [
        { bg: "Говорите", en: "you speak", isNew: true },
        { bg: "ли", en: "question word", isNew: true },
        { bg: "английски?", en: "English", isNew: true },
      ],
      note: "ли turns a sentence into a yes/no question.",
    },
    {
      type: "phrase",
      text: "По-бавно, моля.",
      reading: "po-bavno, molya.",
      meaning: "Slower, please.",
      words: [
        { bg: "По-бавно,", en: "slower", isNew: true },
        { bg: "моля.", en: "please" },
      ],
    },
    {
      type: "phrase",
      text: "Още веднъж, моля.",
      reading: "oshte vednăzh, molya.",
      meaning: "Once more, please.",
      words: [
        { bg: "Още", en: "more, again", isNew: true },
        { bg: "веднъж,", en: "once", isNew: true },
        { bg: "моля.", en: "please" },
      ],
    },
    pick("Someone speaks Bulgarian really fast. What do you say?", ["Добро утро!", "По-бавно, моля.", "Колко струва?"], "По-бавно, моля."),
    {
      type: "fill",
      sentence: "Не ___.",
      meaning: "I don't understand.",
      options: ["говорите", "разбирам", "моля"],
      answer: "разбирам",
    },
    {
      type: "build",
      prompt: "Write this in Bulgarian",
      target: "Do you speak English?",
      words: true,
      answer: ["Говорите", "ли", "английски"],
      tiles: ["моля", "английски", "Не", "ли", "Говорите"],
    },
    means("Още веднъж, моля.", ["Slower, please.", "Once more, please.", "No, thanks."], "Once more, please."),
  ]),
  extra("x3-4", "Yes is a shake", "Да, Не, Добре", [
    {
      type: "tip",
      title: "Careful with your head!",
      text: "In Bulgaria, a nod traditionally means no and a shake of the head means yes. Many Bulgarians switch when they talk to foreigners, so listen for the words!",
    },
    {
      type: "phrase",
      text: "Да или не?",
      reading: "da ili ne?",
      meaning: "Yes or no?",
      words: [
        { bg: "Да", en: "yes", isNew: true },
        { bg: "или", en: "or" },
        { bg: "не?", en: "no", isNew: true },
      ],
    },
    pick("A Bulgarian grandma smiles and shakes her head. What does she probably mean?", ["No!", "Yes!", "Maybe"], "Yes!"),
    {
      type: "phrase",
      text: "Разбира се!",
      reading: "razbira se!",
      meaning: "Of course!",
      words: [
        { bg: "Разбира", en: "it's understood", isNew: true },
        { bg: "се!", en: "itself" },
      ],
      note: "Word for word: “it understands itself!”",
    },
    {
      type: "phrase",
      text: "Добре!",
      reading: "dobre!",
      meaning: "OK!",
      words: [{ bg: "Добре!", en: "OK, fine" }],
      note: "You know добре from добре съм. On its own it means OK.",
    },
    pick("Your friend asks “Кафе?”. You'd love one. What do you say?", ["Не, благодаря.", "Да, разбира се!", "Не разбирам."], "Да, разбира се!"),
    {
      type: "match",
      prompt: "Match the pairs",
      pairs: [
        { left: "да", right: "yes" },
        { left: "не", right: "no" },
        { left: "добре", right: "OK" },
        { left: "разбира се", right: "of course" },
      ],
    },
  ]),
  extra("x3-5", "Where are you from?", "Откъде си?", [
    {
      type: "phrase",
      text: "Откъде си?",
      reading: "otkăde si?",
      meaning: "Where are you from?",
      words: [
        { bg: "Откъде", en: "where from", isNew: true },
        { bg: "си?", en: "are you" },
      ],
      note: "от + къде: from + where. You already know къде!",
    },
    {
      type: "phrase",
      text: "От Швеция съм.",
      reading: "ot shvetsiya săm.",
      meaning: "I'm from Sweden.",
      words: [
        { bg: "От", en: "from", isNew: true },
        { bg: "Швеция", en: "Sweden" },
        { bg: "съм.", en: "I am" },
      ],
    },
    {
      type: "tip",
      title: "Countries",
      text: "Swap in your own country!",
      items: [
        { big: "Англия", small: "England" },
        { big: "Германия", small: "Germany" },
        { big: "Швеция", small: "Sweden" },
        { big: "САЩ", small: "the USA" },
      ],
    },
    {
      type: "fill",
      sentence: "___ Англия съм.",
      meaning: "I'm from England.",
      options: ["Къде", "От", "Аз"],
      answer: "От",
    },
    {
      type: "phrase",
      text: "Харесва ли ти България?",
      reading: "haresva li ti bălgariya?",
      meaning: "Do you like Bulgaria?",
      words: [
        { bg: "Харесва", en: "pleases", isNew: true },
        { bg: "ли", en: "question word" },
        { bg: "ти", en: "you" },
        { bg: "България?", en: "Bulgaria" },
      ],
      note: "Word for word: “does Bulgaria please you?”",
    },
    {
      type: "phrase",
      text: "Да, много!",
      reading: "da, mnogo!",
      meaning: "Yes, a lot!",
      words: [
        { bg: "Да,", en: "yes" },
        { bg: "много!", en: "a lot", isNew: true },
      ],
    },
    {
      type: "build",
      prompt: "Write this in Bulgarian",
      target: "I'm from Sweden.",
      words: true,
      answer: ["От", "Швеция", "съм"],
      tiles: ["си", "Швеция", "Англия", "съм", "От"],
    },
    pick("Someone asks “Откъде си?”. Which answer fits?", ["Вкъщи съм.", "От Германия съм.", "Добре съм."], "От Германия съм."),
  ]),
  extra("x3-6", "Speed round", "Questions, fast!", [
    {
      type: "tip",
      title: "Speed round!",
      text: "All the question words, as fast as you can!",
    },
    means("Как си?", ["Who are you?", "How are you?", "Where are you?"], "How are you?"),
    means("Къде е?", ["Where is it?", "What is it?", "When is it?"], "Where is it?"),
    means("Какво е това?", ["Who is this?", "How much is this?", "What is this?"], "What is this?"),
    means("Колко струва?", ["How much is it?", "How are you?", "Why?"], "How much is it?"),
    means("Кой е това?", ["Where is this?", "Who is this?", "What is this?"], "Who is this?"),
    means("Кога идваш?", ["Why are you here?", "When are you coming?", "Where are you going?"], "When are you coming?"),
    means("Защо?", ["When?", "Who?", "Why?"], "Why?"),
  ]),
];

/* ---------- Unit 4: numbers and directions ---------- */

const unit4: CourseLesson[] = [
  extra("x4-1", "Eleven to twenty", "единадесет … двадесет", [
    {
      type: "tip",
      title: "One on ten",
      text: "Numbers 11 to 19 are built like this: one + на + десет, “one on ten”. In everyday speech they get shorter: единайсет, дванайсет…",
      items: [
        { big: "единадесет", small: "11 · edinadeset" },
        { big: "дванадесет", small: "12 · dvanadeset" },
        { big: "петнадесет", small: "15 · petnadeset" },
        { big: "двадесет", small: "20 · dvadeset" },
      ],
    },
    number("тринадесет", ["30", "13", "3"], "13"),
    number("двадесет", ["20", "12", "2"], "20"),
    {
      type: "fill",
      sentence: "Десет, единадесет, ___!",
      meaning: "Ten, eleven, twelve!",
      options: ["двадесет", "дванадесет", "две"],
      answer: "дванадесет",
    },
    number("осемнадесет", ["8", "80", "18"], "18"),
    {
      type: "match",
      prompt: "Match the numbers",
      pairs: [
        { left: "единадесет", right: "11" },
        { left: "петнадесет", right: "15" },
        { left: "седемнадесет", right: "17" },
        { left: "двадесет", right: "20" },
      ],
    },
    number("Двадесет евро", ["12 €", "20 €", "2 €"], "20 €", "How much is it?"),
  ]),
  extra("x4-2", "Phone numbers", "нула, едно, две…", [
    { type: "word", word: "нула", reading: "nula", meaning: "zero", emoji: "0️⃣" },
    {
      type: "phrase",
      text: "Моят номер е…",
      reading: "moyat nomer e…",
      meaning: "My number is…",
      words: [
        { bg: "Моят", en: "my", isNew: true },
        { bg: "номер", en: "number", isNew: true },
        { bg: "е…", en: "is" },
      ],
    },
    number("нула", ["9", "6", "0"], "0"),
    number("осем, нула, пет", ["805", "508", "850"], "805", "Which phone number is this?"),
    number("три, три, седем", ["373", "337", "733"], "337", "Which phone number is this?"),
    {
      type: "fill",
      sentence: "Моят ___ е нула, осем, осем.",
      meaning: "My number is zero, eight, eight.",
      options: ["нула", "моля", "номер"],
      answer: "номер",
    },
    {
      type: "build",
      prompt: "Write “zero” in Bulgarian",
      target: "zero",
      answer: ["н", "у", "л", "а"],
      tiles: ["а", "м", "у", "н", "о", "л"],
    },
  ]),
  extra("x4-3", "Around town", "улица, площад, светофар", [
    { type: "word", word: "улица", reading: "ulitsa", meaning: "street", emoji: "🛣️" },
    { type: "word", word: "площад", reading: "ploshtad", meaning: "square", emoji: "⛲" },
    { type: "word", word: "светофар", reading: "svetofar", meaning: "traffic light", emoji: "🚦" },
    { type: "word", word: "ъгъл", reading: "ăgăl", meaning: "corner", emoji: "↪️" },
    {
      type: "phrase",
      text: "При светофара завий наляво.",
      reading: "pri svetofara zaviy nalyavo.",
      meaning: "At the traffic light, turn left.",
      words: [
        { bg: "При", en: "at", isNew: true },
        { bg: "светофара", en: "the traffic light" },
        { bg: "завий", en: "turn" },
        { bg: "наляво.", en: "to the left" },
      ],
    },
    {
      type: "match",
      prompt: "Match the pairs",
      pairs: [
        { left: "улица", right: "street" },
        { left: "площад", right: "square" },
        { left: "светофар", right: "traffic light" },
        { left: "ъгъл", right: "corner" },
      ],
    },
    {
      type: "fill",
      sentence: "При ___ завий надясно.",
      meaning: "At the traffic light, turn right.",
      options: ["площад", "светофара", "улица"],
      answer: "светофара",
    },
    means("Площадът е близо.", ["The square is far.", "Where is the square?", "The square is near."], "The square is near."),
  ]),
  extra("x4-4", "Tongue twisters", "Петър плет плете", [
    {
      type: "tip",
      title: "Tongue twisters",
      text: "Bulgarians call them скоропоговорки, “fast sayings”. Start slowly, then speed up. Tap after each time you say it!",
    },
    {
      type: "phrase",
      text: "Шест шапки на шест жаби.",
      reading: "shest shapki na shest zhabi.",
      meaning: "Six hats on six frogs.",
      words: [
        { bg: "Шест", en: "six" },
        { bg: "шапки", en: "hats" },
        { bg: "на", en: "on" },
        { bg: "шест", en: "six" },
        { bg: "жаби.", en: "frogs" },
      ],
      note: "Lots of ш! Keep your lips round.",
      repeat: true,
    },
    {
      type: "phrase",
      text: "Котката не пие кафе, котката пие чай.",
      reading: "kotkata ne pie kafe, kotkata pie chay.",
      meaning: "The cat doesn't drink coffee, the cat drinks tea.",
      words: [
        { bg: "Котката", en: "the cat" },
        { bg: "не", en: "not" },
        { bg: "пие", en: "drinks" },
        { bg: "кафе,", en: "coffee" },
        { bg: "котката", en: "the cat" },
        { bg: "пие", en: "drinks" },
        { bg: "чай.", en: "tea" },
      ],
      repeat: true,
    },
    {
      type: "phrase",
      text: "Петър плет плете.",
      reading: "petăr plet plete.",
      meaning: "Peter weaves a fence.",
      words: [
        { bg: "Петър", en: "Peter" },
        { bg: "плет", en: "a fence", isNew: true },
        { bg: "плете.", en: "weaves", isNew: true },
      ],
      note: "The start of a classic Bulgarian tongue twister!",
      repeat: true,
    },
    {
      type: "phrase",
      text: "Петър плет плете, през три пръта преплита.",
      reading: "petăr plet plete, prez tri prăta preplita.",
      meaning: "Peter weaves a fence, weaving it through three rods.",
      words: [
        { bg: "Петър", en: "Peter" },
        { bg: "плет", en: "a fence" },
        { bg: "плете,", en: "weaves" },
        { bg: "през", en: "through", isNew: true },
        { bg: "три", en: "three" },
        { bg: "пръта", en: "rods", isNew: true },
        { bg: "преплита.", en: "weaves it", isNew: true },
      ],
      note: "The full classic. Try it three times fast!",
      repeat: true,
    },
    means("Шест шапки на шест жаби.", ["Six frogs eat six hats.", "Six hats on six frogs.", "Sixteen frogs."], "Six hats on six frogs."),
    {
      type: "fill",
      sentence: "Петър плет ___.",
      meaning: "Peter weaves a fence.",
      options: ["пие", "има", "плете"],
      answer: "плете",
    },
  ]),
  extra("x4-5", "Speed round", "Numbers, fast!", [
    {
      type: "tip",
      title: "Speed round!",
      text: "Numbers from one to twenty. How fast can you go?",
    },
    number("седем", ["7", "6", "9"], "7"),
    number("четири", ["14", "4", "40"], "4"),
    number("петнадесет", ["50", "5", "15"], "15"),
    number("девет", ["9", "6", "19"], "9"),
    number("дванадесет", ["2", "12", "20"], "12"),
    number("шест", ["16", "60", "6"], "6"),
    number("двадесет", ["20", "12", "2"], "20"),
    number("три", ["13", "3", "30"], "3"),
  ]),
];

/** Extras for each main unit, by unit id, in path order. */
export const extras: Record<string, CourseLesson[]> = {
  "unit-1": unit1,
  "unit-2": unit2,
  "unit-3": unit3,
  "unit-4": unit4,
};
