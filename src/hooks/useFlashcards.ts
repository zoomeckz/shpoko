import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FlashcardDeck {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  source_language: string;
  target_language: string;
  is_public: boolean;
  is_lesson_based: boolean;
  lesson_ids: string[];
  created_at: string;
  updated_at: string;
  card_count?: number;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  front_text: string;
  back_text: string;
  pronunciation: string | null;
  times_reviewed: number;
  times_correct: number;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useFlashcards = () => {
  const { user } = useAuth();
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [publicDecks, setPublicDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDecks = useCallback(async () => {
    if (!user?.id) {
      setDecks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("flashcard_decks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDecks(data as FlashcardDeck[]);
    }
    setLoading(false);
  }, [user?.id]);

  const fetchPublicDecks = useCallback(async () => {
    const { data, error } = await supabase
      .from("flashcard_decks")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setPublicDecks(data as FlashcardDeck[]);
    }
  }, []);

  useEffect(() => {
    fetchDecks();
    fetchPublicDecks();
  }, [fetchDecks, fetchPublicDecks]);

  const createDeck = async (
    title: string,
    description: string,
    sourceLanguage: string,
    targetLanguage: string,
    isPublic: boolean = false,
    isLessonBased: boolean = false,
    lessonIds: string[] = []
  ): Promise<FlashcardDeck | null> => {
    if (!user?.id) return null;

    const { data, error } = await supabase
      .from("flashcard_decks")
      .insert({
        user_id: user.id,
        title,
        description,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        is_public: isPublic,
        is_lesson_based: isLessonBased,
        lesson_ids: lessonIds,
      })
      .select()
      .single();

    if (!error && data) {
      await fetchDecks();
      return data as FlashcardDeck;
    }
    return null;
  };

  const updateDeck = async (
    deckId: string,
    updates: Partial<Pick<FlashcardDeck, "title" | "description" | "is_public" | "lesson_ids">>
  ): Promise<boolean> => {
    const { error } = await supabase
      .from("flashcard_decks")
      .update(updates)
      .eq("id", deckId);

    if (!error) {
      await fetchDecks();
      return true;
    }
    return false;
  };

  const deleteDeck = async (deckId: string): Promise<boolean> => {
    const { error } = await supabase
      .from("flashcard_decks")
      .delete()
      .eq("id", deckId);

    if (!error) {
      await fetchDecks();
      return true;
    }
    return false;
  };

  const getCardsForDeck = async (deckId: string): Promise<Flashcard[]> => {
    const { data, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("deck_id", deckId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      return data as Flashcard[];
    }
    return [];
  };

  const addCard = async (
    deckId: string,
    frontText: string,
    backText: string,
    pronunciation?: string
  ): Promise<Flashcard | null> => {
    const { data, error } = await supabase
      .from("flashcards")
      .insert({
        deck_id: deckId,
        front_text: frontText,
        back_text: backText,
        pronunciation: pronunciation || null,
      })
      .select()
      .single();

    if (!error && data) {
      return data as Flashcard;
    }
    return null;
  };

  const updateCard = async (
    cardId: string,
    updates: Partial<Pick<Flashcard, "front_text" | "back_text" | "pronunciation">>
  ): Promise<boolean> => {
    const { error } = await supabase
      .from("flashcards")
      .update(updates)
      .eq("id", cardId);

    return !error;
  };

  const deleteCard = async (cardId: string): Promise<boolean> => {
    const { error } = await supabase
      .from("flashcards")
      .delete()
      .eq("id", cardId);

    return !error;
  };

  const recordReview = async (cardId: string, correct: boolean): Promise<boolean> => {
    const { data: card } = await supabase
      .from("flashcards")
      .select("times_reviewed, times_correct")
      .eq("id", cardId)
      .single();

    if (!card) return false;

    const { error } = await supabase
      .from("flashcards")
      .update({
        times_reviewed: (card.times_reviewed || 0) + 1,
        times_correct: correct ? (card.times_correct || 0) + 1 : card.times_correct,
        last_reviewed_at: new Date().toISOString(),
      })
      .eq("id", cardId);

    return !error;
  };

  return {
    decks,
    publicDecks,
    loading,
    fetchDecks,
    fetchPublicDecks,
    createDeck,
    updateDeck,
    deleteDeck,
    getCardsForDeck,
    addCard,
    updateCard,
    deleteCard,
    recordReview,
  };
};
