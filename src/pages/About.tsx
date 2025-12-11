import { Instagram, ArrowLeft, Youtube, Twitch } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import shpokoLogo from "@/assets/shpoko-logo.png";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between p-4 bg-background border-b border-border">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
          <img src={shpokoLogo} alt="Shpoko mascot" className="w-12 h-12" />
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Shpoko
          </h1>
        </div>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          
          <h2 className="text-3xl font-bold text-foreground">About Shpoko</h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            Shpoko started as a project born out of frustration and lacking resources on how to learn Bulgarian in a fun and interactive way. Tested by other foreigners that study differently, know different languages as a base and people with different hobbies - there is surely something that will suit you as well!
          </p>

          <div className="pt-8">
            <h3 className="text-xl font-semibold text-foreground mb-6">Follow Me</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://instagram.com/anyonebutsam"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity"
              >
                <Instagram className="w-5 h-5" />
                Instagram
              </a>
              <a
                href="https://tiktok.com/@anyonebutsam"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                TikTok
              </a>
              <a
                href="https://twitch.tv/anyonebutsam"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
              >
                <Twitch className="w-5 h-5" />
                Twitch
              </a>
              <a
                href="https://youtube.com/@anyonebutsam"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 text-white font-medium hover:opacity-90 transition-opacity"
              >
                <Youtube className="w-5 h-5" />
                YouTube
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
