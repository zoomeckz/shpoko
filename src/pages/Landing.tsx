import { useNavigate } from "react-router-dom";
import { useGuest } from "@/contexts/GuestContext";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { AlphabetStrip } from "@/components/landing/AlphabetStrip";
import { FeatureRows } from "@/components/landing/FeatureRows";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Landing() {
  const navigate = useNavigate();
  const { isGuest, initGuest } = useGuest();

  // "Start learning" needs no account: start a guest session and go to the path.
  const start = () => {
    if (!isGuest) initGuest();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader onStart={start} />
      <main className="flex-1">
        <HeroSection onStart={start} />
        <AlphabetStrip />
        <FeatureRows onStart={start} />
      </main>
      <LandingFooter onStart={start} />
    </div>
  );
}
