import { DailyGame } from "./DailyGame";
import { Gamepad2, Palette, Hash } from "lucide-react";
import { useLanguageMode } from "@/contexts/LanguageModeContext";
import { getTranslations } from "@/lib/translations";

// Bulgarian lessons data (with English prompts)
const ANIMALS_EN = [
  { emoji: "🐕", english: "Dog", bulgarian: "kuche" },
  { emoji: "🐈", english: "Cat", bulgarian: "kotka" },
  { emoji: "🐦", english: "Bird", bulgarian: "ptitsa" },
  { emoji: "🐟", english: "Fish", bulgarian: "riba" },
  { emoji: "🐎", english: "Horse", bulgarian: "kon" },
  { emoji: "🐄", english: "Cow", bulgarian: "krava" },
  { emoji: "🐖", english: "Pig", bulgarian: "prase" },
  { emoji: "🐑", english: "Sheep", bulgarian: "ovtsa" },
  { emoji: "🐐", english: "Goat", bulgarian: "koza" },
  { emoji: "🐓", english: "Rooster", bulgarian: "petel" },
  { emoji: "🦆", english: "Duck", bulgarian: "patitsa" },
  { emoji: "🐇", english: "Rabbit", bulgarian: "zaek" },
  { emoji: "🐻", english: "Bear", bulgarian: "mechka" },
  { emoji: "🦊", english: "Fox", bulgarian: "lisitsa" },
  { emoji: "🐺", english: "Wolf", bulgarian: "valk" },
  { emoji: "🦁", english: "Lion", bulgarian: "lav" },
  { emoji: "🐯", english: "Tiger", bulgarian: "tigar" },
  { emoji: "🐘", english: "Elephant", bulgarian: "slon" },
  { emoji: "🦒", english: "Giraffe", bulgarian: "zhiraf" },
  { emoji: "🐒", english: "Monkey", bulgarian: "maimuna" },
];

const COLORS_EN = [
  { emoji: "🔴", english: "Red", bulgarian: "cherveno" },
  { emoji: "🟠", english: "Orange", bulgarian: "oranzhevo" },
  { emoji: "🟡", english: "Yellow", bulgarian: "zhalto" },
  { emoji: "🟢", english: "Green", bulgarian: "zeleno" },
  { emoji: "🔵", english: "Blue", bulgarian: "sinyo" },
  { emoji: "🟣", english: "Purple", bulgarian: "lilavo" },
  { emoji: "🟤", english: "Brown", bulgarian: "kafyavo" },
  { emoji: "⚫", english: "Black", bulgarian: "cherno" },
  { emoji: "⚪", english: "White", bulgarian: "byalo" },
  { emoji: "🩷", english: "Pink", bulgarian: "rozovo" },
  { emoji: "🩵", english: "Light Blue", bulgarian: "svetlosinyo" },
  { emoji: "🩶", english: "Gray", bulgarian: "sivo" },
];

const NUMBERS_EN = [
  { emoji: "1️⃣", english: "One", bulgarian: "edno" },
  { emoji: "2️⃣", english: "Two", bulgarian: "dve" },
  { emoji: "3️⃣", english: "Three", bulgarian: "tri" },
  { emoji: "4️⃣", english: "Four", bulgarian: "chetiri" },
  { emoji: "5️⃣", english: "Five", bulgarian: "pet" },
  { emoji: "6️⃣", english: "Six", bulgarian: "shest" },
  { emoji: "7️⃣", english: "Seven", bulgarian: "sedem" },
  { emoji: "8️⃣", english: "Eight", bulgarian: "osem" },
  { emoji: "9️⃣", english: "Nine", bulgarian: "devet" },
  { emoji: "🔟", english: "Ten", bulgarian: "deset" },
  { emoji: "1️⃣1️⃣", english: "Eleven", bulgarian: "edinadeset" },
  { emoji: "1️⃣2️⃣", english: "Twelve", bulgarian: "dvanadeset" },
  { emoji: "1️⃣3️⃣", english: "Thirteen", bulgarian: "trinadeset" },
  { emoji: "1️⃣4️⃣", english: "Fourteen", bulgarian: "chetirina­deset" },
  { emoji: "1️⃣5️⃣", english: "Fifteen", bulgarian: "petnadeset" },
  { emoji: "2️⃣0️⃣", english: "Twenty", bulgarian: "dvadeset" },
];

// Bulgarian lessons data (with Swedish prompts)
const ANIMALS_SV = [
  { emoji: "🐕", english: "Hund", bulgarian: "kuche" },
  { emoji: "🐈", english: "Katt", bulgarian: "kotka" },
  { emoji: "🐦", english: "Fågel", bulgarian: "ptitsa" },
  { emoji: "🐟", english: "Fisk", bulgarian: "riba" },
  { emoji: "🐎", english: "Häst", bulgarian: "kon" },
  { emoji: "🐄", english: "Ko", bulgarian: "krava" },
  { emoji: "🐖", english: "Gris", bulgarian: "prase" },
  { emoji: "🐑", english: "Får", bulgarian: "ovtsa" },
  { emoji: "🐐", english: "Get", bulgarian: "koza" },
  { emoji: "🐓", english: "Tupp", bulgarian: "petel" },
  { emoji: "🦆", english: "Anka", bulgarian: "patitsa" },
  { emoji: "🐇", english: "Kanin", bulgarian: "zaek" },
  { emoji: "🐻", english: "Björn", bulgarian: "mechka" },
  { emoji: "🦊", english: "Räv", bulgarian: "lisitsa" },
  { emoji: "🐺", english: "Varg", bulgarian: "valk" },
  { emoji: "🦁", english: "Lejon", bulgarian: "lav" },
  { emoji: "🐯", english: "Tiger", bulgarian: "tigar" },
  { emoji: "🐘", english: "Elefant", bulgarian: "slon" },
  { emoji: "🦒", english: "Giraff", bulgarian: "zhiraf" },
  { emoji: "🐒", english: "Apa", bulgarian: "maimuna" },
];

const COLORS_SV = [
  { emoji: "🔴", english: "Röd", bulgarian: "cherveno" },
  { emoji: "🟠", english: "Orange", bulgarian: "oranzhevo" },
  { emoji: "🟡", english: "Gul", bulgarian: "zhalto" },
  { emoji: "🟢", english: "Grön", bulgarian: "zeleno" },
  { emoji: "🔵", english: "Blå", bulgarian: "sinyo" },
  { emoji: "🟣", english: "Lila", bulgarian: "lilavo" },
  { emoji: "🟤", english: "Brun", bulgarian: "kafyavo" },
  { emoji: "⚫", english: "Svart", bulgarian: "cherno" },
  { emoji: "⚪", english: "Vit", bulgarian: "byalo" },
  { emoji: "🩷", english: "Rosa", bulgarian: "rozovo" },
  { emoji: "🩵", english: "Ljusblå", bulgarian: "svetlosinyo" },
  { emoji: "🩶", english: "Grå", bulgarian: "sivo" },
];

const NUMBERS_SV = [
  { emoji: "1️⃣", english: "Ett", bulgarian: "edno" },
  { emoji: "2️⃣", english: "Två", bulgarian: "dve" },
  { emoji: "3️⃣", english: "Tre", bulgarian: "tri" },
  { emoji: "4️⃣", english: "Fyra", bulgarian: "chetiri" },
  { emoji: "5️⃣", english: "Fem", bulgarian: "pet" },
  { emoji: "6️⃣", english: "Sex", bulgarian: "shest" },
  { emoji: "7️⃣", english: "Sju", bulgarian: "sedem" },
  { emoji: "8️⃣", english: "Åtta", bulgarian: "osem" },
  { emoji: "9️⃣", english: "Nio", bulgarian: "devet" },
  { emoji: "🔟", english: "Tio", bulgarian: "deset" },
  { emoji: "1️⃣1️⃣", english: "Elva", bulgarian: "edinadeset" },
  { emoji: "1️⃣2️⃣", english: "Tolv", bulgarian: "dvanadeset" },
  { emoji: "1️⃣3️⃣", english: "Tretton", bulgarian: "trinadeset" },
  { emoji: "1️⃣4️⃣", english: "Fjorton", bulgarian: "chetirina­deset" },
  { emoji: "1️⃣5️⃣", english: "Femton", bulgarian: "petnadeset" },
  { emoji: "2️⃣0️⃣", english: "Tjugo", bulgarian: "dvadeset" },
];

// Bulgarian lessons data (with Tunisian Arabic prompts)
const ANIMALS_TN = [
  { emoji: "🐕", english: "كلب", bulgarian: "kuche" },
  { emoji: "🐈", english: "قطوس", bulgarian: "kotka" },
  { emoji: "🐦", english: "عصفور", bulgarian: "ptitsa" },
  { emoji: "🐟", english: "حوت", bulgarian: "riba" },
  { emoji: "🐎", english: "عود", bulgarian: "kon" },
  { emoji: "🐄", english: "بقرة", bulgarian: "krava" },
  { emoji: "🐖", english: "حلوف", bulgarian: "prase" },
  { emoji: "🐑", english: "نعجة", bulgarian: "ovtsa" },
  { emoji: "🐐", english: "معزة", bulgarian: "koza" },
  { emoji: "🐓", english: "سردوك", bulgarian: "petel" },
  { emoji: "🦆", english: "بطة", bulgarian: "patitsa" },
  { emoji: "🐇", english: "أرنب", bulgarian: "zaek" },
  { emoji: "🐻", english: "دب", bulgarian: "mechka" },
  { emoji: "🦊", english: "ثعلب", bulgarian: "lisitsa" },
  { emoji: "🐺", english: "ذيب", bulgarian: "valk" },
  { emoji: "🦁", english: "سبع", bulgarian: "lav" },
  { emoji: "🐯", english: "نمر", bulgarian: "tigar" },
  { emoji: "🐘", english: "فيل", bulgarian: "slon" },
  { emoji: "🦒", english: "زرافة", bulgarian: "zhiraf" },
  { emoji: "🐒", english: "قرد", bulgarian: "maimuna" },
];

const COLORS_TN = [
  { emoji: "🔴", english: "أحمر", bulgarian: "cherveno" },
  { emoji: "🟠", english: "برتقالي", bulgarian: "oranzhevo" },
  { emoji: "🟡", english: "أصفر", bulgarian: "zhalto" },
  { emoji: "🟢", english: "أخضر", bulgarian: "zeleno" },
  { emoji: "🔵", english: "أزرق", bulgarian: "sinyo" },
  { emoji: "🟣", english: "بنفسجي", bulgarian: "lilavo" },
  { emoji: "🟤", english: "قهوي", bulgarian: "kafyavo" },
  { emoji: "⚫", english: "أكحل", bulgarian: "cherno" },
  { emoji: "⚪", english: "أبيض", bulgarian: "byalo" },
  { emoji: "🩷", english: "وردي", bulgarian: "rozovo" },
  { emoji: "🩵", english: "أزرق فاتح", bulgarian: "svetlosinyo" },
  { emoji: "🩶", english: "رمادي", bulgarian: "sivo" },
];

const NUMBERS_TN = [
  { emoji: "1️⃣", english: "واحد", bulgarian: "edno" },
  { emoji: "2️⃣", english: "زوز", bulgarian: "dve" },
  { emoji: "3️⃣", english: "ثلاثة", bulgarian: "tri" },
  { emoji: "4️⃣", english: "أربعة", bulgarian: "chetiri" },
  { emoji: "5️⃣", english: "خمسة", bulgarian: "pet" },
  { emoji: "6️⃣", english: "ستة", bulgarian: "shest" },
  { emoji: "7️⃣", english: "سبعة", bulgarian: "sedem" },
  { emoji: "8️⃣", english: "ثمنية", bulgarian: "osem" },
  { emoji: "9️⃣", english: "تسعة", bulgarian: "devet" },
  { emoji: "🔟", english: "عشرة", bulgarian: "deset" },
  { emoji: "1️⃣1️⃣", english: "حداش", bulgarian: "edinadeset" },
  { emoji: "1️⃣2️⃣", english: "اثناش", bulgarian: "dvanadeset" },
  { emoji: "1️⃣3️⃣", english: "ثلطاش", bulgarian: "trinadeset" },
  { emoji: "1️⃣4️⃣", english: "أربعطاش", bulgarian: "chetirina­deset" },
  { emoji: "1️⃣5️⃣", english: "خمسطاش", bulgarian: "petnadeset" },
  { emoji: "2️⃣0️⃣", english: "عشرين", bulgarian: "dvadeset" },
];

// Spanish lessons data (with Bulgarian prompts)
const ANIMALS_ES = [
  { emoji: "🐕", english: "Куче", bulgarian: "perro" },
  { emoji: "🐈", english: "Котка", bulgarian: "gato" },
  { emoji: "🐦", english: "Птица", bulgarian: "pajaro" },
  { emoji: "🐟", english: "Риба", bulgarian: "pez" },
  { emoji: "🐎", english: "Кон", bulgarian: "caballo" },
  { emoji: "🐄", english: "Крава", bulgarian: "vaca" },
  { emoji: "🐖", english: "Прасе", bulgarian: "cerdo" },
  { emoji: "🐑", english: "Овца", bulgarian: "oveja" },
  { emoji: "🐐", english: "Коза", bulgarian: "cabra" },
  { emoji: "🐓", english: "Петел", bulgarian: "gallo" },
  { emoji: "🦆", english: "Патица", bulgarian: "pato" },
  { emoji: "🐇", english: "Заек", bulgarian: "conejo" },
  { emoji: "🐻", english: "Мечка", bulgarian: "oso" },
  { emoji: "🦊", english: "Лисица", bulgarian: "zorro" },
  { emoji: "🐺", english: "Вълк", bulgarian: "lobo" },
  { emoji: "🦁", english: "Лъв", bulgarian: "leon" },
  { emoji: "🐯", english: "Тигър", bulgarian: "tigre" },
  { emoji: "🐘", english: "Слон", bulgarian: "elefante" },
  { emoji: "🦒", english: "Жираф", bulgarian: "jirafa" },
  { emoji: "🐒", english: "Маймуна", bulgarian: "mono" },
];

const COLORS_ES = [
  { emoji: "🔴", english: "Червено", bulgarian: "rojo" },
  { emoji: "🟠", english: "Оранжево", bulgarian: "naranja" },
  { emoji: "🟡", english: "Жълто", bulgarian: "amarillo" },
  { emoji: "🟢", english: "Зелено", bulgarian: "verde" },
  { emoji: "🔵", english: "Синьо", bulgarian: "azul" },
  { emoji: "🟣", english: "Лилаво", bulgarian: "morado" },
  { emoji: "🟤", english: "Кафяво", bulgarian: "marron" },
  { emoji: "⚫", english: "Черно", bulgarian: "negro" },
  { emoji: "⚪", english: "Бяло", bulgarian: "blanco" },
  { emoji: "🩷", english: "Розово", bulgarian: "rosa" },
  { emoji: "🩵", english: "Светлосиньо", bulgarian: "celeste" },
  { emoji: "🩶", english: "Сиво", bulgarian: "gris" },
];

const NUMBERS_ES = [
  { emoji: "1️⃣", english: "Едно", bulgarian: "uno" },
  { emoji: "2️⃣", english: "Две", bulgarian: "dos" },
  { emoji: "3️⃣", english: "Три", bulgarian: "tres" },
  { emoji: "4️⃣", english: "Четири", bulgarian: "cuatro" },
  { emoji: "5️⃣", english: "Пет", bulgarian: "cinco" },
  { emoji: "6️⃣", english: "Шест", bulgarian: "seis" },
  { emoji: "7️⃣", english: "Седем", bulgarian: "siete" },
  { emoji: "8️⃣", english: "Осем", bulgarian: "ocho" },
  { emoji: "9️⃣", english: "Девет", bulgarian: "nueve" },
  { emoji: "🔟", english: "Десет", bulgarian: "diez" },
  { emoji: "1️⃣1️⃣", english: "Единадесет", bulgarian: "once" },
  { emoji: "1️⃣2️⃣", english: "Дванадесет", bulgarian: "doce" },
  { emoji: "1️⃣3️⃣", english: "Тринадесет", bulgarian: "trece" },
  { emoji: "1️⃣4️⃣", english: "Четиринадесет", bulgarian: "catorce" },
  { emoji: "1️⃣5️⃣", english: "Петнадесет", bulgarian: "quince" },
  { emoji: "2️⃣0️⃣", english: "Двадесет", bulgarian: "veinte" },
];

// Bulgarian lessons data (with Dutch prompts)
const ANIMALS_NL = [
  { emoji: "🐕", english: "Hond", bulgarian: "kuche" },
  { emoji: "🐈", english: "Kat", bulgarian: "kotka" },
  { emoji: "🐦", english: "Vogel", bulgarian: "ptitsa" },
  { emoji: "🐟", english: "Vis", bulgarian: "riba" },
  { emoji: "🐎", english: "Paard", bulgarian: "kon" },
  { emoji: "🐄", english: "Koe", bulgarian: "krava" },
  { emoji: "🐖", english: "Varken", bulgarian: "prase" },
  { emoji: "🐑", english: "Schaap", bulgarian: "ovtsa" },
  { emoji: "🐐", english: "Geit", bulgarian: "koza" },
  { emoji: "🐓", english: "Haan", bulgarian: "petel" },
  { emoji: "🦆", english: "Eend", bulgarian: "patitsa" },
  { emoji: "🐇", english: "Konijn", bulgarian: "zaek" },
  { emoji: "🐻", english: "Beer", bulgarian: "mechka" },
  { emoji: "🦊", english: "Vos", bulgarian: "lisitsa" },
  { emoji: "🐺", english: "Wolf", bulgarian: "valk" },
  { emoji: "🦁", english: "Leeuw", bulgarian: "lav" },
  { emoji: "🐯", english: "Tijger", bulgarian: "tigar" },
  { emoji: "🐘", english: "Olifant", bulgarian: "slon" },
  { emoji: "🦒", english: "Giraffe", bulgarian: "zhiraf" },
  { emoji: "🐒", english: "Aap", bulgarian: "maimuna" },
];

const COLORS_NL = [
  { emoji: "🔴", english: "Rood", bulgarian: "cherveno" },
  { emoji: "🟠", english: "Oranje", bulgarian: "oranzhevo" },
  { emoji: "🟡", english: "Geel", bulgarian: "zhalto" },
  { emoji: "🟢", english: "Groen", bulgarian: "zeleno" },
  { emoji: "🔵", english: "Blauw", bulgarian: "sinyo" },
  { emoji: "🟣", english: "Paars", bulgarian: "lilavo" },
  { emoji: "🟤", english: "Bruin", bulgarian: "kafyavo" },
  { emoji: "⚫", english: "Zwart", bulgarian: "cherno" },
  { emoji: "⚪", english: "Wit", bulgarian: "byalo" },
  { emoji: "🩷", english: "Roze", bulgarian: "rozovo" },
  { emoji: "🩵", english: "Lichtblauw", bulgarian: "svetlosinyo" },
  { emoji: "🩶", english: "Grijs", bulgarian: "sivo" },
];

const NUMBERS_NL = [
  { emoji: "1️⃣", english: "Een", bulgarian: "edno" },
  { emoji: "2️⃣", english: "Twee", bulgarian: "dve" },
  { emoji: "3️⃣", english: "Drie", bulgarian: "tri" },
  { emoji: "4️⃣", english: "Vier", bulgarian: "chetiri" },
  { emoji: "5️⃣", english: "Vijf", bulgarian: "pet" },
  { emoji: "6️⃣", english: "Zes", bulgarian: "shest" },
  { emoji: "7️⃣", english: "Zeven", bulgarian: "sedem" },
  { emoji: "8️⃣", english: "Acht", bulgarian: "osem" },
  { emoji: "9️⃣", english: "Negen", bulgarian: "devet" },
  { emoji: "🔟", english: "Tien", bulgarian: "deset" },
  { emoji: "1️⃣1️⃣", english: "Elf", bulgarian: "edinadeset" },
  { emoji: "1️⃣2️⃣", english: "Twaalf", bulgarian: "dvanadeset" },
  { emoji: "1️⃣3️⃣", english: "Dertien", bulgarian: "trinadeset" },
  { emoji: "1️⃣4️⃣", english: "Veertien", bulgarian: "chetirina­deset" },
  { emoji: "1️⃣5️⃣", english: "Vijftien", bulgarian: "petnadeset" },
  { emoji: "2️⃣0️⃣", english: "Twintig", bulgarian: "dvadeset" },
];

// Bulgarian lessons data (with Greek prompts)
const ANIMALS_EL = [
  { emoji: "🐕", english: "Σκύλος", bulgarian: "kuche" },
  { emoji: "🐈", english: "Γάτα", bulgarian: "kotka" },
  { emoji: "🐦", english: "Πουλί", bulgarian: "ptitsa" },
  { emoji: "🐟", english: "Ψάρι", bulgarian: "riba" },
  { emoji: "🐎", english: "Άλογο", bulgarian: "kon" },
  { emoji: "🐄", english: "Αγελάδα", bulgarian: "krava" },
  { emoji: "🐖", english: "Γουρούνι", bulgarian: "prase" },
  { emoji: "🐑", english: "Πρόβατο", bulgarian: "ovtsa" },
  { emoji: "🐐", english: "Κατσίκα", bulgarian: "koza" },
  { emoji: "🐓", english: "Κόκορας", bulgarian: "petel" },
  { emoji: "🦆", english: "Πάπια", bulgarian: "patitsa" },
  { emoji: "🐇", english: "Κουνέλι", bulgarian: "zaek" },
  { emoji: "🐻", english: "Αρκούδα", bulgarian: "mechka" },
  { emoji: "🦊", english: "Αλεπού", bulgarian: "lisitsa" },
  { emoji: "🐺", english: "Λύκος", bulgarian: "valk" },
  { emoji: "🦁", english: "Λιοντάρι", bulgarian: "lav" },
  { emoji: "🐯", english: "Τίγρη", bulgarian: "tigar" },
  { emoji: "🐘", english: "Ελέφαντας", bulgarian: "slon" },
  { emoji: "🦒", english: "Καμηλοπάρδαλη", bulgarian: "zhiraf" },
  { emoji: "🐒", english: "Μαϊμού", bulgarian: "maimuna" },
];

const COLORS_EL = [
  { emoji: "🔴", english: "Κόκκινο", bulgarian: "cherveno" },
  { emoji: "🟠", english: "Πορτοκαλί", bulgarian: "oranzhevo" },
  { emoji: "🟡", english: "Κίτρινο", bulgarian: "zhalto" },
  { emoji: "🟢", english: "Πράσινο", bulgarian: "zeleno" },
  { emoji: "🔵", english: "Μπλε", bulgarian: "sinyo" },
  { emoji: "🟣", english: "Μωβ", bulgarian: "lilavo" },
  { emoji: "🟤", english: "Καφέ", bulgarian: "kafyavo" },
  { emoji: "⚫", english: "Μαύρο", bulgarian: "cherno" },
  { emoji: "⚪", english: "Άσπρο", bulgarian: "byalo" },
  { emoji: "🩷", english: "Ροζ", bulgarian: "rozovo" },
  { emoji: "🩵", english: "Γαλάζιο", bulgarian: "svetlosinyo" },
  { emoji: "🩶", english: "Γκρι", bulgarian: "sivo" },
];

const NUMBERS_EL = [
  { emoji: "1️⃣", english: "Ένα", bulgarian: "edno" },
  { emoji: "2️⃣", english: "Δύο", bulgarian: "dve" },
  { emoji: "3️⃣", english: "Τρία", bulgarian: "tri" },
  { emoji: "4️⃣", english: "Τέσσερα", bulgarian: "chetiri" },
  { emoji: "5️⃣", english: "Πέντε", bulgarian: "pet" },
  { emoji: "6️⃣", english: "Έξι", bulgarian: "shest" },
  { emoji: "7️⃣", english: "Επτά", bulgarian: "sedem" },
  { emoji: "8️⃣", english: "Οκτώ", bulgarian: "osem" },
  { emoji: "9️⃣", english: "Εννιά", bulgarian: "devet" },
  { emoji: "🔟", english: "Δέκα", bulgarian: "deset" },
  { emoji: "1️⃣1️⃣", english: "Έντεκα", bulgarian: "edinadeset" },
  { emoji: "1️⃣2️⃣", english: "Δώδεκα", bulgarian: "dvanadeset" },
  { emoji: "1️⃣3️⃣", english: "Δεκατρία", bulgarian: "trinadeset" },
  { emoji: "1️⃣4️⃣", english: "Δεκατέσσερα", bulgarian: "chetirina­deset" },
  { emoji: "1️⃣5️⃣", english: "Δεκαπέντε", bulgarian: "petnadeset" },
  { emoji: "2️⃣0️⃣", english: "Είκοσι", bulgarian: "dvadeset" },
];

// Bulgarian lessons data (with Russian prompts)
const ANIMALS_RU = [
  { emoji: "🐕", english: "Собака", bulgarian: "kuche" },
  { emoji: "🐈", english: "Кошка", bulgarian: "kotka" },
  { emoji: "🐦", english: "Птица", bulgarian: "ptitsa" },
  { emoji: "🐟", english: "Рыба", bulgarian: "riba" },
  { emoji: "🐎", english: "Лошадь", bulgarian: "kon" },
  { emoji: "🐄", english: "Корова", bulgarian: "krava" },
  { emoji: "🐖", english: "Свинья", bulgarian: "prase" },
  { emoji: "🐑", english: "Овца", bulgarian: "ovtsa" },
  { emoji: "🐐", english: "Коза", bulgarian: "koza" },
  { emoji: "🐓", english: "Петух", bulgarian: "petel" },
  { emoji: "🦆", english: "Утка", bulgarian: "patitsa" },
  { emoji: "🐇", english: "Кролик", bulgarian: "zaek" },
  { emoji: "🐻", english: "Медведь", bulgarian: "mechka" },
  { emoji: "🦊", english: "Лиса", bulgarian: "lisitsa" },
  { emoji: "🐺", english: "Волк", bulgarian: "valk" },
  { emoji: "🦁", english: "Лев", bulgarian: "lav" },
  { emoji: "🐯", english: "Тигр", bulgarian: "tigar" },
  { emoji: "🐘", english: "Слон", bulgarian: "slon" },
  { emoji: "🦒", english: "Жираф", bulgarian: "zhiraf" },
  { emoji: "🐒", english: "Обезьяна", bulgarian: "maimuna" },
];

const COLORS_RU = [
  { emoji: "🔴", english: "Красный", bulgarian: "cherveno" },
  { emoji: "🟠", english: "Оранжевый", bulgarian: "oranzhevo" },
  { emoji: "🟡", english: "Жёлтый", bulgarian: "zhalto" },
  { emoji: "🟢", english: "Зелёный", bulgarian: "zeleno" },
  { emoji: "🔵", english: "Синий", bulgarian: "sinyo" },
  { emoji: "🟣", english: "Фиолетовый", bulgarian: "lilavo" },
  { emoji: "🟤", english: "Коричневый", bulgarian: "kafyavo" },
  { emoji: "⚫", english: "Чёрный", bulgarian: "cherno" },
  { emoji: "⚪", english: "Белый", bulgarian: "byalo" },
  { emoji: "🩷", english: "Розовый", bulgarian: "rozovo" },
  { emoji: "🩵", english: "Голубой", bulgarian: "svetlosinyo" },
  { emoji: "🩶", english: "Серый", bulgarian: "sivo" },
];

const NUMBERS_RU = [
  { emoji: "1️⃣", english: "Один", bulgarian: "edno" },
  { emoji: "2️⃣", english: "Два", bulgarian: "dve" },
  { emoji: "3️⃣", english: "Три", bulgarian: "tri" },
  { emoji: "4️⃣", english: "Четыре", bulgarian: "chetiri" },
  { emoji: "5️⃣", english: "Пять", bulgarian: "pet" },
  { emoji: "6️⃣", english: "Шесть", bulgarian: "shest" },
  { emoji: "7️⃣", english: "Семь", bulgarian: "sedem" },
  { emoji: "8️⃣", english: "Восемь", bulgarian: "osem" },
  { emoji: "9️⃣", english: "Девять", bulgarian: "devet" },
  { emoji: "🔟", english: "Десять", bulgarian: "deset" },
  { emoji: "1️⃣1️⃣", english: "Одиннадцать", bulgarian: "edinadeset" },
  { emoji: "1️⃣2️⃣", english: "Двенадцать", bulgarian: "dvanadeset" },
  { emoji: "1️⃣3️⃣", english: "Тринадцать", bulgarian: "trinadeset" },
  { emoji: "1️⃣4️⃣", english: "Четырнадцать", bulgarian: "chetirina­deset" },
  { emoji: "1️⃣5️⃣", english: "Пятнадцать", bulgarian: "petnadeset" },
  { emoji: "2️⃣0️⃣", english: "Двадцать", bulgarian: "dvadeset" },
];

// Bulgarian lessons data (with Ukrainian prompts)
const ANIMALS_UK = [
  { emoji: "🐕", english: "Собака", bulgarian: "kuche" },
  { emoji: "🐈", english: "Кіт", bulgarian: "kotka" },
  { emoji: "🐦", english: "Птах", bulgarian: "ptitsa" },
  { emoji: "🐟", english: "Риба", bulgarian: "riba" },
  { emoji: "🐎", english: "Кінь", bulgarian: "kon" },
  { emoji: "🐄", english: "Корова", bulgarian: "krava" },
  { emoji: "🐖", english: "Свиня", bulgarian: "prase" },
  { emoji: "🐑", english: "Вівця", bulgarian: "ovtsa" },
  { emoji: "🐐", english: "Коза", bulgarian: "koza" },
  { emoji: "🐓", english: "Півень", bulgarian: "petel" },
  { emoji: "🦆", english: "Качка", bulgarian: "patitsa" },
  { emoji: "🐇", english: "Кролик", bulgarian: "zaek" },
  { emoji: "🐻", english: "Ведмідь", bulgarian: "mechka" },
  { emoji: "🦊", english: "Лисиця", bulgarian: "lisitsa" },
  { emoji: "🐺", english: "Вовк", bulgarian: "valk" },
  { emoji: "🦁", english: "Лев", bulgarian: "lav" },
  { emoji: "🐯", english: "Тигр", bulgarian: "tigar" },
  { emoji: "🐘", english: "Слон", bulgarian: "slon" },
  { emoji: "🦒", english: "Жираф", bulgarian: "zhiraf" },
  { emoji: "🐒", english: "Мавпа", bulgarian: "maimuna" },
];

const COLORS_UK = [
  { emoji: "🔴", english: "Червоний", bulgarian: "cherveno" },
  { emoji: "🟠", english: "Помаранчевий", bulgarian: "oranzhevo" },
  { emoji: "🟡", english: "Жовтий", bulgarian: "zhalto" },
  { emoji: "🟢", english: "Зелений", bulgarian: "zeleno" },
  { emoji: "🔵", english: "Синій", bulgarian: "sinyo" },
  { emoji: "🟣", english: "Фіолетовий", bulgarian: "lilavo" },
  { emoji: "🟤", english: "Коричневий", bulgarian: "kafyavo" },
  { emoji: "⚫", english: "Чорний", bulgarian: "cherno" },
  { emoji: "⚪", english: "Білий", bulgarian: "byalo" },
  { emoji: "🩷", english: "Рожевий", bulgarian: "rozovo" },
  { emoji: "🩵", english: "Блакитний", bulgarian: "svetlosinyo" },
  { emoji: "🩶", english: "Сірий", bulgarian: "sivo" },
];

const NUMBERS_UK = [
  { emoji: "1️⃣", english: "Один", bulgarian: "edno" },
  { emoji: "2️⃣", english: "Два", bulgarian: "dve" },
  { emoji: "3️⃣", english: "Три", bulgarian: "tri" },
  { emoji: "4️⃣", english: "Чотири", bulgarian: "chetiri" },
  { emoji: "5️⃣", english: "П'ять", bulgarian: "pet" },
  { emoji: "6️⃣", english: "Шість", bulgarian: "shest" },
  { emoji: "7️⃣", english: "Сім", bulgarian: "sedem" },
  { emoji: "8️⃣", english: "Вісім", bulgarian: "osem" },
  { emoji: "9️⃣", english: "Дев'ять", bulgarian: "devet" },
  { emoji: "🔟", english: "Десять", bulgarian: "deset" },
  { emoji: "1️⃣1️⃣", english: "Одинадцять", bulgarian: "edinadeset" },
  { emoji: "1️⃣2️⃣", english: "Дванадцять", bulgarian: "dvanadeset" },
  { emoji: "1️⃣3️⃣", english: "Тринадцять", bulgarian: "trinadeset" },
  { emoji: "1️⃣4️⃣", english: "Чотирнадцять", bulgarian: "chetirina­deset" },
  { emoji: "1️⃣5️⃣", english: "П'ятнадцять", bulgarian: "petnadeset" },
  { emoji: "2️⃣0️⃣", english: "Двадцять", bulgarian: "dvadeset" },
];

// Bulgarian lessons data (with Italian prompts)
const ANIMALS_IT = [
  { emoji: "🐕", english: "Cane", bulgarian: "kuche" },
  { emoji: "🐈", english: "Gatto", bulgarian: "kotka" },
  { emoji: "🐦", english: "Uccello", bulgarian: "ptitsa" },
  { emoji: "🐟", english: "Pesce", bulgarian: "riba" },
  { emoji: "🐎", english: "Cavallo", bulgarian: "kon" },
  { emoji: "🐄", english: "Mucca", bulgarian: "krava" },
  { emoji: "🐖", english: "Maiale", bulgarian: "prase" },
  { emoji: "🐑", english: "Pecora", bulgarian: "ovtsa" },
  { emoji: "🐐", english: "Capra", bulgarian: "koza" },
  { emoji: "🐓", english: "Gallo", bulgarian: "petel" },
  { emoji: "🦆", english: "Anatra", bulgarian: "patitsa" },
  { emoji: "🐇", english: "Coniglio", bulgarian: "zaek" },
  { emoji: "🐻", english: "Orso", bulgarian: "mechka" },
  { emoji: "🦊", english: "Volpe", bulgarian: "lisitsa" },
  { emoji: "🐺", english: "Lupo", bulgarian: "valk" },
  { emoji: "🦁", english: "Leone", bulgarian: "lav" },
  { emoji: "🐯", english: "Tigre", bulgarian: "tigar" },
  { emoji: "🐘", english: "Elefante", bulgarian: "slon" },
  { emoji: "🦒", english: "Giraffa", bulgarian: "zhiraf" },
  { emoji: "🐒", english: "Scimmia", bulgarian: "maimuna" },
];

const COLORS_IT = [
  { emoji: "🔴", english: "Rosso", bulgarian: "cherveno" },
  { emoji: "🟠", english: "Arancione", bulgarian: "oranzhevo" },
  { emoji: "🟡", english: "Giallo", bulgarian: "zhalto" },
  { emoji: "🟢", english: "Verde", bulgarian: "zeleno" },
  { emoji: "🔵", english: "Blu", bulgarian: "sinyo" },
  { emoji: "🟣", english: "Viola", bulgarian: "lilavo" },
  { emoji: "🟤", english: "Marrone", bulgarian: "kafyavo" },
  { emoji: "⚫", english: "Nero", bulgarian: "cherno" },
  { emoji: "⚪", english: "Bianco", bulgarian: "byalo" },
  { emoji: "🩷", english: "Rosa", bulgarian: "rozovo" },
  { emoji: "🩵", english: "Azzurro", bulgarian: "svetlosinyo" },
  { emoji: "🩶", english: "Grigio", bulgarian: "sivo" },
];

const NUMBERS_IT = [
  { emoji: "1️⃣", english: "Uno", bulgarian: "edno" },
  { emoji: "2️⃣", english: "Due", bulgarian: "dve" },
  { emoji: "3️⃣", english: "Tre", bulgarian: "tri" },
  { emoji: "4️⃣", english: "Quattro", bulgarian: "chetiri" },
  { emoji: "5️⃣", english: "Cinque", bulgarian: "pet" },
  { emoji: "6️⃣", english: "Sei", bulgarian: "shest" },
  { emoji: "7️⃣", english: "Sette", bulgarian: "sedem" },
  { emoji: "8️⃣", english: "Otto", bulgarian: "osem" },
  { emoji: "9️⃣", english: "Nove", bulgarian: "devet" },
  { emoji: "🔟", english: "Dieci", bulgarian: "deset" },
  { emoji: "1️⃣1️⃣", english: "Undici", bulgarian: "edinadeset" },
  { emoji: "1️⃣2️⃣", english: "Dodici", bulgarian: "dvanadeset" },
  { emoji: "1️⃣3️⃣", english: "Tredici", bulgarian: "trinadeset" },
  { emoji: "1️⃣4️⃣", english: "Quattordici", bulgarian: "chetirina­deset" },
  { emoji: "1️⃣5️⃣", english: "Quindici", bulgarian: "petnadeset" },
  { emoji: "2️⃣0️⃣", english: "Venti", bulgarian: "dvadeset" },
];

// Bulgarian lessons data (with Polish prompts)
const ANIMALS_PL = [
  { emoji: "🐕", english: "Pies", bulgarian: "kuche" },
  { emoji: "🐈", english: "Kot", bulgarian: "kotka" },
  { emoji: "🐦", english: "Ptak", bulgarian: "ptitsa" },
  { emoji: "🐟", english: "Ryba", bulgarian: "riba" },
  { emoji: "🐎", english: "Koń", bulgarian: "kon" },
  { emoji: "🐄", english: "Krowa", bulgarian: "krava" },
  { emoji: "🐖", english: "Świnia", bulgarian: "prase" },
  { emoji: "🐑", english: "Owca", bulgarian: "ovtsa" },
  { emoji: "🐐", english: "Koza", bulgarian: "koza" },
  { emoji: "🐓", english: "Kogut", bulgarian: "petel" },
  { emoji: "🦆", english: "Kaczka", bulgarian: "patitsa" },
  { emoji: "🐇", english: "Królik", bulgarian: "zaek" },
  { emoji: "🐻", english: "Niedźwiedź", bulgarian: "mechka" },
  { emoji: "🦊", english: "Lis", bulgarian: "lisitsa" },
  { emoji: "🐺", english: "Wilk", bulgarian: "valk" },
  { emoji: "🦁", english: "Lew", bulgarian: "lav" },
  { emoji: "🐯", english: "Tygrys", bulgarian: "tigar" },
  { emoji: "🐘", english: "Słoń", bulgarian: "slon" },
  { emoji: "🦒", english: "Żyrafa", bulgarian: "zhiraf" },
  { emoji: "🐒", english: "Małpa", bulgarian: "maimuna" },
];

const COLORS_PL = [
  { emoji: "🔴", english: "Czerwony", bulgarian: "cherveno" },
  { emoji: "🟠", english: "Pomarańczowy", bulgarian: "oranzhevo" },
  { emoji: "🟡", english: "Żółty", bulgarian: "zhalto" },
  { emoji: "🟢", english: "Zielony", bulgarian: "zeleno" },
  { emoji: "🔵", english: "Niebieski", bulgarian: "sinyo" },
  { emoji: "🟣", english: "Fioletowy", bulgarian: "lilavo" },
  { emoji: "🟤", english: "Brązowy", bulgarian: "kafyavo" },
  { emoji: "⚫", english: "Czarny", bulgarian: "cherno" },
  { emoji: "⚪", english: "Biały", bulgarian: "byalo" },
  { emoji: "🩷", english: "Różowy", bulgarian: "rozovo" },
  { emoji: "🩵", english: "Jasnoniebieski", bulgarian: "svetlosinyo" },
  { emoji: "🩶", english: "Szary", bulgarian: "sivo" },
];

const NUMBERS_PL = [
  { emoji: "1️⃣", english: "Jeden", bulgarian: "edno" },
  { emoji: "2️⃣", english: "Dwa", bulgarian: "dve" },
  { emoji: "3️⃣", english: "Trzy", bulgarian: "tri" },
  { emoji: "4️⃣", english: "Cztery", bulgarian: "chetiri" },
  { emoji: "5️⃣", english: "Pięć", bulgarian: "pet" },
  { emoji: "6️⃣", english: "Sześć", bulgarian: "shest" },
  { emoji: "7️⃣", english: "Siedem", bulgarian: "sedem" },
  { emoji: "8️⃣", english: "Osiem", bulgarian: "osem" },
  { emoji: "9️⃣", english: "Dziewięć", bulgarian: "devet" },
  { emoji: "🔟", english: "Dziesięć", bulgarian: "deset" },
  { emoji: "1️⃣1️⃣", english: "Jedenaście", bulgarian: "edinadeset" },
  { emoji: "1️⃣2️⃣", english: "Dwanaście", bulgarian: "dvanadeset" },
  { emoji: "1️⃣3️⃣", english: "Trzynaście", bulgarian: "trinadeset" },
  { emoji: "1️⃣4️⃣", english: "Czternaście", bulgarian: "chetirina­deset" },
  { emoji: "1️⃣5️⃣", english: "Piętnaście", bulgarian: "petnadeset" },
  { emoji: "2️⃣0️⃣", english: "Dwadzieścia", bulgarian: "dvadeset" },
];

export const DailyGames = () => {
  const { languageMode, uiLanguage } = useLanguageMode();
  const t = getTranslations(uiLanguage);

  const getDataForLanguage = () => {
    switch (languageMode) {
      case "spanish":
        return { animals: ANIMALS_ES, colors: COLORS_ES, numbers: NUMBERS_ES };
      case "swedish":
        return { animals: ANIMALS_SV, colors: COLORS_SV, numbers: NUMBERS_SV };
      case "tunisian":
        return { animals: ANIMALS_TN, colors: COLORS_TN, numbers: NUMBERS_TN };
      case "dutch":
        return { animals: ANIMALS_NL, colors: COLORS_NL, numbers: NUMBERS_NL };
      case "greek":
        return { animals: ANIMALS_EL, colors: COLORS_EL, numbers: NUMBERS_EL };
      case "russian":
        return { animals: ANIMALS_RU, colors: COLORS_RU, numbers: NUMBERS_RU };
      case "ukrainian":
        return { animals: ANIMALS_UK, colors: COLORS_UK, numbers: NUMBERS_UK };
      case "italian":
        return { animals: ANIMALS_IT, colors: COLORS_IT, numbers: NUMBERS_IT };
      case "polish":
        return { animals: ANIMALS_PL, colors: COLORS_PL, numbers: NUMBERS_PL };
      default:
        return { animals: ANIMALS_EN, colors: COLORS_EN, numbers: NUMBERS_EN };
    }
  };

  const { animals, colors, numbers } = getDataForLanguage();

  return (
    <>
      <DailyGame
        title={t.animals}
        gameType="animal"
        items={animals}
        icon={<Gamepad2 className="w-6 h-6 text-yellow-500" />}
      />
      <DailyGame
        title={t.colors}
        gameType="color"
        items={colors}
        icon={<Palette className="w-6 h-6 text-yellow-500" />}
      />
      <DailyGame
        title={t.numbers}
        gameType="number"
        items={numbers}
        icon={<Hash className="w-6 h-6 text-yellow-500" />}
      />
    </>
  );
};
