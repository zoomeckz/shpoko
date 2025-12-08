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
      className="relative py-20 px-4 overflow-hidden"
      style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
      
      <div className="relative max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Learn Bulgarian with{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Shpoko
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-lg">
              Master Bulgarian through fun, bite-sized lessons with your friendly raccoon companion. 
              From Cyrillic to conversation in just 15 minutes a day!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                size="lg" 
                className="bg-gradient-primary text-lg px-8 py-6 hover:opacity-90 shadow-strong"
                onClick={() => navigate("/lesson/cyrillic")}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Learning
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-6"
              >
                Try Demo Lesson
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 max-w-md mx-auto lg:mx-0">
              <div className="text-center">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-6 h-6 text-warning" />
                </div>
                <p className="text-sm text-muted-foreground">50+ Lessons</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-6 h-6 text-success" />
                </div>
                <p className="text-sm text-muted-foreground">15 Min/Day</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center lg:justify-end">
            <Card className="p-8 bg-background/95 backdrop-blur-sm border-2 border-primary/20 shadow-strong">
              <div className="text-center">
                <img 
                  src={raccoonMascot} 
                  alt="Raccoon mascot" 
                  className="w-40 h-40 mx-auto mb-6 drop-shadow-lg" 
                />
                <h3 className="text-2xl font-bold mb-3">Meet Raccoonie!</h3>
                <p className="text-muted-foreground mb-6">
                  Your Bulgarian learning companion. I'll guide you through every lesson 
                  and celebrate your progress!
                </p>
                <div className="bg-gradient-primary rounded-lg p-4 text-primary-foreground">
                  <p className="font-medium">💬 "Здравей! Ready to start?"</p>
                  <p className="text-sm opacity-90 mt-1">(Hello! Ready to start?)</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};