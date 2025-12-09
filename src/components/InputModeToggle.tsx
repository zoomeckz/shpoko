import { Button } from "@/components/ui/button";
import { useInputMode } from "@/contexts/InputModeContext";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";

export const InputModeToggle = () => {
  const { inputMode, toggleInputMode } = useInputMode();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleInputMode}
      className={cn(
        "gap-2",
        inputMode === "bulgarian" && "bg-primary/10 border-primary"
      )}
    >
      <Languages className="w-4 h-4" />
      {inputMode === "romanized" ? "ABC" : "АБВ"}
    </Button>
  );
};
