import { useState, createContext, useContext, ReactNode } from "react";

type InputMode = "romanized" | "bulgarian";

interface InputModeContextType {
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  toggleInputMode: () => void;
}

const InputModeContext = createContext<InputModeContextType | undefined>(undefined);

export const useInputMode = () => {
  const context = useContext(InputModeContext);
  if (!context) {
    throw new Error("useInputMode must be used within an InputModeProvider");
  }
  return context;
};

export const InputModeProvider = ({ children }: { children: ReactNode }) => {
  const [inputMode, setInputMode] = useState<InputMode>(() => {
    const stored = localStorage.getItem("shpoko_input_mode");
    return (stored as InputMode) || "romanized";
  });

  const handleSetInputMode = (mode: InputMode) => {
    setInputMode(mode);
    localStorage.setItem("shpoko_input_mode", mode);
  };

  const toggleInputMode = () => {
    const newMode = inputMode === "romanized" ? "bulgarian" : "romanized";
    handleSetInputMode(newMode);
  };

  return (
    <InputModeContext.Provider value={{ inputMode, setInputMode: handleSetInputMode, toggleInputMode }}>
      {children}
    </InputModeContext.Provider>
  );
};
