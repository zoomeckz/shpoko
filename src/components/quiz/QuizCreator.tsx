import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, Save, ArrowLeft, BookOpen, Shuffle, Keyboard, MousePointer, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { VocabularyBrowser } from "./VocabularyBrowser";
import { VocabWord } from "@/data/vocabularyList";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "vocabulary", label: "Vocabulary" },
  { value: "grammar", label: "Grammar" },
  { value: "verbs", label: "Verbs" },
  { value: "phrases", label: "Phrases" },
  { value: "culture", label: "Culture" },
];

const LANGUAGES = [
  { value: "english", label: "English", flag: "🇬🇧" },
  { value: "swedish", label: "Svenska", flag: "🇸🇪" },
  { value: "dutch", label: "Nederlands", flag: "🇳🇱" },
  { value: "tunisian", label: "تونسي", flag: "🇹🇳" },
  { value: "bulgarian", label: "Български", flag: "🇧🇬" },
  { value: "greek", label: "Ελληνικά", flag: "🇬🇷" },
  { value: "russian", label: "Русский", flag: "🇷🇺" },
  { value: "ukrainian", label: "Українська", flag: "🇺🇦" },
  { value: "italian", label: "Italiano", flag: "🇮🇹" },
  { value: "polish", label: "Polski", flag: "🇵🇱" },
];

const ANSWER_MODES = [
  { value: "choose", label: "Multiple Choice", icon: MousePointer, description: "Select from options" },
  { value: "type", label: "Type Answer", icon: Keyboard, description: "Type the answer" },
  { value: "random", label: "Random Mix", icon: Shuffle, description: "Mix of both styles" },
];

interface Question {
  id?: string;
  question_text: string;
  question_type: "choose_word" | "fill_blank";
  correct_answer: string;
  options: string[];
  order_index: number;
}

interface QuizCreatorProps {
  onBack: () => void;
  editQuizId?: string;
}

export const QuizCreator = ({ onBack, editQuizId }: QuizCreatorProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [language, setLanguage] = useState("bulgarian");
  const [isPublic, setIsPublic] = useState(false);
  const [isTimed, setIsTimed] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [answerMode, setAnswerMode] = useState<"choose" | "type" | "random">("random");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!editQuizId);
  
  // Vocabulary browser state
  const [selectedWords, setSelectedWords] = useState<VocabWord[]>([]);
  const [creationMode, setCreationMode] = useState<"vocab" | "manual">("vocab");
  const [customWordIdCounter, setCustomWordIdCounter] = useState(1000);

  useEffect(() => {
    if (editQuizId) {
      loadQuizForEditing();
    }
  }, [editQuizId]);

  const loadQuizForEditing = async () => {
    try {
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", editQuizId)
        .single();

      if (quizError) throw quizError;

      setTitle(quiz.title);
      setDescription(quiz.description || "");
      setCategory((quiz as any).category || "general");
      setLanguage((quiz as any).language || "english");
      setIsPublic(quiz.is_public);
      setIsTimed(quiz.is_timed);
      setTimeLimit(quiz.time_limit_seconds || 60);
      setCreationMode("manual");

      const { data: questionsData, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", editQuizId)
        .order("order_index");

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);
    } catch (error: any) {
      toast.error("Failed to load quiz for editing");
      onBack();
    } finally {
      setLoading(false);
    }
  };

  // Generate questions from selected vocabulary
  const generateQuestionsFromVocab = () => {
    if (selectedWords.length === 0) {
      toast.error("Please select at least one word");
      return;
    }

    const newQuestions: Question[] = selectedWords.map((word, index) => {
      // Determine question type based on answer mode
      let questionType: "choose_word" | "fill_blank";
      if (answerMode === "type") {
        questionType = "fill_blank";
      } else if (answerMode === "choose") {
        questionType = "choose_word";
      } else {
        questionType = Math.random() > 0.5 ? "choose_word" : "fill_blank";
      }

      // Generate distractors for multiple choice
      const otherWords = selectedWords.filter(w => w.id !== word.id);
      const distractors = otherWords
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.translation);
      
      // Add correct answer and shuffle options
      const options = [...distractors, word.translation].sort(() => Math.random() - 0.5);

      return {
        question_text: `What does "${word.word}" (${word.romanization}) mean? ${word.emoji}`,
        question_type: questionType,
        correct_answer: word.translation,
        options: questionType === "choose_word" ? options : [],
        order_index: index,
      };
    });

    setQuestions(newQuestions);
    setCreationMode("manual");
    toast.success(`Generated ${newQuestions.length} questions from vocabulary`);
  };

  const handleWordSelect = (word: VocabWord) => {
    setSelectedWords(prev => [...prev, word]);
  };

  const handleWordRemove = (wordId: string) => {
    setSelectedWords(prev => prev.filter(w => w.id !== wordId));
  };

  const handleAddCustomWord = (word: Omit<VocabWord, "id">) => {
    const newWord: VocabWord = {
      ...word,
      id: `custom_${customWordIdCounter}`,
    };
    setCustomWordIdCounter(prev => prev + 1);
    setSelectedWords(prev => [...prev, newWord]);
  };

  const addQuestion = () => {
    const questionType = answerMode === "type" 
      ? "fill_blank" 
      : answerMode === "choose" 
        ? "choose_word" 
        : Math.random() > 0.5 ? "choose_word" : "fill_blank";

    setQuestions([
      ...questions,
      {
        question_text: "",
        question_type: questionType,
        correct_answer: "",
        options: ["", "", "", ""],
        order_index: questions.length,
      },
    ]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    const newOptions = [...updated[questionIndex].options];
    newOptions[optionIndex] = value;
    updated[questionIndex].options = newOptions;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const saveQuiz = async () => {
    if (!user) return;
    if (!title.trim()) {
      toast.error("Please enter a quiz title");
      return;
    }
    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        toast.error(`Question ${i + 1} is missing text`);
        return;
      }
      if (!q.correct_answer.trim()) {
        toast.error(`Question ${i + 1} is missing correct answer`);
        return;
      }
      if (q.question_type === "choose_word" && q.options.filter(o => o.trim()).length < 2) {
        toast.error(`Question ${i + 1} needs at least 2 options`);
        return;
      }
    }

    setSaving(true);
    try {
      if (editQuizId) {
        // Update existing quiz
        const { error: quizError } = await supabase
          .from("quizzes")
          .update({
            title: title.trim(),
            description: description.trim() || null,
            category,
            language,
            is_public: isPublic,
            is_timed: isTimed,
            time_limit_seconds: isTimed ? timeLimit : null,
          })
          .eq("id", editQuizId);

        if (quizError) throw quizError;

        // Delete existing questions and re-insert
        await supabase.from("quiz_questions").delete().eq("quiz_id", editQuizId);

        const questionsToInsert = questions.map((q, idx) => ({
          quiz_id: editQuizId,
          question_text: q.question_text.trim(),
          question_type: q.question_type,
          correct_answer: q.correct_answer.trim(),
          options: q.question_type === "choose_word" ? q.options.filter(o => o.trim()) : [],
          order_index: idx,
        }));

        const { error: questionsError } = await supabase
          .from("quiz_questions")
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;

        toast.success("Quiz updated successfully!");
      } else {
        // Create new quiz
        const { data: quiz, error: quizError } = await supabase
          .from("quizzes")
          .insert({
            creator_id: user.id,
            title: title.trim(),
            description: description.trim() || null,
            category,
            language,
            is_public: isPublic,
            is_timed: isTimed,
            time_limit_seconds: isTimed ? timeLimit : null,
          })
          .select()
          .single();

        if (quizError) throw quizError;

        const questionsToInsert = questions.map((q, idx) => ({
          quiz_id: quiz.id,
          question_text: q.question_text.trim(),
          question_type: q.question_type,
          correct_answer: q.correct_answer.trim(),
          options: q.question_type === "choose_word" ? q.options.filter(o => o.trim()) : [],
          order_index: idx,
        }));

        const { error: questionsError } = await supabase
          .from("quiz_questions")
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;

        toast.success("Quiz created successfully!");
      }
      onBack();
    } catch (error: any) {
      toast.error(error.message || "Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl font-bold">{editQuizId ? "Edit Quiz" : "Create Quiz"}</h2>
      </div>

      {/* Creation Mode Tabs */}
      {!editQuizId && (
        <Tabs value={creationMode} onValueChange={(v) => setCreationMode(v as any)}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="vocab" className="gap-2">
              <BookOpen className="w-4 h-4" />
              From Vocabulary
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2">
              <ListChecks className="w-4 h-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Quiz Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Settings</CardTitle>
          <CardDescription>Configure how your quiz will work</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title..."
            />
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your quiz..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">Quiz Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.flag} {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Answer Mode Selection */}
          <div className="space-y-3">
            <Label>Answer Mode</Label>
            <RadioGroup
              value={answerMode}
              onValueChange={(v) => setAnswerMode(v as any)}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              {ANSWER_MODES.map((mode) => (
                <motion.div
                  key={mode.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Label
                    htmlFor={mode.value}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      answerMode === mode.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={mode.value} id={mode.value} className="sr-only" />
                    <mode.icon className={`w-6 h-6 ${answerMode === mode.value ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-medium text-sm">{mode.label}</span>
                    <span className="text-xs text-muted-foreground text-center">{mode.description}</span>
                  </Label>
                </motion.div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Public Quiz</Label>
              <p className="text-sm text-muted-foreground">Allow others to play your quiz</p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Timed Quiz</Label>
              <p className="text-sm text-muted-foreground">Add a time limit per question</p>
            </div>
            <Switch checked={isTimed} onCheckedChange={setIsTimed} />
          </div>

          {isTimed && (
            <div>
              <Label htmlFor="timeLimit">Time per question (seconds)</Label>
              <Input
                id="timeLimit"
                type="number"
                min={10}
                max={300}
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 60)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vocabulary Browser or Manual Questions */}
      <AnimatePresence mode="wait">
        {creationMode === "vocab" && !editQuizId ? (
          <motion.div
            key="vocab"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <VocabularyBrowser
              selectedWords={selectedWords}
              onWordSelect={handleWordSelect}
              onWordRemove={handleWordRemove}
              onAddCustomWord={handleAddCustomWord}
              maxWords={50}
            />
            
            {selectedWords.length > 0 && (
              <Button 
                onClick={generateQuestionsFromVocab} 
                className="w-full" 
                size="lg"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Generate {selectedWords.length} Questions
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="manual"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Questions ({questions.length})</CardTitle>
                  <CardDescription>Add and customize your quiz questions</CardDescription>
                </div>
                <Button onClick={addQuestion} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.length === 0 ? (
                  <div className="text-center py-8 space-y-4">
                    <p className="text-muted-foreground">
                      No questions yet. Click "Add Question" to start or switch to vocabulary mode.
                    </p>
                    <Button onClick={addQuestion} variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                ) : (
                  <>
                    {questions.map((question, qIndex) => (
                      <motion.div
                        key={qIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: qIndex * 0.05 }}
                      >
                        <Card className="border-2">
                          <CardContent className="pt-4 space-y-4">
                            <div className="flex items-start justify-between">
                              <Badge variant="secondary" className="text-lg px-3 py-1">
                                Q{qIndex + 1}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeQuestion(qIndex)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div>
                              <Label>Question Type</Label>
                              <Select
                                value={question.question_type}
                                onValueChange={(v) => updateQuestion(qIndex, "question_type", v)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="choose_word">
                                    <div className="flex items-center gap-2">
                                      <MousePointer className="w-4 h-4" />
                                      Choose the correct word
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="fill_blank">
                                    <div className="flex items-center gap-2">
                                      <Keyboard className="w-4 h-4" />
                                      Type the answer
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Question Text</Label>
                              {question.question_type === "fill_blank" && (
                                <p className="text-xs text-muted-foreground mb-1">
                                  Use <code className="bg-muted px-1 rounded">x</code> to mark blanks.
                                </p>
                              )}
                              <Input
                                value={question.question_text}
                                onChange={(e) => updateQuestion(qIndex, "question_text", e.target.value)}
                                placeholder={
                                  question.question_type === "fill_blank"
                                    ? "Enter sentence with x for blanks..."
                                    : "Enter your question..."
                                }
                              />
                            </div>

                            <div>
                              <Label>Correct Answer</Label>
                              <Input
                                value={question.correct_answer}
                                onChange={(e) => updateQuestion(qIndex, "correct_answer", e.target.value)}
                                placeholder="Enter the correct answer..."
                              />
                            </div>

                            {question.question_type === "choose_word" && (
                              <div className="space-y-2">
                                <Label>Options (include the correct answer)</Label>
                                <div className="grid grid-cols-2 gap-2">
                                  {question.options.map((option, oIndex) => (
                                    <Input
                                      key={oIndex}
                                      value={option}
                                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                      placeholder={`Option ${oIndex + 1}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}

                    <Button onClick={addQuestion} variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Button */}
      {(creationMode === "manual" || editQuizId || questions.length > 0) && (
        <Button onClick={saveQuiz} disabled={saving} className="w-full" size="lg">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : editQuizId ? "Update Quiz" : "Save Quiz"}
        </Button>
      )}
    </div>
  );
};
