import { Card } from "@/components/ui/card";
import { ShpokoMascot } from "@/components/ShpokoMascot";
import { useLanguageMode } from "@/contexts/LanguageModeContext";
import { getTranslations } from "@/lib/translations";

interface DailyWord {
  word: string;
  pronunciation: string;
  meaning: string;
  examples: {
    bulgarian: string;
    pronunciation: string;
    translation: string;
  }[];
}

// Bulgarian words (for learning Bulgarian - English UI)
const bulgarianWordsEN: DailyWord[] = [
  {
    word: "Харесвам",
    pronunciation: "Kharesvam",
    meaning: "To like",
    examples: [
      { bulgarian: "Харесва ми.", pronunciation: "Kharesva mi.", translation: "I like it." },
      { bulgarian: "Харесва ли ти?", pronunciation: "Kharesva li ti?", translation: "Do you like it?" },
      { bulgarian: "Тя ме харесва.", pronunciation: "Tya me kharesva.", translation: "She likes me." },
      { bulgarian: "Харесвам тази книга.", pronunciation: "Kharesvam tazi kniga.", translation: "I like this book." },
    ],
  },
  {
    word: "Искам",
    pronunciation: "Iskam",
    meaning: "To want",
    examples: [
      { bulgarian: "Искам вода.", pronunciation: "Iskam voda.", translation: "I want water." },
      { bulgarian: "Какво искаш?", pronunciation: "Kakvo iskash?", translation: "What do you want?" },
      { bulgarian: "Той иска да яде.", pronunciation: "Toy iska da yade.", translation: "He wants to eat." },
      { bulgarian: "Искам да отида.", pronunciation: "Iskam da otida.", translation: "I want to go." },
    ],
  },
  {
    word: "Мога",
    pronunciation: "Moga",
    meaning: "Can / To be able",
    examples: [
      { bulgarian: "Мога да помогна.", pronunciation: "Moga da pomogna.", translation: "I can help." },
      { bulgarian: "Можеш ли?", pronunciation: "Mozhesh li?", translation: "Can you?" },
      { bulgarian: "Не мога.", pronunciation: "Ne moga.", translation: "I can't." },
      { bulgarian: "Мога да говоря.", pronunciation: "Moga da govorya.", translation: "I can speak." },
    ],
  },
  {
    word: "Обичам",
    pronunciation: "Obicham",
    meaning: "To love",
    examples: [
      { bulgarian: "Обичам те.", pronunciation: "Obicham te.", translation: "I love you." },
      { bulgarian: "Обичам храна.", pronunciation: "Obicham hrana.", translation: "I love food." },
      { bulgarian: "Тя ме обича.", pronunciation: "Tya me obicha.", translation: "She loves me." },
      { bulgarian: "Обичам да чета.", pronunciation: "Obicham da cheta.", translation: "I love to read." },
    ],
  },
  {
    word: "Имам",
    pronunciation: "Imam",
    meaning: "To have",
    examples: [
      { bulgarian: "Имам време.", pronunciation: "Imam vreme.", translation: "I have time." },
      { bulgarian: "Имаш ли?", pronunciation: "Imash li?", translation: "Do you have?" },
      { bulgarian: "Нямам.", pronunciation: "Nyamam.", translation: "I don't have." },
      { bulgarian: "Имам идея.", pronunciation: "Imam ideya.", translation: "I have an idea." },
    ],
  },
];

// Bulgarian words (for learning Bulgarian - Swedish UI)
const bulgarianWordsSV: DailyWord[] = [
  {
    word: "Харесвам",
    pronunciation: "Kharesvam",
    meaning: "Att gilla",
    examples: [
      { bulgarian: "Харесва ми.", pronunciation: "Kharesva mi.", translation: "Jag gillar det." },
      { bulgarian: "Харесва ли ти?", pronunciation: "Kharesva li ti?", translation: "Gillar du det?" },
      { bulgarian: "Тя ме харесва.", pronunciation: "Tya me kharesva.", translation: "Hon gillar mig." },
      { bulgarian: "Харесвам тази книга.", pronunciation: "Kharesvam tazi kniga.", translation: "Jag gillar den här boken." },
    ],
  },
  {
    word: "Искам",
    pronunciation: "Iskam",
    meaning: "Att vilja",
    examples: [
      { bulgarian: "Искам вода.", pronunciation: "Iskam voda.", translation: "Jag vill ha vatten." },
      { bulgarian: "Какво искаш?", pronunciation: "Kakvo iskash?", translation: "Vad vill du ha?" },
      { bulgarian: "Той иска да яде.", pronunciation: "Toy iska da yade.", translation: "Han vill äta." },
      { bulgarian: "Искам да отида.", pronunciation: "Iskam da otida.", translation: "Jag vill gå." },
    ],
  },
  {
    word: "Мога",
    pronunciation: "Moga",
    meaning: "Kan / Att kunna",
    examples: [
      { bulgarian: "Мога да помогна.", pronunciation: "Moga da pomogna.", translation: "Jag kan hjälpa." },
      { bulgarian: "Можеш ли?", pronunciation: "Mozhesh li?", translation: "Kan du?" },
      { bulgarian: "Не мога.", pronunciation: "Ne moga.", translation: "Jag kan inte." },
      { bulgarian: "Мога да говоря.", pronunciation: "Moga da govorya.", translation: "Jag kan tala." },
    ],
  },
  {
    word: "Обичам",
    pronunciation: "Obicham",
    meaning: "Att älska",
    examples: [
      { bulgarian: "Обичам те.", pronunciation: "Obicham te.", translation: "Jag älskar dig." },
      { bulgarian: "Обичам храна.", pronunciation: "Obicham hrana.", translation: "Jag älskar mat." },
      { bulgarian: "Тя ме обича.", pronunciation: "Tya me obicha.", translation: "Hon älskar mig." },
      { bulgarian: "Обичам да чета.", pronunciation: "Obicham da cheta.", translation: "Jag älskar att läsa." },
    ],
  },
  {
    word: "Имам",
    pronunciation: "Imam",
    meaning: "Att ha",
    examples: [
      { bulgarian: "Имам време.", pronunciation: "Imam vreme.", translation: "Jag har tid." },
      { bulgarian: "Имаш ли?", pronunciation: "Imash li?", translation: "Har du?" },
      { bulgarian: "Нямам.", pronunciation: "Nyamam.", translation: "Jag har inte." },
      { bulgarian: "Имам идея.", pronunciation: "Imam ideya.", translation: "Jag har en idé." },
    ],
  },
];

// Bulgarian words (for learning Bulgarian - Tunisian Arabic UI)
const bulgarianWordsTN: DailyWord[] = [
  {
    word: "Харесвам",
    pronunciation: "Kharesvam",
    meaning: "نحب / يعجبني",
    examples: [
      { bulgarian: "Харесва ми.", pronunciation: "Kharesva mi.", translation: "يعجبني." },
      { bulgarian: "Харесва ли ти?", pronunciation: "Kharesva li ti?", translation: "يعجبك؟" },
      { bulgarian: "Тя ме харесва.", pronunciation: "Tya me kharesva.", translation: "هي تحبني." },
      { bulgarian: "Харесвам тази книга.", pronunciation: "Kharesvam tazi kniga.", translation: "نحب الكتاب هذا." },
    ],
  },
  {
    word: "Искам",
    pronunciation: "Iskam",
    meaning: "نحب / نريد",
    examples: [
      { bulgarian: "Искам вода.", pronunciation: "Iskam voda.", translation: "نحب ماء." },
      { bulgarian: "Какво искаш?", pronunciation: "Kakvo iskash?", translation: "شنوّة تحب؟" },
      { bulgarian: "Той иска да яде.", pronunciation: "Toy iska da yade.", translation: "هو يحب ياكل." },
      { bulgarian: "Искам да отида.", pronunciation: "Iskam da otida.", translation: "نحب نمشي." },
    ],
  },
  {
    word: "Мога",
    pronunciation: "Moga",
    meaning: "نجّم / نقدر",
    examples: [
      { bulgarian: "Мога да помогна.", pronunciation: "Moga da pomogna.", translation: "نجّم نعاونك." },
      { bulgarian: "Можеш ли?", pronunciation: "Mozhesh li?", translation: "تنجّم؟" },
      { bulgarian: "Не мога.", pronunciation: "Ne moga.", translation: "ما نجّمش." },
      { bulgarian: "Мога да говоря.", pronunciation: "Moga da govorya.", translation: "نجّم نحكي." },
    ],
  },
  {
    word: "Обичам",
    pronunciation: "Obicham",
    meaning: "نحب (حب قوي)",
    examples: [
      { bulgarian: "Обичам те.", pronunciation: "Obicham te.", translation: "نحبك." },
      { bulgarian: "Обичам храна.", pronunciation: "Obicham hrana.", translation: "نحب الماكلة." },
      { bulgarian: "Тя ме обича.", pronunciation: "Tya me obicha.", translation: "هي تحبني." },
      { bulgarian: "Обичам да чета.", pronunciation: "Obicham da cheta.", translation: "نحب نقرا." },
    ],
  },
  {
    word: "Имам",
    pronunciation: "Imam",
    meaning: "عندي",
    examples: [
      { bulgarian: "Имам време.", pronunciation: "Imam vreme.", translation: "عندي وقت." },
      { bulgarian: "Имаш ли?", pronunciation: "Imash li?", translation: "عندك؟" },
      { bulgarian: "Нямам.", pronunciation: "Nyamam.", translation: "ما عنديش." },
      { bulgarian: "Имам идея.", pronunciation: "Imam ideya.", translation: "عندي فكرة." },
    ],
  },
];

// Bulgarian words (for learning Bulgarian - Dutch UI)
const bulgarianWordsNL: DailyWord[] = [
  {
    word: "Харесвам",
    pronunciation: "Kharesvam",
    meaning: "Leuk vinden",
    examples: [
      { bulgarian: "Харесва ми.", pronunciation: "Kharesva mi.", translation: "Ik vind het leuk." },
      { bulgarian: "Харесва ли ти?", pronunciation: "Kharesva li ti?", translation: "Vind je het leuk?" },
      { bulgarian: "Тя ме харесва.", pronunciation: "Tya me kharesva.", translation: "Ze vindt mij leuk." },
      { bulgarian: "Харесвам тази книга.", pronunciation: "Kharesvam tazi kniga.", translation: "Ik vind dit boek leuk." },
    ],
  },
  {
    word: "Искам",
    pronunciation: "Iskam",
    meaning: "Willen",
    examples: [
      { bulgarian: "Искам вода.", pronunciation: "Iskam voda.", translation: "Ik wil water." },
      { bulgarian: "Какво искаш?", pronunciation: "Kakvo iskash?", translation: "Wat wil je?" },
      { bulgarian: "Той иска да яде.", pronunciation: "Toy iska da yade.", translation: "Hij wil eten." },
      { bulgarian: "Искам да отида.", pronunciation: "Iskam da otida.", translation: "Ik wil gaan." },
    ],
  },
  {
    word: "Мога",
    pronunciation: "Moga",
    meaning: "Kunnen",
    examples: [
      { bulgarian: "Мога да помогна.", pronunciation: "Moga da pomogna.", translation: "Ik kan helpen." },
      { bulgarian: "Можеш ли?", pronunciation: "Mozhesh li?", translation: "Kun je?" },
      { bulgarian: "Не мога.", pronunciation: "Ne moga.", translation: "Ik kan niet." },
      { bulgarian: "Мога да говоря.", pronunciation: "Moga da govorya.", translation: "Ik kan spreken." },
    ],
  },
  {
    word: "Обичам",
    pronunciation: "Obicham",
    meaning: "Houden van",
    examples: [
      { bulgarian: "Обичам те.", pronunciation: "Obicham te.", translation: "Ik hou van jou." },
      { bulgarian: "Обичам храна.", pronunciation: "Obicham hrana.", translation: "Ik hou van eten." },
      { bulgarian: "Тя ме обича.", pronunciation: "Tya me obicha.", translation: "Zij houdt van mij." },
      { bulgarian: "Обичам да чета.", pronunciation: "Obicham da cheta.", translation: "Ik hou van lezen." },
    ],
  },
  {
    word: "Имам",
    pronunciation: "Imam",
    meaning: "Hebben",
    examples: [
      { bulgarian: "Имам време.", pronunciation: "Imam vreme.", translation: "Ik heb tijd." },
      { bulgarian: "Имаш ли?", pronunciation: "Imash li?", translation: "Heb je?" },
      { bulgarian: "Нямам.", pronunciation: "Nyamam.", translation: "Ik heb niet." },
      { bulgarian: "Имам идея.", pronunciation: "Imam ideya.", translation: "Ik heb een idee." },
    ],
  },
];

// Bulgarian words (for learning Bulgarian - Greek UI)
const bulgarianWordsEL: DailyWord[] = [
  {
    word: "Харесвам",
    pronunciation: "Kharesvam",
    meaning: "Μου αρέσει",
    examples: [
      { bulgarian: "Харесва ми.", pronunciation: "Kharesva mi.", translation: "Μου αρέσει." },
      { bulgarian: "Харесва ли ти?", pronunciation: "Kharesva li ti?", translation: "Σου αρέσει;" },
      { bulgarian: "Тя ме харесва.", pronunciation: "Tya me kharesva.", translation: "Της αρέσω." },
      { bulgarian: "Харесвам тази книга.", pronunciation: "Kharesvam tazi kniga.", translation: "Μου αρέσει αυτό το βιβλίο." },
    ],
  },
  {
    word: "Искам",
    pronunciation: "Iskam",
    meaning: "Θέλω",
    examples: [
      { bulgarian: "Искам вода.", pronunciation: "Iskam voda.", translation: "Θέλω νερό." },
      { bulgarian: "Какво искаш?", pronunciation: "Kakvo iskash?", translation: "Τι θέλεις;" },
      { bulgarian: "Той иска да яде.", pronunciation: "Toy iska da yade.", translation: "Θέλει να φάει." },
      { bulgarian: "Искам да отида.", pronunciation: "Iskam da otida.", translation: "Θέλω να πάω." },
    ],
  },
  {
    word: "Мога",
    pronunciation: "Moga",
    meaning: "Μπορώ",
    examples: [
      { bulgarian: "Мога да помогна.", pronunciation: "Moga da pomogna.", translation: "Μπορώ να βοηθήσω." },
      { bulgarian: "Можеш ли?", pronunciation: "Mozhesh li?", translation: "Μπορείς;" },
      { bulgarian: "Не мога.", pronunciation: "Ne moga.", translation: "Δεν μπορώ." },
      { bulgarian: "Мога да говоря.", pronunciation: "Moga da govorya.", translation: "Μπορώ να μιλήσω." },
    ],
  },
  {
    word: "Обичам",
    pronunciation: "Obicham",
    meaning: "Αγαπώ",
    examples: [
      { bulgarian: "Обичам те.", pronunciation: "Obicham te.", translation: "Σ' αγαπώ." },
      { bulgarian: "Обичам храна.", pronunciation: "Obicham hrana.", translation: "Αγαπώ το φαγητό." },
      { bulgarian: "Тя ме обича.", pronunciation: "Tya me obicha.", translation: "Με αγαπάει." },
      { bulgarian: "Обичам да чета.", pronunciation: "Obicham da cheta.", translation: "Αγαπώ να διαβάζω." },
    ],
  },
  {
    word: "Имам",
    pronunciation: "Imam",
    meaning: "Έχω",
    examples: [
      { bulgarian: "Имам време.", pronunciation: "Imam vreme.", translation: "Έχω χρόνο." },
      { bulgarian: "Имаш ли?", pronunciation: "Imash li?", translation: "Έχεις;" },
      { bulgarian: "Нямам.", pronunciation: "Nyamam.", translation: "Δεν έχω." },
      { bulgarian: "Имам идея.", pronunciation: "Imam ideya.", translation: "Έχω μια ιδέα." },
    ],
  },
];

// Bulgarian words (for learning Bulgarian - Russian UI)
const bulgarianWordsRU: DailyWord[] = [
  {
    word: "Харесвам",
    pronunciation: "Kharesvam",
    meaning: "Нравиться",
    examples: [
      { bulgarian: "Харесва ми.", pronunciation: "Kharesva mi.", translation: "Мне нравится." },
      { bulgarian: "Харесва ли ти?", pronunciation: "Kharesva li ti?", translation: "Тебе нравится?" },
      { bulgarian: "Тя ме харесва.", pronunciation: "Tya me kharesva.", translation: "Я ей нравлюсь." },
      { bulgarian: "Харесвам тази книга.", pronunciation: "Kharesvam tazi kniga.", translation: "Мне нравится эта книга." },
    ],
  },
  {
    word: "Искам",
    pronunciation: "Iskam",
    meaning: "Хотеть",
    examples: [
      { bulgarian: "Искам вода.", pronunciation: "Iskam voda.", translation: "Я хочу воды." },
      { bulgarian: "Какво искаш?", pronunciation: "Kakvo iskash?", translation: "Что ты хочешь?" },
      { bulgarian: "Той иска да яде.", pronunciation: "Toy iska da yade.", translation: "Он хочет есть." },
      { bulgarian: "Искам да отида.", pronunciation: "Iskam da otida.", translation: "Я хочу пойти." },
    ],
  },
  {
    word: "Мога",
    pronunciation: "Moga",
    meaning: "Мочь",
    examples: [
      { bulgarian: "Мога да помогна.", pronunciation: "Moga da pomogna.", translation: "Я могу помочь." },
      { bulgarian: "Можеш ли?", pronunciation: "Mozhesh li?", translation: "Ты можешь?" },
      { bulgarian: "Не мога.", pronunciation: "Ne moga.", translation: "Я не могу." },
      { bulgarian: "Мога да говоря.", pronunciation: "Moga da govorya.", translation: "Я могу говорить." },
    ],
  },
  {
    word: "Обичам",
    pronunciation: "Obicham",
    meaning: "Любить",
    examples: [
      { bulgarian: "Обичам те.", pronunciation: "Obicham te.", translation: "Я тебя люблю." },
      { bulgarian: "Обичам храна.", pronunciation: "Obicham hrana.", translation: "Я люблю еду." },
      { bulgarian: "Тя ме обича.", pronunciation: "Tya me obicha.", translation: "Она меня любит." },
      { bulgarian: "Обичам да чета.", pronunciation: "Obicham da cheta.", translation: "Я люблю читать." },
    ],
  },
  {
    word: "Имам",
    pronunciation: "Imam",
    meaning: "Иметь",
    examples: [
      { bulgarian: "Имам време.", pronunciation: "Imam vreme.", translation: "У меня есть время." },
      { bulgarian: "Имаш ли?", pronunciation: "Imash li?", translation: "У тебя есть?" },
      { bulgarian: "Нямам.", pronunciation: "Nyamam.", translation: "У меня нет." },
      { bulgarian: "Имам идея.", pronunciation: "Imam ideya.", translation: "У меня есть идея." },
    ],
  },
];

// Bulgarian words (for learning Bulgarian - Ukrainian UI)
const bulgarianWordsUK: DailyWord[] = [
  {
    word: "Харесвам",
    pronunciation: "Kharesvam",
    meaning: "Подобатися",
    examples: [
      { bulgarian: "Харесва ми.", pronunciation: "Kharesva mi.", translation: "Мені подобається." },
      { bulgarian: "Харесва ли ти?", pronunciation: "Kharesva li ti?", translation: "Тобі подобається?" },
      { bulgarian: "Тя ме харесва.", pronunciation: "Tya me kharesva.", translation: "Я їй подобаюся." },
      { bulgarian: "Харесвам тази книга.", pronunciation: "Kharesvam tazi kniga.", translation: "Мені подобається ця книга." },
    ],
  },
  {
    word: "Искам",
    pronunciation: "Iskam",
    meaning: "Хотіти",
    examples: [
      { bulgarian: "Искам вода.", pronunciation: "Iskam voda.", translation: "Я хочу води." },
      { bulgarian: "Какво искаш?", pronunciation: "Kakvo iskash?", translation: "Що ти хочеш?" },
      { bulgarian: "Той иска да яде.", pronunciation: "Toy iska da yade.", translation: "Він хоче їсти." },
      { bulgarian: "Искам да отида.", pronunciation: "Iskam da otida.", translation: "Я хочу піти." },
    ],
  },
  {
    word: "Мога",
    pronunciation: "Moga",
    meaning: "Могти",
    examples: [
      { bulgarian: "Мога да помогна.", pronunciation: "Moga da pomogna.", translation: "Я можу допомогти." },
      { bulgarian: "Можеш ли?", pronunciation: "Mozhesh li?", translation: "Ти можеш?" },
      { bulgarian: "Не мога.", pronunciation: "Ne moga.", translation: "Я не можу." },
      { bulgarian: "Мога да говоря.", pronunciation: "Moga da govorya.", translation: "Я можу говорити." },
    ],
  },
  {
    word: "Обичам",
    pronunciation: "Obicham",
    meaning: "Любити",
    examples: [
      { bulgarian: "Обичам те.", pronunciation: "Obicham te.", translation: "Я тебе люблю." },
      { bulgarian: "Обичам храна.", pronunciation: "Obicham hrana.", translation: "Я люблю їжу." },
      { bulgarian: "Тя ме обича.", pronunciation: "Tya me obicha.", translation: "Вона мене любить." },
      { bulgarian: "Обичам да чета.", pronunciation: "Obicham da cheta.", translation: "Я люблю читати." },
    ],
  },
  {
    word: "Имам",
    pronunciation: "Imam",
    meaning: "Мати",
    examples: [
      { bulgarian: "Имам време.", pronunciation: "Imam vreme.", translation: "У мене є час." },
      { bulgarian: "Имаш ли?", pronunciation: "Imash li?", translation: "У тебе є?" },
      { bulgarian: "Нямам.", pronunciation: "Nyamam.", translation: "У мене немає." },
      { bulgarian: "Имам идея.", pronunciation: "Imam ideya.", translation: "У мене є ідея." },
    ],
  },
];

// Bulgarian words (for learning Bulgarian - Italian UI)
const bulgarianWordsIT: DailyWord[] = [
  {
    word: "Харесвам",
    pronunciation: "Kharesvam",
    meaning: "Piacere",
    examples: [
      { bulgarian: "Харесва ми.", pronunciation: "Kharesva mi.", translation: "Mi piace." },
      { bulgarian: "Харесва ли ти?", pronunciation: "Kharesva li ti?", translation: "Ti piace?" },
      { bulgarian: "Тя ме харесва.", pronunciation: "Tya me kharesva.", translation: "Le piaccio." },
      { bulgarian: "Харесвам тази книга.", pronunciation: "Kharesvam tazi kniga.", translation: "Mi piace questo libro." },
    ],
  },
  {
    word: "Искам",
    pronunciation: "Iskam",
    meaning: "Volere",
    examples: [
      { bulgarian: "Искам вода.", pronunciation: "Iskam voda.", translation: "Voglio acqua." },
      { bulgarian: "Какво искаш?", pronunciation: "Kakvo iskash?", translation: "Cosa vuoi?" },
      { bulgarian: "Той иска да яде.", pronunciation: "Toy iska da yade.", translation: "Vuole mangiare." },
      { bulgarian: "Искам да отида.", pronunciation: "Iskam da otida.", translation: "Voglio andare." },
    ],
  },
  {
    word: "Мога",
    pronunciation: "Moga",
    meaning: "Potere",
    examples: [
      { bulgarian: "Мога да помогна.", pronunciation: "Moga da pomogna.", translation: "Posso aiutare." },
      { bulgarian: "Можеш ли?", pronunciation: "Mozhesh li?", translation: "Puoi?" },
      { bulgarian: "Не мога.", pronunciation: "Ne moga.", translation: "Non posso." },
      { bulgarian: "Мога да говоря.", pronunciation: "Moga da govorya.", translation: "Posso parlare." },
    ],
  },
  {
    word: "Обичам",
    pronunciation: "Obicham",
    meaning: "Amare",
    examples: [
      { bulgarian: "Обичам те.", pronunciation: "Obicham te.", translation: "Ti amo." },
      { bulgarian: "Обичам храна.", pronunciation: "Obicham hrana.", translation: "Amo il cibo." },
      { bulgarian: "Тя ме обича.", pronunciation: "Tya me obicha.", translation: "Lei mi ama." },
      { bulgarian: "Обичам да чета.", pronunciation: "Obicham da cheta.", translation: "Amo leggere." },
    ],
  },
  {
    word: "Имам",
    pronunciation: "Imam",
    meaning: "Avere",
    examples: [
      { bulgarian: "Имам време.", pronunciation: "Imam vreme.", translation: "Ho tempo." },
      { bulgarian: "Имаш ли?", pronunciation: "Imash li?", translation: "Hai?" },
      { bulgarian: "Нямам.", pronunciation: "Nyamam.", translation: "Non ho." },
      { bulgarian: "Имам идея.", pronunciation: "Imam ideya.", translation: "Ho un'idea." },
    ],
  },
];

// Bulgarian words (for learning Bulgarian - Polish UI)
const bulgarianWordsPL: DailyWord[] = [
  {
    word: "Харесвам",
    pronunciation: "Kharesvam",
    meaning: "Lubić",
    examples: [
      { bulgarian: "Харесва ми.", pronunciation: "Kharesva mi.", translation: "Podoba mi się." },
      { bulgarian: "Харесва ли ти?", pronunciation: "Kharesva li ti?", translation: "Podoba ci się?" },
      { bulgarian: "Тя ме харесва.", pronunciation: "Tya me kharesva.", translation: "Ona mnie lubi." },
      { bulgarian: "Харесвам тази книга.", pronunciation: "Kharesvam tazi kniga.", translation: "Lubię tę książkę." },
    ],
  },
  {
    word: "Искам",
    pronunciation: "Iskam",
    meaning: "Chcieć",
    examples: [
      { bulgarian: "Искам вода.", pronunciation: "Iskam voda.", translation: "Chcę wody." },
      { bulgarian: "Какво искаш?", pronunciation: "Kakvo iskash?", translation: "Co chcesz?" },
      { bulgarian: "Той иска да яде.", pronunciation: "Toy iska da yade.", translation: "On chce jeść." },
      { bulgarian: "Искам да отида.", pronunciation: "Iskam da otida.", translation: "Chcę iść." },
    ],
  },
  {
    word: "Мога",
    pronunciation: "Moga",
    meaning: "Móc",
    examples: [
      { bulgarian: "Мога да помогна.", pronunciation: "Moga da pomogna.", translation: "Mogę pomóc." },
      { bulgarian: "Можеш ли?", pronunciation: "Mozhesh li?", translation: "Czy możesz?" },
      { bulgarian: "Не мога.", pronunciation: "Ne moga.", translation: "Nie mogę." },
      { bulgarian: "Мога да говоря.", pronunciation: "Moga da govorya.", translation: "Mogę mówić." },
    ],
  },
  {
    word: "Обичам",
    pronunciation: "Obicham",
    meaning: "Kochać",
    examples: [
      { bulgarian: "Обичам те.", pronunciation: "Obicham te.", translation: "Kocham cię." },
      { bulgarian: "Обичам храна.", pronunciation: "Obicham hrana.", translation: "Kocham jedzenie." },
      { bulgarian: "Тя ме обича.", pronunciation: "Tya me obicha.", translation: "Ona mnie kocha." },
      { bulgarian: "Обичам да чета.", pronunciation: "Obicham da cheta.", translation: "Kocham czytać." },
    ],
  },
  {
    word: "Имам",
    pronunciation: "Imam",
    meaning: "Mieć",
    examples: [
      { bulgarian: "Имам време.", pronunciation: "Imam vreme.", translation: "Mam czas." },
      { bulgarian: "Имаш ли?", pronunciation: "Imash li?", translation: "Czy masz?" },
      { bulgarian: "Нямам.", pronunciation: "Nyamam.", translation: "Nie mam." },
      { bulgarian: "Имам идея.", pronunciation: "Imam ideya.", translation: "Mam pomysł." },
    ],
  },
];

// Spanish words (for learning Spanish - Bulgarian UI)
interface SpanishDailyWord {
  word: string;
  pronunciation: string;
  meaning: string;
  examples: {
    spanish: string;
    pronunciation: string;
    bulgarian: string;
  }[];
}
interface SpanishDailyWord {
  word: string;
  pronunciation: string;
  meaning: string;
  examples: {
    spanish: string;
    pronunciation: string;
    bulgarian: string;
  }[];
}

const spanishWordsOfTheDay: SpanishDailyWord[] = [
  {
    word: "Querer",
    pronunciation: "керер",
    meaning: "Искам / Обичам",
    examples: [
      { spanish: "Te quiero.", pronunciation: "Те киеро.", bulgarian: "Обичам те." },
      { spanish: "Quiero agua.", pronunciation: "Киеро агуа.", bulgarian: "Искам вода." },
      { spanish: "¿Qué quieres?", pronunciation: "Ке киерес?", bulgarian: "Какво искаш?" },
      { spanish: "Quiero ir.", pronunciation: "Киеро ир.", bulgarian: "Искам да отида." },
    ],
  },
  {
    word: "Poder",
    pronunciation: "подер",
    meaning: "Мога",
    examples: [
      { spanish: "Puedo ayudar.", pronunciation: "Пуедо аюдар.", bulgarian: "Мога да помогна." },
      { spanish: "¿Puedes?", pronunciation: "Пуедес?", bulgarian: "Можеш ли?" },
      { spanish: "No puedo.", pronunciation: "Но пуедо.", bulgarian: "Не мога." },
      { spanish: "Puedo hablar.", pronunciation: "Пуедо аблар.", bulgarian: "Мога да говоря." },
    ],
  },
  {
    word: "Tener",
    pronunciation: "тенер",
    meaning: "Имам",
    examples: [
      { spanish: "Tengo tiempo.", pronunciation: "Тенго тиемпо.", bulgarian: "Имам време." },
      { spanish: "¿Tienes?", pronunciation: "Тиенес?", bulgarian: "Имаш ли?" },
      { spanish: "No tengo.", pronunciation: "Но тенго.", bulgarian: "Нямам." },
      { spanish: "Tengo una idea.", pronunciation: "Тенго уна идеа.", bulgarian: "Имам идея." },
    ],
  },
  {
    word: "Gustar",
    pronunciation: "густар",
    meaning: "Харесвам",
    examples: [
      { spanish: "Me gusta.", pronunciation: "Ме густа.", bulgarian: "Харесва ми." },
      { spanish: "¿Te gusta?", pronunciation: "Те густа?", bulgarian: "Харесва ли ти?" },
      { spanish: "Me gusta este libro.", pronunciation: "Ме густа есте либро.", bulgarian: "Харесвам тази книга." },
      { spanish: "Le gusta.", pronunciation: "Ле густа.", bulgarian: "Харесва му/ѝ." },
    ],
  },
  {
    word: "Amar",
    pronunciation: "амар",
    meaning: "Обичам",
    examples: [
      { spanish: "Te amo.", pronunciation: "Те амо.", bulgarian: "Обичам те." },
      { spanish: "Amo la comida.", pronunciation: "Амо ла комида.", bulgarian: "Обичам храна." },
      { spanish: "Ella me ama.", pronunciation: "Ея ме ама.", bulgarian: "Тя ме обича." },
      { spanish: "Amo leer.", pronunciation: "Амо леер.", bulgarian: "Обичам да чета." },
    ],
  },
];

const getWordOfTheDay = (words: DailyWord[]): DailyWord => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return words[dayOfYear % words.length];
};

const getSpanishWordOfTheDay = (words: SpanishDailyWord[]): SpanishDailyWord => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return words[dayOfYear % words.length];
};

export const WordOfTheDay = () => {
  const { languageMode, uiLanguage } = useLanguageMode();
  const t = getTranslations(uiLanguage);

  if (languageMode === "spanish") {
    const word = getSpanishWordOfTheDay(spanishWordsOfTheDay);
    return (
      <Card className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShpokoMascot size="xs" />
          <h2 className="text-sm font-bold text-foreground">{t.wordOfTheDay}</h2>
        </div>

        <div className="text-center mb-3">
          <div className="text-3xl font-bold text-primary">{word.word}</div>
          <div className="text-base text-muted-foreground">{word.pronunciation}</div>
          <div className="text-sm font-medium text-foreground">{word.meaning}</div>
        </div>

        <div className="space-y-1">
          {word.examples.slice(0, 2).map((example, index) => (
            <div key={index} className="p-1.5 bg-card/80 rounded text-xs border border-border/50 text-center">
              <div className="font-medium text-primary">{example.spanish}</div>
              <div className="text-muted-foreground">{example.pronunciation} — {example.bulgarian}</div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Bulgarian mode - select words based on UI language
  const getWordsForLanguage = () => {
    switch (uiLanguage) {
      case 'swedish': return bulgarianWordsSV;
      case 'tunisian': return bulgarianWordsTN;
      case 'dutch': return bulgarianWordsNL;
      case 'greek': return bulgarianWordsEL;
      case 'russian': return bulgarianWordsRU;
      case 'ukrainian': return bulgarianWordsUK;
      case 'italian': return bulgarianWordsIT;
      case 'polish': return bulgarianWordsPL;
      default: return bulgarianWordsEN;
    }
  };
  const words = getWordsForLanguage();
  const word = getWordOfTheDay(words);
  
  return (
    <Card className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <div className="flex items-center justify-center gap-2 mb-2">
        <ShpokoMascot size="xs" />
        <h2 className="text-sm font-bold text-foreground">{t.wordOfTheDay}</h2>
      </div>

      <div className="text-center mb-3">
        <div className="text-3xl font-bold text-primary">{word.word}</div>
        <div className="text-base text-muted-foreground">{word.pronunciation}</div>
        <div className="text-sm font-medium text-foreground">{word.meaning}</div>
      </div>

      <div className="space-y-1">
        {word.examples.slice(0, 2).map((example, index) => (
          <div key={index} className="p-1.5 bg-card/80 rounded text-xs border border-border/50 text-center">
            <div className="font-medium text-primary">{example.bulgarian}</div>
            <div className="text-muted-foreground">{example.pronunciation} — {example.translation}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};
