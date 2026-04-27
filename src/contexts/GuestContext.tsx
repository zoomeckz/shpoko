import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface GuestLessonRecord {
  score: number;
  completedAt: string;
}

interface GuestState {
  isGuest: boolean;
  guestId: string | null;
  guestUsername: string;
  lessonsCompleted: number;
  level: number;
  xp: number;
  /** Per-lesson completion record so we can transfer to user_progress on signup. */
  completedLessons: Record<string, GuestLessonRecord>;
  onboardingCompleted: boolean;
  isLocked: boolean;
  declinedRegistration: boolean;
}

interface GuestContextType extends GuestState {
  initGuest: () => void;
  incrementLessons: () => void;
  addXP: (amount: number) => void;
  markLessonCompleted: (lessonId: string, score: number) => void;
  isGuestLessonCompleted: (lessonId: string) => boolean;
  completeOnboarding: () => void;
  declineRegistration: () => void;
  clearGuest: () => void;
  shouldShowRegistrationPrompt: () => boolean;
  getProgressForTransfer: () => {
    xp: number;
    level: number;
    lessonsCompleted: number;
    completedLessons: Record<string, GuestLessonRecord>;
  };
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

const STORAGE_KEY = "shpoko_guest_state";

// Generate a random guest username
const generateGuestUsername = () => {
  const adjectives = ["Happy", "Clever", "Swift", "Brave", "Curious", "Eager", "Bright", "Quick"];
  const nouns = ["Raccoon", "Learner", "Explorer", "Student", "Reader", "Traveler"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 999) + 1;
  return `${adj}${noun}${num}`;
};

// Calculate level from XP
const calculateLevel = (xp: number): number => {
  // Every 100 XP = 1 level
  return Math.floor(xp / 100) + 1;
};

export const useGuest = () => {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error("useGuest must be used within a GuestProvider");
  }
  return context;
};

export const GuestProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GuestState>({
    isGuest: false,
    guestId: null,
    guestUsername: "",
    lessonsCompleted: 0,
    level: 1,
    xp: 0,
    completedLessons: {},
    onboardingCompleted: false,
    isLocked: false,
    declinedRegistration: false,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Defensive merge so older stored shapes still load.
        setState((prev) => ({
          ...prev,
          ...parsed,
          completedLessons: parsed.completedLessons ?? {},
        }));
      } catch (e) {
        console.error("Failed to parse guest state:", e);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (state.isGuest) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const initGuest = () => {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const guestUsername = generateGuestUsername();
    setState({
      isGuest: true,
      guestId,
      guestUsername,
      lessonsCompleted: 0,
      level: 1,
      xp: 0,
      completedLessons: {},
      onboardingCompleted: false,
      isLocked: false,
      declinedRegistration: false,
    });
  };

  const incrementLessons = () => {
    setState((prev) => ({
      ...prev,
      lessonsCompleted: prev.lessonsCompleted + 1,
    }));
  };

  const addXP = (amount: number) => {
    setState((prev) => {
      const newXP = prev.xp + amount;
      const newLevel = calculateLevel(newXP);
      return {
        ...prev,
        xp: newXP,
        level: newLevel,
      };
    });
  };

  const markLessonCompleted = (lessonId: string, score: number) => {
    if (!lessonId) return;
    setState((prev) => {
      const existing = prev.completedLessons[lessonId];
      // Keep the higher score if the lesson is being revised.
      const bestScore = existing ? Math.max(existing.score, score) : score;
      return {
        ...prev,
        completedLessons: {
          ...prev.completedLessons,
          [lessonId]: {
            score: bestScore,
            completedAt: existing?.completedAt ?? new Date().toISOString(),
          },
        },
      };
    });
  };

  const isGuestLessonCompleted = (lessonId: string): boolean => {
    return !!state.completedLessons[lessonId];
  };

  const completeOnboarding = () => {
    setState((prev) => ({
      ...prev,
      onboardingCompleted: true,
    }));
  };

  const declineRegistration = () => {
    setState((prev) => ({
      ...prev,
      declinedRegistration: true,
      isLocked: true,
    }));
  };

  const clearGuest = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      isGuest: false,
      guestId: null,
      guestUsername: "",
      lessonsCompleted: 0,
      level: 1,
      xp: 0,
      completedLessons: {},
      onboardingCompleted: false,
      isLocked: false,
      declinedRegistration: false,
    });
  };

  const shouldShowRegistrationPrompt = () => {
    if (state.declinedRegistration) return false;
    // Show prompt after 3 lessons OR reaching level 5
    return state.lessonsCompleted >= 3 || state.level >= 5;
  };

  const getProgressForTransfer = () => {
    return {
      xp: state.xp,
      level: state.level,
      lessonsCompleted: state.lessonsCompleted,
      completedLessons: state.completedLessons,
    };
  };

  return (
    <GuestContext.Provider
      value={{
        ...state,
        initGuest,
        incrementLessons,
        addXP,
        markLessonCompleted,
        isGuestLessonCompleted,
        completeOnboarding,
        declineRegistration,
        clearGuest,
        shouldShowRegistrationPrompt,
        getProgressForTransfer,
      }}
    >
      {children}
    </GuestContext.Provider>
  );
};
