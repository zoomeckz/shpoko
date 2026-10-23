import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Layers, RotateCcw, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProgress } from "@/hooks/useUserProgress";
import { learnedVocabulary, type VocabItem } from "@/lib/vocabulary";
import { useSfx } from "@/hooks/useSfx";
import { Sidebar } from "@/components/duolingo/Sidebar";
import { TopBar } from "@/components/duolingo/TopBar";
import { DuoButton } from "@/components/duolingo/DuoButton";
import shpokoMascot from "@/assets/shpoko-mascot.webp";
import { useT } from "@/i18n";

type Tab = "words" | "phrases";

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/** Tap to flip; "Again" puts the card back at the end, "Got it" sets it aside. */
function Flashcards({ items, onClose }: { items: VocabItem[]; onClose: () => void }) {
  const [deck, setDeck] = useState(() => shuffle(items));
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const t = useT();
  const sfx = useSfx();
  const card = deck[0];

  const answer = (gotIt: boolean) => {
    if (gotIt) {
      sfx.correct(1);
      setKnown((k) => k + 1);
      setDeck((d) => d.slice(1));
    } else {
      sfx.tap();
      setDeck((d) => [...d.slice(1), d[0]]);
    }
    setFlipped(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onClose} aria-label={t("words.stop")} className="text-muted-foreground hover:text-foreground">
          <X className="w-7 h-7" strokeWidth={3} />
        </button>
        <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${(known / items.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 160, damping: 22 }}
          />
        </div>
        <span className="text-sm font-extrabold text-muted-foreground tabular-nums">
          {known}/{items.length}
        </span>
      </div>

      {card ? (
        <>
          <button
            type="button"
            onClick={() => {
              if (!flipped) sfx.reveal();
              setFlipped((f) => !f);
            }}
            aria-label={flipped ? t("words.showBulgarian") : t("words.showAnswer")}
            dir="ltr" className="duo-card w-full min-h-[260px] px-6 py-8 flex flex-col items-center justify-center text-center"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${card.bg}-${flipped}`}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {flipped ? (
                  <>
                    {card.reading && <p className="text-2xl font-extrabold text-primary">“{card.reading}”</p>}
                    <p className="mt-2 text-3xl font-extrabold text-foreground">{card.en}</p>
                    <p className="mt-3 text-lg font-black text-muted-foreground">{card.bg}</p>
                  </>
                ) : (
                  <>
                    <p className="text-4xl sm:text-5xl font-black text-foreground break-words">{card.bg}</p>
                    <p className="mt-4 text-sm font-extrabold uppercase tracking-widest text-muted-foreground">{t("words.tapToFlip")}</p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </button>
          <div className="grid grid-cols-2 gap-3">
            <DuoButton variant="white" size="xl" onClick={() => answer(false)}>
              <RotateCcw className="w-5 h-5" />
              {t("words.again")}
            </DuoButton>
            <DuoButton variant="success" size="xl" onClick={() => answer(true)}>
              {t("common.gotIt")}
            </DuoButton>
          </div>
        </>
      ) : (
        <div className="duo-card px-6 py-10 text-center">
          <p className="text-5xl" aria-hidden="true">🎉</p>
          <p className="mt-3 text-2xl font-extrabold text-foreground">{t("words.allDone", { n: items.length })}</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <DuoButton
              variant="white"
              size="lg"
              onClick={() => {
                setDeck(shuffle(items));
                setKnown(0);
              }}
            >
              {t("words.goAgain")}
            </DuoButton>
            <DuoButton size="lg" onClick={onClose}>
              {t("words.backToWords")}
            </DuoButton>
          </div>
        </div>
      )}
    </div>
  );
}

/** Every word and phrase from the lessons the learner has finished. */
export default function MyWords() {
  const { isLessonCompleted, loading } = useUserProgress();
  const t = useT();
  const [tab, setTab] = useState<Tab>("words");
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState(false);
  const vocab = useMemo(() => learnedVocabulary(isLessonCompleted), [isLessonCompleted]);
  const list = vocab[tab];
  const q = query.trim().toLowerCase();
  const shown = q
    ? list.filter((i) => i.bg.toLowerCase().includes(q) || i.en.toLowerCase().includes(q) || i.reading?.toLowerCase().includes(q))
    : list;
  const empty = !loading && vocab.words.length + vocab.phrases.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 pb-24 lg:pb-10">
          <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
            {cards ? (
              <Flashcards items={list} onClose={() => setCards(false)} />
            ) : (
              <>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold text-foreground">{t("words.title")}</h1>
                    <p className="mt-1 font-bold text-muted-foreground">
                      {t("words.summary", { w: vocab.words.length, p: vocab.phrases.length })}
                    </p>
                  </div>
                  {list.length > 0 && (
                    <DuoButton size="md" onClick={() => setCards(true)}>
                      <Layers className="w-4 h-4" />
                      {t("words.flashcards")}
                    </DuoButton>
                  )}
                </div>

                {empty ? (
                  <div className="duo-card mt-8 px-6 py-10 text-center">
                    <img src={shpokoMascot} alt="" className="mx-auto w-24 h-24 object-contain" />
                    <p className="mt-3 text-xl font-extrabold text-foreground">{t("words.emptyTitle")}</p>
                    <p className="mt-1 font-semibold text-muted-foreground">{t("words.emptyBody")}</p>
                    <DuoButton asChild size="lg" className="mt-6">
                      <Link to="/">{t("words.startLearning")}</Link>
                    </DuoButton>
                  </div>
                ) : (
                  <>
                    <div className="mt-6 flex gap-2" role="tablist" aria-label={t("words.tabsAria")}>
                      {(["words", "phrases"] as Tab[]).map((tab2) => (
                        <button
                          key={tab2}
                          type="button"
                          role="tab"
                          aria-selected={tab === tab2}
                          onClick={() => setTab(tab2)}
                          className={cn(
                            "rounded-xl border-2 px-4 py-2 font-extrabold transition-colors",
                            tab === tab2 ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {tab2 === "words" ? t("words.tabWords") : t("words.tabPhrases")} <span className="ml-1 text-sm opacity-70">{vocab[tab2].length}</span>
                        </button>
                      ))}
                    </div>
                    <label className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-border bg-card px-4 py-3 focus-within:border-primary">
                      <Search className="w-5 h-5 text-muted-foreground" />
                      <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t("words.search")}
                        className="flex-1 min-w-0 bg-transparent font-bold text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </label>
                    <ul dir="ltr" className="mt-4 duo-card divide-y-2 divide-border overflow-hidden">
                      {shown.map((item) => (
                        <li key={item.bg} className="px-4 py-3">
                          <p className="text-xl font-black text-foreground break-words">{item.bg}</p>
                          <p className="text-sm font-bold">
                            {item.reading && <span className="text-primary">“{item.reading}” · </span>}
                            <span className="text-muted-foreground">{item.en}</span>
                          </p>
                        </li>
                      ))}
                      {shown.length === 0 && (
                        <li className="px-4 py-6 text-center font-bold text-muted-foreground">{t("words.noMatch", { q: query })}</li>
                      )}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
