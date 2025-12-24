import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, BookOpen, Lightbulb, MessageCircle, Users } from "lucide-react";
import { useForum, ForumCategory } from "@/hooks/useForum";
import { Header } from "@/components/Header";

const iconMap: Record<string, React.ElementType> = {
  "message-square": MessageSquare,
  "book-open": BookOpen,
  "lightbulb": Lightbulb,
  "message-circle": MessageCircle,
};

const Forum = () => {
  const navigate = useNavigate();
  const { categories, loading } = useForum();
  const { profile } = useAuth();

  const getCategoryIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || MessageSquare;
    return <Icon className="w-6 h-6" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header streak={profile?.streak || 0} hearts={5} xp={profile?.xp || 0} dailyGoalProgress={50} />
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Community Forum</h1>
            <p className="text-sm text-muted-foreground">Discuss and learn together</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading categories...</div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(`/forum/${category.id}`)}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    {getCategoryIcon(category.icon)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{category.language}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Forum;
