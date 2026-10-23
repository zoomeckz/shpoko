import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Lightbulb, MessageCircle, Sparkles, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { course } from "@/data/course";
import { unitGuide, type VocabItem } from "@/lib/vocabulary";
import { useCourseAccess } from "@/hooks/useCourseAccess";
import { Sidebar } from "@/components/duolingo/Sidebar";
import { TopBar } from "@/components/duolingo/TopBar";
import { useT } from "@/i18n";
import { SoundButton } from "@/components/course/SoundButton";

const BANNER = {
  blue: "bg-primary text-primary-foreground",
  pink: "bg-accent-strong text-white",
  green: "bg-success text-success-foreground",
  gold: "bg-warning text-warning-foreground",
} as const;

function Section({ icon: Icon, title, children }: { icon: typeof Lightbulb; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-2xl font-extrabold text-foreground">
        <Icon className="w-6 h-6 text-primary" />
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function VocabList({ items }: { items: VocabItem[] }) {
  return (
    <ul dir="ltr" className="duo-card divide-y-2 divide-border overflow-hidden">
      {items.map((item) => (
        <li key={item.bg} className="px-4 py-3 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xl font-black text-foreground break-words">{item.bg}</p>
            <p className="text-sm font-bold">
              {item.reading && <span className="text-primary">“{item.reading}” · </span>}
              <span className="text-muted-foreground">{item.en}</span>
            </p>
          </div>
          <SoundButton text={item.bg} size="sm" className="shrink-0" />
        </li>
      ))}
    </ul>
  );
}

/** Everything a unit teaches on one page: tips, key phrases and words. */
export default function UnitGuide() {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const { units } = useCourseAccess();
  const t = useT();
  const unit = course.find((u) => u.id === unitId);
  if (!unit || !units.includes(unit)) return <Navigate to="/" replace />;
  const guide = unitGuide(unit);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 pb-24 lg:pb-10">
          <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10">
            <div>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 rounded-xl px-2 py-1 text-sm font-extrabold uppercase tracking-wide text-primary hover:bg-primary/10"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("common.backToPath")}
              </button>
              <div className={cn("mt-4 rounded-2xl px-5 py-5", BANNER[unit.color])}>
                <p className="text-sm font-extrabold uppercase tracking-widest opacity-80">
                  {t("guidebook.label", { unit: unit.bonus ? t("path.bonusUnit") : t("side.unit", { n: unit.unit }) })}
                </p>
                <h1 className="text-2xl sm:text-3xl font-extrabold">{unit.title}</h1>
                <p className="mt-1 font-bold opacity-90">{t("guidebook.intro")}</p>
              </div>
            </div>

            {guide.phrases.length > 0 && (
              <Section icon={MessageCircle} title={t("guidebook.phrases")}>
                <VocabList items={guide.phrases} />
              </Section>
            )}

            {guide.words.length > 0 && (
              <Section icon={Type} title={t("guidebook.words")}>
                <VocabList items={guide.words} />
              </Section>
            )}

            {guide.tips.length > 0 && (
              <Section icon={Lightbulb} title={t("guidebook.tips")}>
                <div className="space-y-3">
                  {guide.tips.map((tip) => (
                    <div key={tip.title} dir="ltr" className="duo-card px-5 py-4">
                      <p className="text-lg font-extrabold text-foreground">{tip.title}</p>
                      <p className="mt-1 font-semibold text-muted-foreground">{tip.text}</p>
                      {tip.items && (
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {tip.items.map((item) => (
                            <li key={item.big + item.small} className="rounded-xl border-2 border-border px-3 py-1.5">
                              <span className="font-black text-foreground">{item.big}</span>{" "}
                              <span className="text-sm font-bold text-muted-foreground">{item.small}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {guide.extraWords.length > 0 && (
              <Section icon={Sparkles} title={t("guidebook.extras")}>
                <VocabList items={guide.extraWords} />
              </Section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
