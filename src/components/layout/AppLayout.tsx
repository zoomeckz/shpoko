import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/duolingo/Sidebar";
import { TopBar } from "@/components/duolingo/TopBar";
import { RightSidebar } from "@/components/duolingo/RightSidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  backPath?: string;
  backLabel?: string;
  showRightSidebar?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl" | "full";
}

export function AppLayout({
  children,
  showBackButton = true,
  backPath = "/",
  backLabel = "Back",
  showRightSidebar = false,
  maxWidth = "2xl",
}: AppLayoutProps) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    "6xl": "max-w-6xl",
    full: "w-full",
  }[maxWidth];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top bar */}
      <TopBar />

      <div className="flex">
        {/* Left sidebar - hidden on mobile */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 lg:ml-0 pb-20 lg:pb-0">
          <div className={`${maxWidthClass} mx-auto px-4 py-6`}>
            {showBackButton && (
              <Button
                variant="ghost"
                onClick={() => navigate(backPath)}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {backLabel}
              </Button>
            )}
            {children}
          </div>
        </main>

        {/* Right sidebar - optional */}
        {showRightSidebar && <RightSidebar />}
      </div>
    </div>
  );
}
