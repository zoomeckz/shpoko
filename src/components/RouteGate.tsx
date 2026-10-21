import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isLive } from "@/config/features";

// Sends visitors of hidden (not yet rebuilt) pages back to the start.
export function RouteGate({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  if (!isLive(pathname)) {
    // Hidden admin tools fall back to the admin overview.
    return <Navigate to={pathname.startsWith("/admin") ? "/admin" : "/"} replace />;
  }
  return <>{children}</>;
}
