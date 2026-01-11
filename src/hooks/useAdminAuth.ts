import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Admin email - only this email can access admin panel
const ADMIN_EMAIL = "sam.nowroozi@gmail.com";

export function useAdminAuth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (loading) return;
      
      if (!user) {
        setIsAdmin(false);
        setIsChecking(false);
        navigate("/auth");
        return;
      }

      // Check if user email matches admin email
      const isAdminUser = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      
      // Also check the user_roles table for admin role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      const hasAdminRole = !!roleData;
      
      if (isAdminUser || hasAdminRole) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        navigate("/");
      }
      
      setIsChecking(false);
    };

    checkAdmin();
  }, [user, loading, navigate]);

  return { isAdmin, isChecking, user };
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
