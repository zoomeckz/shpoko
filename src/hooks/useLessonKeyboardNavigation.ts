import { useEffect, useCallback } from "react";

interface UseLessonKeyboardNavigationProps {
  isAnswered: boolean;
  onNext: () => void;
  disabled?: boolean;
}

export const useLessonKeyboardNavigation = ({
  isAnswered,
  onNext,
  disabled = false,
}: UseLessonKeyboardNavigationProps) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      if (!isAnswered) return;
      
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onNext();
      }
    },
    [isAnswered, onNext, disabled]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};
