import { motion } from "framer-motion";
import { BookOpen, Gamepad2, Headphones, Trophy } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Bite-sized Lessons",
    description: "Master Bulgarian vocabulary and grammar through quick, interactive exercises."
  },
  {
    icon: Gamepad2,
    title: "Fun Games",
    description: "Practice with word games, quizzes, and challenges that make learning addictive."
  },
  {
    icon: Headphones,
    title: "Stories & Reading",
    description: "Read Bulgarian stories with audio pronunciation and vocabulary tools."
  },
  {
    icon: Trophy,
    title: "Track Progress",
    description: "Earn XP, maintain streaks, and compete on leaderboards with other learners."
  }
];

export function FeaturesSection() {
  return (
    <section className="py-12 px-4 bg-card">
      <div className="max-w-md mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl font-extrabold text-foreground text-center mb-8"
        >
          Why learn with SHPOKO?
        </motion.h2>

        <div className="space-y-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-start gap-4 p-4 bg-background rounded-xl border border-border"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
