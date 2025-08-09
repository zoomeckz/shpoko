import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { LessonCard } from "@/components/LessonCard";
import { lessons, getUserStats } from "@/data/lessons";

const Index = () => {
  const userStats = getUserStats();

  return (
    <div className="min-h-screen bg-background">
      <Header {...userStats} />
      
      <main>
        <HeroSection />
        
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
                  onClick={() => console.log(`Starting lesson: ${lesson.title}`)}
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
