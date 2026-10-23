import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { loadMistakes, type Mistake } from "@/lib/mistakes";

/** The learner's mistakes (account or this browser), reloaded when they log in or out. */
export const useMistakes = () => {
  const { user, loading: authLoading } = useAuth();
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const list = await loadMistakes(user?.id ?? null);
    setMistakes(list);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading) reload();
  }, [authLoading, reload]);

  return { mistakes, count: mistakes.length, loading, reload };
};
