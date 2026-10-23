import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, Lock, Star, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { TryItCard } from "./TryItCard";

function Row({
  title,
  titleClass,
  body,
  visual,
  flip = false,
}: {
  title: string;
  titleClass: string;
  body: string;
  visual: ReactNode;
  flip?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45 }}
      className="grid md:grid-cols-2 gap-10 md:gap-16 items-center"
    >
      <div className={cn("text-center md:text-left", flip && "md:order-2")}>
        <h2 className={cn("text-4xl sm:text-5xl font-black tracking-tight", titleClass)}>{title}</h2>
        <p className="mt-4 text-lg text-muted-foreground font-semibold max-w-md mx-auto md:mx-0">{body}</p>
      </div>
      <div className={cn(flip && "md:order-1")}>{visual}</div>
    </motion.div>
  );
}

// Illustration: a short winding lesson path.
function PathVisual() {
  const nodes = [
    { state: "done", offset: "translate-x-0" },
    { state: "done", offset: "translate-x-14" },
    { state: "current", offset: "translate-x-4" },
    { state: "locked", offset: "-translate-x-12" },
  ] as const;

  return (
    <div className="relative mx-auto w-full max-w-sm py-4 flex flex-col items-center gap-6" aria-hidden="true">
      <span className="absolute top-0 right-2 inline-flex items-center gap-1.5 rounded-full bg-primary/15 text-primary px-3 py-1.5 text-sm font-extrabold">
        <Timer className="w-4 h-4" /> ~3 min
      </span>
      {nodes.map((node, i) => (
        <div key={i} className={cn("relative", node.offset, node.state === "current" && "mt-12")}>
          {node.state === "current" && (
            <motion.span
              className="absolute -top-11 left-1/2 -translate-x-1/2 rounded-xl border-2 border-border bg-card px-3 py-1.5 text-sm font-extrabold uppercase tracking-wide text-primary whitespace-nowrap"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              Start
            </motion.span>
          )}
          <span
            className={cn(
              "w-[72px] h-[64px] rounded-[50%] flex items-center justify-center",
              node.state === "done" && "bg-primary text-primary-foreground shadow-[0_7px_0_0_hsl(var(--primary-dark))]",
              node.state === "current" && "bg-primary text-primary-foreground shadow-[0_7px_0_0_hsl(var(--primary-dark))] ring-8 ring-primary/20",
              node.state === "locked" && "bg-muted text-muted-foreground/60 shadow-[0_7px_0_0_hsl(var(--border))] border-2 border-border"
            )}
          >
            {node.state === "done" && <Check className="w-8 h-8" strokeWidth={4} />}
            {node.state === "current" && <Star className="w-8 h-8 fill-current" />}
            {node.state === "locked" && <Lock className="w-7 h-7" />}
          </span>
        </div>
      ))}
    </div>
  );
}

// Illustration: everything is included, no price tag.
function FreeVisual() {
  const items = ["Every lesson", "Every exercise", "Every unit", "Today and always"];
  return (
    <div className="relative mx-auto w-full max-w-sm" aria-hidden="true">
      <div className="duo-card p-6 pt-10">
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-3 text-lg font-extrabold text-foreground">
              <span className="w-8 h-8 shrink-0 rounded-full bg-primary flex items-center justify-center shadow-[0_3px_0_0_hsl(var(--primary-dark))]">
                <Check className="w-5 h-5 text-primary-foreground" strokeWidth={4} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <span className="absolute -top-6 -right-2 sm:-right-5 rotate-12 rounded-2xl bg-accent-strong px-4 py-2 text-2xl font-black text-white shadow-[0_5px_0_0_hsl(var(--accent-dark))]">
        €0
      </span>
    </div>
  );
}

interface FeatureRowsProps {
  onStart: () => void;
}

export function FeatureRows({ onStart }: FeatureRowsProps) {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-24 sm:space-y-32">
      <Row
        title="free. fun. fast."
        titleClass="text-primary"
        body="Learning with Shpoko is 100% free, at all times. Bite-sized lessons teach you to read Cyrillic in no time, then the everyday Bulgarian you'll actually use: asking how someone is, ordering a coffee, finding your way."
        visual={<FreeVisual />}
      />
      <Row
        flip
        title="learn by playing"
        titleClass="text-primary"
        body="Every lesson is a quick little game: tap, match, fill the gaps and build sentences. Go on, try it."
        visual={<TryItCard onStart={onStart} />}
      />
      <Row
        title="a little every day"
        titleClass="text-primary"
        body="Lessons take about three minutes, and your path grows with everything you learn."
        visual={<PathVisual />}
      />
    </section>
  );
}
