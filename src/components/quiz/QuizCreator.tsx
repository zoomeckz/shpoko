import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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
  const [isPublic, setIsPublic] = useState(false);
  const [isTimed, setIsTimed] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        question_type: "choose_word",
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
      // Create quiz
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          creator_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          is_public: isPublic,
          is_timed: isTimed,
          time_limit_seconds: isTimed ? timeLimit : null,
        })
        .select()
        .single();

      if (quizError) throw quizError;

      // Create questions
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
      onBack();
    } catch (error: any) {
      toast.error(error.message || "Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl font-bold">Create Quiz</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Settings</CardTitle>
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Questions ({questions.length})</CardTitle>
          <Button onClick={addQuestion} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No questions yet. Click "Add Question" to start.
            </p>
          ) : (
            questions.map((question, qIndex) => (
              <Card key={qIndex} className="border-2">
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-lg">Q{qIndex + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-destructive"
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
                        <SelectItem value="choose_word">Choose the correct word</SelectItem>
                        <SelectItem value="fill_blank">Fill in the blank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Question Text</Label>
                    <Input
                      value={question.question_text}
                      onChange={(e) => updateQuestion(qIndex, "question_text", e.target.value)}
                      placeholder="Enter your question..."
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
                      {question.options.map((option, oIndex) => (
                        <Input
                          key={oIndex}
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Button onClick={saveQuiz} disabled={saving} className="w-full" size="lg">
        <Save className="w-4 h-4 mr-2" />
        {saving ? "Saving..." : "Save Quiz"}
      </Button>
    </div>
  );
};
