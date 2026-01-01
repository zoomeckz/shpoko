import { motion } from "framer-motion";
import { Zap, Trophy, Brain, Gamepad2, BarChart3, Users } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Effective and Efficient",
    description: "Our courses effectively teach reading, listening, and speaking skills. Check out our latest research!"
  },
  {
    icon: Gamepad2,
    title: "Gamified Learning",
    description: "Make fast progress with bite-sized lessons, fun games, and rewards that keep you motivated."
  },
  {
    icon: Brain,
    title: "Personalized Learning",
    description: "Combining the best of AI and language science, lessons are tailored to help you learn at just the right level and pace."
  },
  {
    icon: Trophy,
    title: "Stay Motivated",
    description: "We make it easy to form a habit of language learning with game-like features, fun challenges, and reminders."
  },
  {
    icon: BarChart3,
    title: "Track Your Progress",
    description: "See your improvement over time with detailed stats on your learning journey, streaks, and achievements."
  },
  {
    icon: Users,
    title: "Join Millions",
    description: "Connect with a global community of learners. Compete in weekly leaderboards and share your progress."
  }
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Why learners love Shpoko
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            The world's most popular way to learn languages online. 
            Learn anytime, anywhere with our free app.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="bg-background rounded-2xl p-6 border-2 border-border shadow-[0_4px_0_0_hsl(var(--border))] hover:shadow-[0_6px_0_0_hsl(var(--border))] hover:-translate-y-1 transition-all duration-200">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
