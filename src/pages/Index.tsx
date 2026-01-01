import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/duolingo/Sidebar";
import { TopBar } from "@/components/duolingo/TopBar";
import { LessonPath } from "@/components/duolingo/LessonPath";
import { RightSidebar } from "@/components/duolingo/RightSidebar";
import { ShpokoGreetingCard } from "@/components/duolingo/ShpokoGreetingCard";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top bar */}
      <TopBar />
      
      <div className="flex">
        {/* Left sidebar - hidden on mobile */}
        <Sidebar />
        
        {/* Main content - lesson path */}
        <main className="flex-1 lg:ml-0 pb-20 lg:pb-0">
          <div className="max-w-lg mx-auto px-4">
            <LessonPath />
          </div>
        </main>
        
        {/* Right sidebar - hidden on mobile */}
        <RightSidebar />
      </div>
    </div>
  );
};

export default Index;
