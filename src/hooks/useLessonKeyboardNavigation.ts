import { useEffect, useCallback, useRef } from "react";

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
  // Track when isAnswered changed to prevent immediate advancement
  const wasAnsweredRef = useRef(isAnswered);
  const canAdvanceRef = useRef(false);

  useEffect(() => {
    // When isAnswered becomes true, wait for next keyup before allowing advance
    if (isAnswered && !wasAnsweredRef.current) {
      canAdvanceRef.current = false;
      const enableAdvance = () => {
        canAdvanceRef.current = true;
        window.removeEventListener("keyup", enableAdvance);
      };
      window.addEventListener("keyup", enableAdvance);
    }
    wasAnsweredRef.current = isAnswered;
  }, [isAnswered]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      if (!isAnswered) return;
      if (!canAdvanceRef.current) return;
      
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
