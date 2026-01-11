import { ReactNode } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Loader2, Shield } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { isAdmin, isChecking } = useAdminAuth();

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <Shield className="w-16 h-16 text-destructive" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You do not have permission to access this area.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <main className="flex-1 overflow-hidden">
          <header className="h-14 border-b flex items-center px-4 gap-4 bg-card">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-semibold">{title}</h1>
            </div>
          </header>
          <div className="p-6 overflow-y-auto h-[calc(100vh-3.5rem)]">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
