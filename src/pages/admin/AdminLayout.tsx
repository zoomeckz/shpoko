import { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, Loader2, Shield, Users } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { cn } from "@/lib/utils";
import { DuoButton } from "@/components/duolingo/DuoButton";
import { Wordmark } from "@/components/landing/Wordmark";
import { DarkModeToggle } from "@/components/DarkModeToggle";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  /** Buttons shown next to the page title. */
  actions?: ReactNode;
}

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users, end: false },
];

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-3 rounded-xl border-2 px-4 py-2.5 text-[15px] font-extrabold uppercase tracking-wide transition-colors",
    isActive ? "border-primary/50 bg-primary/10 text-primary" : "border-transparent text-muted-foreground hover:bg-muted"
  );

export function AdminLayout({ children, title, description, actions }: AdminLayoutProps) {
  const { isAdmin, isChecking } = useAdminAuth();

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="font-bold text-muted-foreground">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Shield className="w-16 h-16 text-error" />
          <h1 className="text-2xl font-extrabold text-foreground">Admins only</h1>
          <p className="font-semibold text-muted-foreground">You don't have access to this area.</p>
          <DuoButton asChild>
            <Link to="/">Back to Shpoko</Link>
          </DuoButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r-2 border-border p-4">
        <Link to="/admin" className="flex items-center gap-2 px-2 py-3 mb-6">
          <Wordmark />
          <span className="rounded-lg bg-primary/15 px-2 py-0.5 text-xs font-extrabold uppercase tracking-widest text-primary">
            Admin
          </span>
        </Link>

        <nav className="flex-1 space-y-1">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl border-2 border-border px-4 py-2">
            <span className="text-sm font-bold text-muted-foreground">Dark mode</span>
            <DarkModeToggle />
          </div>
          <DuoButton asChild variant="white" fullWidth>
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
              Back to Shpoko
            </Link>
          </DuoButton>
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <header className="lg:hidden sticky top-0 z-40 bg-background border-b-2 border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/admin" className="flex items-center gap-2">
            <Wordmark size="sm" />
            <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-primary">
              Admin
            </span>
          </Link>
          <Link to="/" className="flex items-center gap-1 text-sm font-extrabold uppercase tracking-wide text-primary">
            <ArrowLeft className="w-4 h-4" />
            Back to site
          </Link>
        </div>
        <nav className="flex gap-2 px-4 pb-3">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={(s) => cn(navClass(s), "flex-1 justify-center py-2 text-sm")}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground">{title}</h1>
              {description && <p className="mt-1 font-semibold text-muted-foreground">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
