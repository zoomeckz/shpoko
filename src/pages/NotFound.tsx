import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useT } from "@/i18n";
import { DuoButton } from "@/components/duolingo/DuoButton";
import shpokoMascot from "@/assets/shpoko-mascot.webp";

const NotFound = () => {
  const location = useLocation();
  const t = useT();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <img src={shpokoMascot} alt="" className="mx-auto w-28 h-28 object-contain" />
        <h1 className="mt-4 text-5xl font-black text-foreground">404</h1>
        <p className="mt-2 text-xl font-bold text-muted-foreground">{t("notFound.title")}</p>
        <DuoButton asChild size="lg" className="mt-6">
          <Link to="/">{t("notFound.home")}</Link>
        </DuoButton>
      </div>
    </div>
  );
};

export default NotFound;
