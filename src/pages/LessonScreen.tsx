import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LessonProgressBar } from "@/components/lesson/LessonProgressBar";
import { MultipleChoiceQuestion } from "@/components/lesson/MultipleChoiceQuestion";
import { TranslationQuestion } from "@/components/lesson/TranslationQuestion";
import { FillBlankQuestion } from "@/components/lesson/FillBlankQuestion";
import { MatchingPairsQuestion } from "@/components/lesson/MatchingPairsQuestion";
import { FeedbackBar } from "@/components/lesson/FeedbackBar";
import { LessonComplete } from "@/components/lesson/LessonComplete";
import { RaccoonMascot } from "@/components/lesson/RaccoonMascot";
import { useDuolingoSounds } from "@/hooks/useDuolingoSounds";
import { useAuth } from "@/contexts/AuthContext";

// Sample lesson data
const sampleQuestions = [
  {
    type: "multiple_choice",
    question: "What does 'Здравей' mean?",
    options: ["Goodbye", "Hello", "Thank you", "Please"],
    correctAnswer: "Hello",
  },
  {
    type: "translation",
    sourceText: "Добро утро",
    sourceLanguage: "Bulgarian",
    targetLanguage: "English",
    correctAnswers: ["Good morning", "good morning"],
  },
  {
    type: "fill_blank",
    sentence: "Как се ___ ?",
    options: ["казваш", "обичам", "ядеш", "пиеш"],
    correctAnswer: "казваш",
  },
  {
    type: "multiple_choice",
    question: "Select the correct translation for 'Thank you'",
    options: ["Моля", "Благодаря", "Извинете", "Довиждане"],
    correctAnswer: "Благодаря",
  },
  {
    type: "translation",
    sourceText: "Аз съм добре",
    sourceLanguage: "Bulgarian",
    targetLanguage: "English",
    correctAnswers: ["I am fine", "I'm fine", "i am fine", "im fine"],
  },
  {
    type: "multiple_choice",
    question: "What is 'Goodbye' in Bulgarian?",
    options: ["Здравей", "Благодаря", "Довиждане", "Моля"],
    correctAnswer: "Довиждане",
  },
  {
    type: "fill_blank",
    sentence: "Аз ___ българин.",
    options: ["съм", "е", "сме", "са"],
    correctAnswer: "съм",
  },
  {
    type: "matching",
    pairs: [
      { left: "Да", right: "Yes" },
      { left: "Не", right: "No" },
      { left: "Моля", right: "Please" },
      { left: "Извинете", right: "Excuse me" },
    ],
  },
  {
    type: "multiple_choice",
    question: "How do you say 'My name is...' in Bulgarian?",
    options: ["Аз съм...", "Казвам се...", "Обичам...", "Искам..."],
    correctAnswer: "Казвам се...",
  },
  {
    type: "translation",
    sourceText: "Лека нощ",
    sourceLanguage: "Bulgarian",
    targetLanguage: "English",
    correctAnswers: ["Good night", "good night", "Goodnight", "goodnight"],
  },
];

export default function LessonScreen() {
  const navigate = useNavigate();
  const { updateXP } = useAuth();
  const { playCorrect, playIncorrect, playComplete, playHeartLost } = useDuolingoSounds();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState("");
  const [showComplete, setShowComplete] = useState(false);
  const [raccoonMood, setRaccoonMood] = useState<"neutral" | "happy" | "sad" | "celebrating">("neutral");

  const currentQuestion = sampleQuestions[currentIndex];
  const totalQuestions = sampleQuestions.length;
  const xpPerQuestion = 10;

  const handleAnswer = (isCorrect: boolean, answer?: string) => {
    setLastAnswerCorrect(isCorrect);
    setShowFeedback(true);

    if (isCorrect) {
      playCorrect();
      setCorrectAnswers(prev => prev + 1);
      setRaccoonMood("happy");
    } else {
      playIncorrect();
      setHearts(prev => Math.max(0, prev - 1));
      playHeartLost();
      setRaccoonMood("sad");
      
      // Set correct answer for feedback
      if (currentQuestion.type === "multiple_choice") {
        setLastCorrectAnswer(currentQuestion.correctAnswer);
      } else if (currentQuestion.type === "translation") {
        setLastCorrectAnswer(currentQuestion.correctAnswers[0]);
      } else if (currentQuestion.type === "fill_blank") {
        setLastCorrectAnswer(currentQuestion.correctAnswer);
      }
    }

    // Check for game over
    if (!isCorrect && hearts <= 1) {
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setRaccoonMood("neutral");

    if (currentIndex + 1 >= totalQuestions) {
      // Lesson complete
      playComplete();
      setRaccoonMood("celebrating");
      setShowComplete(true);
      
      // Award XP
      const earnedXP = correctAnswers * xpPerQuestion;
      updateXP(earnedXP);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleLessonComplete = () => {
    navigate("/");
  };

  const handleClose = () => {
    navigate("/");
  };

  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const xpEarned = correctAnswers * xpPerQuestion;

  if (showComplete) {
    return (
      <LessonComplete
        xpEarned={xpEarned}
        accuracy={accuracy}
        totalQuestions={totalQuestions}
        correctAnswers={correctAnswers}
        onContinue={handleLessonComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LessonProgressBar
        current={currentIndex + 1}
        total={totalQuestions}
        hearts={hearts}
        onClose={handleClose}
      />

      <main className="flex-1 flex">
        {/* Raccoon sidebar - hidden on mobile */}
        <div className="hidden lg:flex w-48 items-center justify-center border-r border-border">
          <RaccoonMascot 
            mood={raccoonMood} 
            size="lg"
            showBubble={raccoonMood !== "neutral"}
            bubbleText={
              raccoonMood === "happy" ? "Great! 🎉" :
              raccoonMood === "sad" ? "Try again! 💪" :
              raccoonMood === "celebrating" ? "Amazing! 🌟" : ""
            }
          />
        </div>

        {/* Question area */}
        <div className="flex-1 max-w-3xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentQuestion.type === "multiple_choice" && (
                <MultipleChoiceQuestion
                  question={currentQuestion.question}
                  options={currentQuestion.options}
                  correctAnswer={currentQuestion.correctAnswer}
                  onAnswer={handleAnswer}
                />
              )}

              {currentQuestion.type === "translation" && (
                <TranslationQuestion
                  sourceText={currentQuestion.sourceText}
                  sourceLanguage={currentQuestion.sourceLanguage}
                  targetLanguage={currentQuestion.targetLanguage}
                  correctAnswers={currentQuestion.correctAnswers}
                  onAnswer={handleAnswer}
                />
              )}

              {currentQuestion.type === "fill_blank" && (
                <FillBlankQuestion
                  sentence={currentQuestion.sentence}
                  options={currentQuestion.options}
                  correctAnswer={currentQuestion.correctAnswer}
                  onAnswer={handleAnswer}
                />
              )}

              {currentQuestion.type === "matching" && (
                <MatchingPairsQuestion
                  pairs={currentQuestion.pairs}
                  onAnswer={handleAnswer}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Feedback bar */}
      <AnimatePresence>
        {showFeedback && (
          <FeedbackBar
            isCorrect={lastAnswerCorrect}
            correctAnswer={!lastAnswerCorrect ? lastCorrectAnswer : undefined}
            onContinue={handleContinue}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
