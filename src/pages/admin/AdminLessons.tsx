import { useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen } from "lucide-react";

// Define lesson types based on the app's lesson structure
interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  route: string;
  order_index: number;
}

// Static lessons from the app (these are hardcoded in the app)
const staticLessons = [
  { id: "cyrillic", title: "Cyrillic Basics", category: "alphabet", route: "/lesson/cyrillic", difficulty: 1 },
  { id: "greetings", title: "Greetings", category: "vocabulary", route: "/lesson/greetings", difficulty: 1 },
  { id: "numbers", title: "Numbers", category: "vocabulary", route: "/lesson/numbers", difficulty: 1 },
  { id: "colors", title: "Colors", category: "vocabulary", route: "/topic/colors", difficulty: 1 },
  { id: "shapes", title: "Shapes", category: "vocabulary", route: "/topic/shapes", difficulty: 1 },
  { id: "adjectives", title: "Adjectives", category: "vocabulary", route: "/topic/adjectives", difficulty: 2 },
  { id: "verbs", title: "Verbs", category: "grammar", route: "/topic/verbs", difficulty: 2 },
  { id: "weekdays", title: "Weekdays", category: "vocabulary", route: "/topic/weekdays", difficulty: 1 },
  { id: "food-drinks", title: "Food & Drinks", category: "vocabulary", route: "/topic/food-drinks", difficulty: 2 },
  { id: "restaurant", title: "Restaurant", category: "scenarios", route: "/topic/restaurant", difficulty: 2 },
  { id: "directions", title: "Directions", category: "scenarios", route: "/topic/directions", difficulty: 2 },
  { id: "weather", title: "Weather", category: "vocabulary", route: "/topic/weather", difficulty: 2 },
  { id: "animals", title: "Animals", category: "vocabulary", route: "/topic/animals", difficulty: 1 },
  { id: "jobs", title: "Jobs", category: "vocabulary", route: "/topic/jobs", difficulty: 2 },
  { id: "family", title: "Family", category: "vocabulary", route: "/topic/family", difficulty: 1 },
  { id: "pronouns", title: "Pronouns", category: "grammar", route: "/topic/pronouns", difficulty: 2 },
  { id: "essential-verbs", title: "Essential Verbs", category: "grammar", route: "/topic/essential-verbs", difficulty: 2 },
  { id: "survival-phrases", title: "Survival Phrases", category: "scenarios", route: "/topic/survival-phrases", difficulty: 1 },
  { id: "particles-beginner", title: "Particles (Beginner)", category: "grammar", route: "/topic/particles-beginner", difficulty: 1 },
  { id: "particles-intermediate", title: "Particles (Intermediate)", category: "grammar", route: "/topic/particles-intermediate", difficulty: 2 },
  { id: "particles-advanced", title: "Particles (Advanced)", category: "grammar", route: "/topic/particles-advanced", difficulty: 3 },
];

const categories = ["alphabet", "vocabulary", "grammar", "scenarios"];

export default function AdminLessons() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredLessons = staticLessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || lesson.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout title="Lesson Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Lessons Management</h1>
            <p className="text-muted-foreground">
              View and manage all lessons in the application
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Available Lessons ({filteredLessons.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search lessons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLessons.map((lesson) => (
                    <TableRow key={lesson.id}>
                      <TableCell className="font-medium">{lesson.title}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-muted rounded-md text-sm capitalize">
                          {lesson.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < lesson.difficulty ? "bg-primary" : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {lesson.route}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <a href={lesson.route} target="_blank" rel="noopener noreferrer">
                            View
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> These lessons are currently hardcoded in the application. 
                To add dynamic lesson management, a lessons table would need to be created in the database.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
