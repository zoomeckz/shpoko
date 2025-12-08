import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { LessonCard } from "@/components/LessonCard";
import { WordOfTheDay } from "@/components/WordOfTheDay";
import { lessons, getUserStats } from "@/data/lessons";
import { useNavigate } from "react-router-dom";

const lessonRoutes: Record<string, string> = {
  "1": "/lesson/cyrillic",
  "2": "/lesson/greetings",
  "3": "/lesson/numbers",
};

const Index = () => {
  const userStats = getUserStats();
  const navigate = useNavigate();

  const handleLessonClick = (lessonId: string) => {
    const route = lessonRoutes[lessonId];
    if (route) {
      navigate(route);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header {...userStats} />
      
      <main>
        <HeroSection />
        
        <WordOfTheDay />
        
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Your Learning Path</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Progress through carefully crafted lessons designed to build your Bulgarian skills step by step.
                Each lesson is designed to be completed in just 15 minutes!
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  title={lesson.title}
                  description={lesson.description}
                  level={lesson.level}
                  xpReward={lesson.xpReward}
                  progress={lesson.progress}
                  status={lesson.status}
                  difficulty={lesson.difficulty}
                  onClick={() => handleLessonClick(lesson.id)}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
