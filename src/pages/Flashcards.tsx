import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Globe, Lock, Layers, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFlashcards, FlashcardDeck } from "@/hooks/useFlashcards";
import { useLanguageMode } from "@/contexts/LanguageModeContext";
import { getTranslations } from "@/lib/translations";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";

const Flashcards = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { decks, publicDecks, loading, createDeck, deleteDeck } = useFlashcards();
  const { uiLanguage } = useLanguageMode();
  const t = getTranslations(uiLanguage);
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDeck, setNewDeck] = useState({
    title: "",
    description: "",
    sourceLanguage: "english",
    targetLanguage: "bulgarian",
    isPublic: false,
  });

  const handleCreateDeck = async () => {
    if (!newDeck.title.trim()) {
      toast({ title: "Error", description: "Please enter a deck title", variant: "destructive" });
      return;
    }

    const deck = await createDeck(
      newDeck.title,
      newDeck.description,
      newDeck.sourceLanguage,
      newDeck.targetLanguage,
      newDeck.isPublic
    );

    if (deck) {
      toast({ title: "Success", description: "Deck created successfully!" });
      setIsCreateOpen(false);
      setNewDeck({ title: "", description: "", sourceLanguage: "english", targetLanguage: "bulgarian", isPublic: false });
    } else {
      toast({ title: "Error", description: "Failed to create deck", variant: "destructive" });
    }
  };

  const handleDeleteDeck = async (deckId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this deck?")) {
      const success = await deleteDeck(deckId);
      if (success) {
        toast({ title: "Deleted", description: "Deck deleted successfully" });
      }
    }
  };

  const DeckCard = ({ deck, isOwner = false }: { deck: FlashcardDeck; isOwner?: boolean }) => (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => navigate(`/flashcards/${deck.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{deck.title}</CardTitle>
          <div className="flex items-center gap-2">
            {deck.is_public ? (
              <Globe className="w-4 h-4 text-green-500" />
            ) : (
              <Lock className="w-4 h-4 text-muted-foreground" />
            )}
            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={(e) => handleDeleteDeck(deck.id, e)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {deck.description || "No description"}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Layers className="w-3 h-3" />
          <span>{deck.source_language} → {deck.target_language}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header streak={profile?.streak || 0} hearts={5} xp={profile?.xp || 0} dailyGoalProgress={50} />
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Flashcards</h1>
          </div>
          {user && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Deck
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Deck</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newDeck.title}
                      onChange={(e) => setNewDeck({ ...newDeck, title: e.target.value })}
                      placeholder="My Flashcard Deck"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newDeck.description}
                      onChange={(e) => setNewDeck({ ...newDeck, description: e.target.value })}
                      placeholder="What's this deck about?"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>From Language</Label>
                      <Select
                        value={newDeck.sourceLanguage}
                        onValueChange={(v) => setNewDeck({ ...newDeck, sourceLanguage: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="bulgarian">Bulgarian</SelectItem>
                          <SelectItem value="spanish">Spanish</SelectItem>
                          <SelectItem value="swedish">Swedish</SelectItem>
                          <SelectItem value="greek">Greek</SelectItem>
                          <SelectItem value="russian">Russian</SelectItem>
                          <SelectItem value="ukrainian">Ukrainian</SelectItem>
                          <SelectItem value="italian">Italian</SelectItem>
                          <SelectItem value="polish">Polish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>To Language</Label>
                      <Select
                        value={newDeck.targetLanguage}
                        onValueChange={(v) => setNewDeck({ ...newDeck, targetLanguage: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="bulgarian">Bulgarian</SelectItem>
                          <SelectItem value="spanish">Spanish</SelectItem>
                          <SelectItem value="swedish">Swedish</SelectItem>
                          <SelectItem value="greek">Greek</SelectItem>
                          <SelectItem value="russian">Russian</SelectItem>
                          <SelectItem value="ukrainian">Ukrainian</SelectItem>
                          <SelectItem value="italian">Italian</SelectItem>
                          <SelectItem value="polish">Polish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="public">Make deck public</Label>
                    <Switch
                      id="public"
                      checked={newDeck.isPublic}
                      onCheckedChange={(v) => setNewDeck({ ...newDeck, isPublic: v })}
                    />
                  </div>
                  <Button className="w-full" onClick={handleCreateDeck}>
                    Create Deck
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs defaultValue="my-decks">
          <TabsList className="mb-4">
            <TabsTrigger value="my-decks">My Decks</TabsTrigger>
            <TabsTrigger value="public">Public Decks</TabsTrigger>
          </TabsList>

          <TabsContent value="my-decks">
            {!user ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">Sign in to create and manage your flashcard decks</p>
                <Button onClick={() => navigate("/auth")}>Sign In</Button>
              </Card>
            ) : loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : decks.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">You haven't created any decks yet</p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Deck
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {decks.map((deck) => (
                  <DeckCard key={deck.id} deck={deck} isOwner />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="public">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : publicDecks.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No public decks available yet</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {publicDecks.map((deck) => (
                  <DeckCard key={deck.id} deck={deck} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Flashcards;
