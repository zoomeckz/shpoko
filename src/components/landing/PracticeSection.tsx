import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const games = [
  { name: "Endless Words", detail: "Guess or type the word behind the picture." },
  { name: "Contexto", detail: "Close in on a hidden word, guess by guess." },
  { name: "Dialogue Battle", detail: "Hold a real conversation, line by line." },
  { name: "Listening Fill", detail: "Hear a sentence, fill in the gap." }
];

export function PracticeSection() {
  return (
    <section id="practice" className="py-16 sm:py-24 px-5">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Practice</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            The part where it actually sticks
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Lessons teach it once. The games bring it back until you no longer
            have to think about it.
          </p>
          <Link to="/auth" className="inline-block mt-8">
            <Button
              size="lg"
              className="text-base font-extrabold rounded-full px-8 py-6 shadow-[0_5px_0_0_hsl(var(--primary-dark))] active:translate-y-1 active:shadow-none transition-all"
            >
              Try it now
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {games.map((game, i) => (
            <motion.div
              key={game.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-3xl bg-card border border-border p-5 shadow-[var(--shadow-card)]"
            >
              <h3 className="font-extrabold text-foreground">{game.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{game.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
