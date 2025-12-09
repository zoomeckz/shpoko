import { DailyGame } from "./DailyGame";
import { Gamepad2, Palette, Hash } from "lucide-react";

const ANIMALS = [
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

const COLORS = [
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

const NUMBERS = [
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

export const DailyGames = () => {
  return (
    <>
      <DailyGame
        title="Animals"
        gameType="animal"
        items={ANIMALS}
        icon={<Gamepad2 className="w-6 h-6 text-yellow-500" />}
      />
      <DailyGame
        title="Colors"
        gameType="color"
        items={COLORS}
        icon={<Palette className="w-6 h-6 text-yellow-500" />}
      />
      <DailyGame
        title="Numbers"
        gameType="number"
        items={NUMBERS}
        icon={<Hash className="w-6 h-6 text-yellow-500" />}
      />
    </>
  );
};
