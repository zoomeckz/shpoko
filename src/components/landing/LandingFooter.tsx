import { Link } from "react-router-dom";
import { DuoButton } from "@/components/duolingo/DuoButton";
import shpokoMascot from "@/assets/shpoko-mascot.webp";
import { Wordmark } from "./Wordmark";
import { isLive } from "@/config/features";
import { useT } from "@/i18n";
import { LanguageSelect } from "@/components/LanguageSelect";

interface LandingFooterProps {
  onStart: () => void;
}

export function LandingFooter({ onStart }: LandingFooterProps) {
  const t = useT();
  return (
    <>
      <section className="border-t-2 border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <img src={shpokoMascot} alt="" className="w-28 h-28 mx-auto object-contain" />
          <h2 className="mt-6 text-3xl sm:text-4xl font-black tracking-tight text-foreground max-w-xl mx-auto">
            {t("landing.footerTitle")}
          </h2>
          <DuoButton size="xl" className="mt-8 w-full max-w-[330px]" onClick={onStart}>
            {t("common.getStarted")}
          </DuoButton>
        </div>
      </section>

      <footer className="bg-primary dark:bg-card dark:border-t-2 dark:border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Wordmark inverted />
          <nav className="flex items-center gap-6 text-sm font-extrabold text-white/90">
            {isLive("/about") && <Link to="/about" className="hover:text-white">{t("landing.about")}</Link>}
            <Link to="/auth" className="hover:text-white">{t("common.logIn")}</Link>
          </nav>
          <LanguageSelect className="text-white" />
          <p className="text-xs font-bold text-white/80">© {new Date().getFullYear()} Shpoko</p>
        </div>
      </footer>
    </>
  );
}
