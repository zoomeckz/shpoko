import { DailyGame } from "./DailyGame";
import { Gamepad2, Palette, Hash } from "lucide-react";
import { useLanguageMode } from "@/contexts/LanguageModeContext";

// Bulgarian lessons data
const ANIMALS_BG = [
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

const COLORS_BG = [
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

const NUMBERS_BG = [
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

export const DailyGames = () => {
  const { languageMode } = useLanguageMode();
  const isSpanish = languageMode === "spanish";

  const animals = isSpanish ? ANIMALS_ES : ANIMALS_BG;
  const colors = isSpanish ? COLORS_ES : COLORS_BG;
  const numbers = isSpanish ? NUMBERS_ES : NUMBERS_BG;

  return (
    <>
      <DailyGame
        title={isSpanish ? "Животни" : "Animals"}
        gameType="animal"
        items={animals}
        icon={<Gamepad2 className="w-6 h-6 text-yellow-500" />}
      />
      <DailyGame
        title={isSpanish ? "Цветове" : "Colors"}
        gameType="color"
        items={colors}
        icon={<Palette className="w-6 h-6 text-yellow-500" />}
      />
      <DailyGame
        title={isSpanish ? "Числа" : "Numbers"}
        gameType="number"
        items={numbers}
        icon={<Hash className="w-6 h-6 text-yellow-500" />}
      />
    </>
  );
};
