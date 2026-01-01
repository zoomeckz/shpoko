import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const languages = [
  { name: "Bulgarian", flag: "🇧🇬", learners: "500K+" },
  { name: "Spanish", flag: "🇪🇸", learners: "34.9M" },
  { name: "French", flag: "🇫🇷", learners: "28.5M" },
  { name: "German", flag: "🇩🇪", learners: "17.8M" },
  { name: "Japanese", flag: "🇯🇵", learners: "16.2M" },
  { name: "Italian", flag: "🇮🇹", learners: "12.1M" },
  { name: "Korean", flag: "🇰🇷", learners: "11.8M" },
  { name: "Chinese", flag: "🇨🇳", learners: "10.5M" },
  { name: "Portuguese", flag: "🇵🇹", learners: "9.2M" },
  { name: "Russian", flag: "🇷🇺", learners: "6.8M" },
  { name: "Hindi", flag: "🇮🇳", learners: "5.4M" },
  { name: "Arabic", flag: "🇸🇦", learners: "4.9M" },
];

export function LanguageGrid() {
  return (
    <section id="languages" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Choose a language to learn
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join millions of learners from around the world
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {languages.map((lang, index) => (
            <motion.div
              key={lang.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link to="/auth">
                <div className="bg-card rounded-xl p-4 border-2 border-border hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                    {lang.flag}
                  </div>
                  <h3 className="font-bold text-foreground text-sm">
                    {lang.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {lang.learners} learners
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link to="/auth">
            <Button 
              size="lg"
              className="font-bold bg-primary hover:bg-primary-light shadow-[0_4px_0_0_hsl(var(--primary-dark))] active:translate-y-1 active:shadow-none transition-all"
            >
              START LEARNING FOR FREE
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
