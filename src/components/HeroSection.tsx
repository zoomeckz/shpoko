import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Trophy, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import raccoonMascot from "@/assets/raccoon-mascot.png";
import heroBackground from "@/assets/hero-background.jpg";

export const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section 
      className="relative py-12 px-4 overflow-hidden"
      style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
      
      <div className="relative max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Learn Bulgarian with{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Shpoko
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-lg">
              Master Bulgarian through fun, bite-sized lessons with your friendly companion. 
              From Cyrillic to conversation in just 15 minutes a day!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button 
                size="lg" 
                className="bg-gradient-primary text-lg px-8 py-6 hover:opacity-90 shadow-strong"
                onClick={() => navigate("/lesson/cyrillic")}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Learning
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
              <div className="text-center">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-5 h-5 text-warning" />
                </div>
                <p className="text-sm text-muted-foreground">50+ Lessons</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-5 h-5 text-success" />
                </div>
                <p className="text-sm text-muted-foreground">15 Min/Day</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center lg:justify-end">
            <Card className="p-6 bg-background/95 backdrop-blur-sm border-2 border-primary/20 shadow-strong">
              <div className="text-center">
                <img 
                  src={raccoonMascot} 
                  alt="Shpoko mascot" 
                  className="w-32 h-32 mx-auto mb-4 drop-shadow-lg" 
                />
                <h3 className="text-xl font-bold mb-2">Meet Shpoko!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your Bulgarian learning companion. I'll guide you through every lesson!
                </p>
                <div className="bg-gradient-primary rounded-lg p-3 text-primary-foreground">
                  <p className="font-medium text-sm">💬 "Здравей! Ready to start?"</p>
                  <p className="text-xs opacity-90 mt-1">(Hello! Ready to start?)</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
