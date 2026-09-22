import { motion } from "framer-motion";
import { BookOpen, Gamepad2, Headphones, Trophy, Layers, MessagesSquare } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Learn the letters",
    description: "Start with Cyrillic, sounds and the first 100 everyday words."
  },
  {
    step: "02",
    title: "Build real sentences",
    description: "Guided lessons take you from single words to full conversations."
  },
  {
    step: "03",
    title: "Keep it alive",
    description: "Daily games, stories and reviews so nothing slips away."
  }
];

const features = [
  {
    icon: BookOpen,
    title: "Bite-sized lessons",
    description: "Vocabulary and grammar in short sets you can finish on a coffee break.",
    tone: "bg-primary/10 text-primary"
  },
  {
    icon: Headphones,
    title: "Native audio",
    description: "Every word and sentence is spoken, so pronunciation comes along for free.",
    tone: "bg-success/15 text-success"
  },
  {
    icon: Gamepad2,
    title: "Word games",
    description: "Endless words, speed rounds and puzzles that make review feel like play.",
    tone: "bg-accent text-accent-foreground"
  },
  {
    icon: Layers,
    title: "Stories & flashcards",
    description: "Read short stories with tap-to-translate words and save them to study.",
    tone: "bg-primary/10 text-primary"
  },
  {
    icon: MessagesSquare,
    title: "Conversation practice",
    description: "Dialogue battles put you in cafés, taxis and shops in Sofia.",
    tone: "bg-accent text-accent-foreground"
  },
  {
    icon: Trophy,
    title: "Streaks & leagues",
    description: "XP, badges and weekly leagues keep you coming back for one more round.",
    tone: "bg-success/15 text-success"
  }
];

export function FeaturesSection() {
  return (
    <>
      <section id="how" className="py-16 sm:py-24 px-5 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-widest text-primary">How it works</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Three steps from alphabet to conversation
            </h2>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-3xl bg-card border border-border p-6 shadow-[var(--shadow-card)]"
              >
                <span className="text-sm font-extrabold text-muted-foreground">{s.step}</span>
                <h3 className="mt-3 text-xl font-extrabold text-foreground">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="learn" className="py-16 sm:py-24 px-5 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-widest text-primary">What you get</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Everything in one place
            </h2>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="rounded-3xl bg-background border border-border p-6"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${feature.tone}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
