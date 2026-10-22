import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminEmail } from "@/hooks/useAdminAuth";

const STORAGE_KEY = "shpoko-unlock-all";

/**
 * Owner-only switch that opens every lesson for previewing, regardless of
 * progress. Only shown to the site owner's account (see isAdminEmail).
 * It only affects what this browser shows; it grants no extra permissions.
 */
export const useUnlockAll = () => {
  const { user } = useAuth();
  const isOwner = isAdminEmail(user?.email);
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      // Storage can be unavailable (private mode); the switch just won't persist.
    }
  }, [enabled]);

  return { isOwner, unlockAll: isOwner && enabled, setUnlockAll: setEnabled };
};
