import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Map, BookOpen, HelpCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RoguelikeMap {
  id: string;
  name: string;
  order_index: number;
  is_boss_map: boolean | null;
  background_image: string | null;
}

interface RoguelikeLesson {
  id: string;
  title: string;
  category: string;
  difficulty: number | null;
}

interface RoguelikeQuestion {
  id: string;
  lesson_id: string;
  question_text: string;
  question_type: string;
  correct_answer: string;
  options: string[] | null;
}

export default function AdminRoguelike() {
  const [maps, setMaps] = useState<RoguelikeMap[]>([]);
  const [lessons, setLessons] = useState<RoguelikeLesson[]>([]);
  const [questions, setQuestions] = useState<RoguelikeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("maps");
  
  // Map dialog
  const [mapDialog, setMapDialog] = useState(false);
  const [editingMap, setEditingMap] = useState<RoguelikeMap | null>(null);
  const [mapForm, setMapForm] = useState({ name: "", order_index: 0, is_boss_map: false, background_image: "" });
  
  // Lesson dialog
  const [lessonDialog, setLessonDialog] = useState(false);
  const [editingLesson, setEditingLesson] = useState<RoguelikeLesson | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: "", category: "", difficulty: 1 });
  
  // Question dialog
  const [questionDialog, setQuestionDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<RoguelikeQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState({ 
    lesson_id: "", 
    question_text: "", 
    question_type: "multiple_choice",
    correct_answer: "",
    options: ""
  });

  const fetchData = async () => {
    setLoading(true);
    const [mapsRes, lessonsRes, questionsRes] = await Promise.all([
      supabase.from("roguelike_maps").select("*").order("order_index"),
      supabase.from("roguelike_lessons").select("*").order("title"),
      supabase.from("roguelike_questions").select("*").order("lesson_id"),
    ]);

    if (mapsRes.data) setMaps(mapsRes.data);
    if (lessonsRes.data) setLessons(lessonsRes.data);
    if (questionsRes.data) setQuestions(questionsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Map CRUD
  const handleSaveMap = async () => {
    if (editingMap) {
      const { error } = await supabase
        .from("roguelike_maps")
        .update({
          name: mapForm.name,
          order_index: mapForm.order_index,
          is_boss_map: mapForm.is_boss_map,
          background_image: mapForm.background_image || null,
        })
        .eq("id", editingMap.id);
      
      if (error) {
        toast.error("Failed to update map");
      } else {
        toast.success("Map updated");
        setMapDialog(false);
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from("roguelike_maps")
        .insert({
          id: crypto.randomUUID(),
          name: mapForm.name,
          order_index: mapForm.order_index,
          is_boss_map: mapForm.is_boss_map,
          background_image: mapForm.background_image || null,
        });
      
      if (error) {
        toast.error("Failed to create map");
      } else {
        toast.success("Map created");
        setMapDialog(false);
        fetchData();
      }
    }
  };

  const handleDeleteMap = async (id: string) => {
    if (!confirm("Delete this map and all its nodes?")) return;
    const { error } = await supabase.from("roguelike_maps").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete map");
    } else {
      toast.success("Map deleted");
      fetchData();
    }
  };

  // Lesson CRUD
  const handleSaveLesson = async () => {
    if (editingLesson) {
      const { error } = await supabase
        .from("roguelike_lessons")
        .update({
          title: lessonForm.title,
          category: lessonForm.category,
          difficulty: lessonForm.difficulty,
        })
        .eq("id", editingLesson.id);
      
      if (error) {
        toast.error("Failed to update lesson");
      } else {
        toast.success("Lesson updated");
        setLessonDialog(false);
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from("roguelike_lessons")
        .insert({
          title: lessonForm.title,
          category: lessonForm.category,
          difficulty: lessonForm.difficulty,
        });
      
      if (error) {
        toast.error("Failed to create lesson");
      } else {
        toast.success("Lesson created");
        setLessonDialog(false);
        fetchData();
      }
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm("Delete this lesson and all its questions?")) return;
    const { error } = await supabase.from("roguelike_lessons").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete lesson");
    } else {
      toast.success("Lesson deleted");
      fetchData();
    }
  };

  // Question CRUD
  const handleSaveQuestion = async () => {
    const options = questionForm.options ? questionForm.options.split(",").map(o => o.trim()) : null;
    
    if (editingQuestion) {
      const { error } = await supabase
        .from("roguelike_questions")
        .update({
          lesson_id: questionForm.lesson_id,
          question_text: questionForm.question_text,
          question_type: questionForm.question_type,
          correct_answer: questionForm.correct_answer,
          options,
        })
        .eq("id", editingQuestion.id);
      
      if (error) {
        toast.error("Failed to update question");
      } else {
        toast.success("Question updated");
        setQuestionDialog(false);
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from("roguelike_questions")
        .insert({
          lesson_id: questionForm.lesson_id,
          question_text: questionForm.question_text,
          question_type: questionForm.question_type,
          correct_answer: questionForm.correct_answer,
          options,
        });
      
      if (error) {
        toast.error("Failed to create question");
      } else {
        toast.success("Question created");
        setQuestionDialog(false);
        fetchData();
      }
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    const { error } = await supabase.from("roguelike_questions").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete question");
    } else {
      toast.success("Question deleted");
      fetchData();
    }
  };

  return (
    <AdminLayout title="Roguelike Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="maps" className="gap-2">
                <Map className="h-4 w-4" /> Maps ({maps.length})
              </TabsTrigger>
              <TabsTrigger value="lessons" className="gap-2">
                <BookOpen className="h-4 w-4" /> Lessons ({lessons.length})
              </TabsTrigger>
              <TabsTrigger value="questions" className="gap-2">
                <HelpCircle className="h-4 w-4" /> Questions ({questions.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="maps">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Maps</CardTitle>
                <Button onClick={() => { setEditingMap(null); setMapForm({ name: "", order_index: maps.length, is_boss_map: false, background_image: "" }); setMapDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Map
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Boss Map</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maps.map((map) => (
                      <TableRow key={map.id}>
                        <TableCell>{map.order_index}</TableCell>
                        <TableCell className="font-medium">{map.name}</TableCell>
                        <TableCell>{map.is_boss_map ? "Yes" : "No"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" onClick={() => { setEditingMap(map); setMapForm({ name: map.name, order_index: map.order_index, is_boss_map: map.is_boss_map || false, background_image: map.background_image || "" }); setMapDialog(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteMap(map.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lessons</CardTitle>
                <Button onClick={() => { setEditingLesson(null); setLessonForm({ title: "", category: "", difficulty: 1 }); setLessonDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Lesson
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lessons.map((lesson) => (
                      <TableRow key={lesson.id}>
                        <TableCell className="font-medium">{lesson.title}</TableCell>
                        <TableCell>{lesson.category}</TableCell>
                        <TableCell>{lesson.difficulty}</TableCell>
                        <TableCell>{questions.filter(q => q.lesson_id === lesson.id).length}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" onClick={() => { setEditingLesson(lesson); setLessonForm({ title: lesson.title, category: lesson.category, difficulty: lesson.difficulty || 1 }); setLessonDialog(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteLesson(lesson.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Questions</CardTitle>
                <Button onClick={() => { setEditingQuestion(null); setQuestionForm({ lesson_id: lessons[0]?.id || "", question_text: "", question_type: "multiple_choice", correct_answer: "", options: "" }); setQuestionDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Question
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lesson</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Answer</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.slice(0, 50).map((question) => (
                      <TableRow key={question.id}>
                        <TableCell>{lessons.find(l => l.id === question.lesson_id)?.title || "Unknown"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{question.question_text}</TableCell>
                        <TableCell>{question.question_type}</TableCell>
                        <TableCell className="max-w-[100px] truncate">{question.correct_answer}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" onClick={() => { setEditingQuestion(question); setQuestionForm({ lesson_id: question.lesson_id, question_text: question.question_text, question_type: question.question_type, correct_answer: question.correct_answer, options: question.options?.join(", ") || "" }); setQuestionDialog(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteQuestion(question.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Map Dialog */}
      <Dialog open={mapDialog} onOpenChange={setMapDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMap ? "Edit Map" : "Add Map"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={mapForm.name} onChange={(e) => setMapForm({ ...mapForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Order Index</Label>
              <Input type="number" value={mapForm.order_index} onChange={(e) => setMapForm({ ...mapForm, order_index: parseInt(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Background Image URL</Label>
              <Input value={mapForm.background_image} onChange={(e) => setMapForm({ ...mapForm, background_image: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMapDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveMap}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialog} onOpenChange={setLessonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Edit Lesson" : "Add Lesson"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={lessonForm.category} onChange={(e) => setLessonForm({ ...lessonForm, category: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Difficulty (1-5)</Label>
              <Input type="number" min={1} max={5} value={lessonForm.difficulty} onChange={(e) => setLessonForm({ ...lessonForm, difficulty: parseInt(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveLesson}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={questionDialog} onOpenChange={setQuestionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit Question" : "Add Question"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Lesson</Label>
              <Select value={questionForm.lesson_id} onValueChange={(v) => setQuestionForm({ ...questionForm, lesson_id: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Question Text</Label>
              <Textarea value={questionForm.question_text} onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={questionForm.question_type} onValueChange={(v) => setQuestionForm({ ...questionForm, question_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="fill_blank">Fill Blank</SelectItem>
                    <SelectItem value="translation">Translation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <Input value={questionForm.correct_answer} onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Options (comma-separated)</Label>
              <Input value={questionForm.options} onChange={(e) => setQuestionForm({ ...questionForm, options: e.target.value })} placeholder="option1, option2, option3, option4" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuestionDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveQuestion}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
