import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, RotateCcw, Check, X, Edit2, Trash2, Play, Shuffle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFlashcards, FlashcardDeck, Flashcard } from "@/hooks/useFlashcards";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type StudyMode = "browse" | "study" | "reverse";

const FlashcardStudy = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  const { user } = useAuth();
  const { decks, publicDecks, getCardsForDeck, addCard, updateCard, deleteCard, recordReview } = useFlashcards();
  const { toast } = useToast();

  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<StudyMode>("browse");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);
  const [correctCount, setCorrectCount] = useState(0);

  // Add card dialog
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCard, setNewCard] = useState({ front: "", back: "", pronunciation: "" });

  // Edit card dialog
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  const isOwner = deck?.user_id === user?.id;

  useEffect(() => {
    const loadDeck = async () => {
      if (!deckId) return;
      
      const allDecks = [...decks, ...publicDecks];
      const foundDeck = allDecks.find(d => d.id === deckId);
      
      if (foundDeck) {
        setDeck(foundDeck);
        const deckCards = await getCardsForDeck(deckId);
        setCards(deckCards);
      }
      setLoading(false);
    };

    loadDeck();
  }, [deckId, decks, publicDecks, getCardsForDeck]);

  const handleAddCard = async () => {
    if (!deckId || !newCard.front.trim() || !newCard.back.trim()) {
      toast({ title: "Error", description: "Please fill in both sides", variant: "destructive" });
      return;
    }

    const card = await addCard(deckId, newCard.front, newCard.back, newCard.pronunciation);
    if (card) {
      setCards([...cards, card]);
      setNewCard({ front: "", back: "", pronunciation: "" });
      setIsAddOpen(false);
      toast({ title: "Added", description: "Card added successfully" });
    }
  };

  const handleUpdateCard = async () => {
    if (!editingCard) return;

    const success = await updateCard(editingCard.id, {
      front_text: editingCard.front_text,
      back_text: editingCard.back_text,
      pronunciation: editingCard.pronunciation,
    });

    if (success) {
      setCards(cards.map(c => c.id === editingCard.id ? editingCard : c));
      setEditingCard(null);
      toast({ title: "Updated", description: "Card updated successfully" });
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (confirm("Delete this card?")) {
      const success = await deleteCard(cardId);
      if (success) {
        setCards(cards.filter(c => c.id !== cardId));
        toast({ title: "Deleted", description: "Card deleted" });
      }
    }
  };

  const startStudy = (reverse: boolean = false) => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectCount(0);
    setMode(reverse ? "reverse" : "study");
  };

  const handleAnswer = async (correct: boolean) => {
    const currentCard = shuffledCards[currentIndex];
    await recordReview(currentCard.id, correct);
    
    if (correct) setCorrectCount(prev => prev + 1);

    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      toast({
        title: "Session Complete!",
        description: `You got ${correctCount + (correct ? 1 : 0)}/${shuffledCards.length} correct!`,
      });
      setMode("browse");
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!deck) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Button variant="ghost" onClick={() => navigate("/flashcards")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <p className="text-center mt-8">Deck not found</p>
      </div>
    );
  }

  const currentCard = shuffledCards[currentIndex];
  const progress = shuffledCards.length > 0 ? ((currentIndex + 1) / shuffledCards.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => mode === "browse" ? navigate("/flashcards") : setMode("browse")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{deck.title}</h1>
              <p className="text-sm text-muted-foreground">{cards.length} cards</p>
            </div>
          </div>
        </div>

        {mode === "browse" ? (
          <>
            <div className="flex gap-2 mb-6">
              {cards.length > 0 && (
                <>
                  <Button onClick={() => startStudy(false)} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Study ({deck.source_language} → {deck.target_language})
                  </Button>
                  <Button variant="outline" onClick={() => startStudy(true)} className="flex-1">
                    <Shuffle className="w-4 h-4 mr-2" />
                    Reverse
                  </Button>
                </>
              )}
              {isOwner && (
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Card
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Card</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Front ({deck.source_language})</Label>
                        <Input
                          value={newCard.front}
                          onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                          placeholder="Word or phrase"
                        />
                      </div>
                      <div>
                        <Label>Back ({deck.target_language})</Label>
                        <Input
                          value={newCard.back}
                          onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                          placeholder="Translation"
                        />
                      </div>
                      <div>
                        <Label>Pronunciation (optional)</Label>
                        <Input
                          value={newCard.pronunciation}
                          onChange={(e) => setNewCard({ ...newCard, pronunciation: e.target.value })}
                          placeholder="How to pronounce"
                        />
                      </div>
                      <Button className="w-full" onClick={handleAddCard}>Add Card</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {cards.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No cards in this deck yet</p>
                {isOwner && (
                  <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Card
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-2">
                {cards.map((card) => (
                  <Card key={card.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{card.front_text}</p>
                        <p className="text-sm text-muted-foreground">{card.back_text}</p>
                        {card.pronunciation && (
                          <p className="text-xs text-muted-foreground italic">{card.pronunciation}</p>
                        )}
                      </div>
                      {isOwner && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingCard(card)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteCard(card.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={!!editingCard} onOpenChange={(open) => !open && setEditingCard(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Card</DialogTitle>
                </DialogHeader>
                {editingCard && (
                  <div className="space-y-4">
                    <div>
                      <Label>Front</Label>
                      <Input
                        value={editingCard.front_text}
                        onChange={(e) => setEditingCard({ ...editingCard, front_text: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Back</Label>
                      <Input
                        value={editingCard.back_text}
                        onChange={(e) => setEditingCard({ ...editingCard, back_text: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Pronunciation</Label>
                      <Input
                        value={editingCard.pronunciation || ""}
                        onChange={(e) => setEditingCard({ ...editingCard, pronunciation: e.target.value })}
                      />
                    </div>
                    <Button className="w-full" onClick={handleUpdateCard}>Save Changes</Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <>
            <Progress value={progress} className="mb-4" />
            <p className="text-center text-sm text-muted-foreground mb-4">
              Card {currentIndex + 1} of {shuffledCards.length}
            </p>

            {currentCard && (
              <Card 
                className={cn(
                  "min-h-[300px] cursor-pointer transition-all duration-300 perspective-1000",
                  isFlipped && "bg-primary/5"
                )}
                onClick={() => setIsFlipped(true)}
              >
                <CardContent className="flex flex-col items-center justify-center min-h-[300px] p-8">
                  {!isFlipped ? (
                    <div className="text-center">
                      <p className="text-3xl font-bold mb-2">
                        {mode === "reverse" ? currentCard.back_text : currentCard.front_text}
                      </p>
                      <p className="text-muted-foreground">Tap to reveal</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary mb-2">
                        {mode === "reverse" ? currentCard.front_text : currentCard.back_text}
                      </p>
                      {currentCard.pronunciation && (
                        <p className="text-muted-foreground italic">{currentCard.pronunciation}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {isFlipped && (
              <div className="flex gap-4 mt-6">
                <Button
                  variant="outline"
                  className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => handleAnswer(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Wrong
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleAnswer(true)}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Correct
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FlashcardStudy;
