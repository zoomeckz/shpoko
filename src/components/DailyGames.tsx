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

export const DailyGames = () => {
  const { languageMode, uiLanguage } = useLanguageMode();
  const t = getTranslations(uiLanguage);
  const isSpanish = languageMode === "spanish";
  const isSwedish = languageMode === "swedish";
  const isTunisian = languageMode === "tunisian";
  const isDutch = languageMode === "dutch";

  const animals = isSpanish ? ANIMALS_ES : isSwedish ? ANIMALS_SV : isTunisian ? ANIMALS_TN : isDutch ? ANIMALS_NL : ANIMALS_EN;
  const colors = isSpanish ? COLORS_ES : isSwedish ? COLORS_SV : isTunisian ? COLORS_TN : isDutch ? COLORS_NL : COLORS_EN;
  const numbers = isSpanish ? NUMBERS_ES : isSwedish ? NUMBERS_SV : isTunisian ? NUMBERS_TN : isDutch ? NUMBERS_NL : NUMBERS_EN;

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
