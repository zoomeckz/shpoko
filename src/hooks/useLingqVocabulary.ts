import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface VocabularyWord {
  id: string;
  word: string;
  translation: string | null;
  romanization: string | null;
  notes: string | null;
  status: number; // 1-New, 2-Recognized, 3-Familiar, 4-Learned, 5-Known
  times_seen: number;
  times_correct: number;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  created_at: string;
  updated_at: string;
}

export const STATUS_LABELS = {
  1: "New",
  2: "Recognized", 
  3: "Familiar",
  4: "Learned",
  5: "Known",
} as const;

export const STATUS_COLORS = {
  1: "bg-blue-500", // New - blue (like LingQ)
  2: "bg-yellow-500", // Recognized - yellow
  3: "bg-orange-400", // Familiar - orange
  4: "bg-green-500", // Learned - green
  5: "bg-transparent", // Known - no highlight
} as const;

export const STATUS_TEXT_COLORS = {
  1: "text-white",
  2: "text-black",
  3: "text-white",
  4: "text-white",
  5: "text-foreground",
} as const;

export const useLingqVocabulary = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [vocabularyMap, setVocabularyMap] = useState<Map<string, VocabularyWord>>(new Map());

  // Fetch all user vocabulary
  const fetchVocabulary = useCallback(async () => {
    if (!user) {
      setVocabulary([]);
      setVocabularyMap(new Map());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_vocabulary")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const words = (data || []) as VocabularyWord[];
      setVocabulary(words);
      
      // Create a map for quick lookups
      const map = new Map<string, VocabularyWord>();
      words.forEach(w => map.set(w.word.toLowerCase(), w));
      setVocabularyMap(map);
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVocabulary();
  }, [fetchVocabulary]);

  // Get word status (returns undefined if word is new/unknown)
  const getWordStatus = useCallback((word: string): VocabularyWord | undefined => {
    return vocabularyMap.get(word.toLowerCase().replace(/[.,!?;:'"]/g, ""));
  }, [vocabularyMap]);

  // Check if word is known (status 5)
  const isWordKnown = useCallback((word: string): boolean => {
    const vocabWord = getWordStatus(word);
    return vocabWord?.status === 5;
  }, [getWordStatus]);

  // Save a new word or update existing
  const saveWord = useCallback(async (
    word: string, 
    translation: string, 
    romanization?: string,
    notes?: string,
    status: number = 1
  ): Promise<VocabularyWord | null> => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to save vocabulary",
        variant: "destructive",
      });
      return null;
    }

    try {
      const cleanWord = word.toLowerCase().replace(/[.,!?;:'"]/g, "");
      
      const { data, error } = await supabase
        .from("user_vocabulary")
        .upsert({
          user_id: user.id,
          word: cleanWord,
          translation,
          romanization: romanization || null,
          notes: notes || null,
          status,
          times_seen: 1,
        }, { onConflict: "user_id,word" })
        .select()
        .single();

      if (error) throw error;

      await fetchVocabulary();
      
      toast({
        title: "Word saved!",
        description: `"${cleanWord}" added to your vocabulary`,
      });

      return data as VocabularyWord;
    } catch (error) {
      console.error("Error saving word:", error);
      toast({
        title: "Error",
        description: "Failed to save word",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast, fetchVocabulary]);

  // Update word status
  const updateWordStatus = useCallback(async (word: string, newStatus: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const cleanWord = word.toLowerCase().replace(/[.,!?;:'"]/g, "");
      
      const { error } = await supabase
        .from("user_vocabulary")
        .update({ 
          status: newStatus,
          last_reviewed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("word", cleanWord);

      if (error) throw error;

      await fetchVocabulary();
      return true;
    } catch (error) {
      console.error("Error updating word status:", error);
      return false;
    }
  }, [user, fetchVocabulary]);

  // Mark word as known (status 5)
  const markAsKnown = useCallback(async (word: string): Promise<boolean> => {
    return updateWordStatus(word, 5);
  }, [updateWordStatus]);

  // Increment times seen
  const incrementTimesSeen = useCallback(async (word: string): Promise<void> => {
    if (!user) return;
    
    const cleanWord = word.toLowerCase().replace(/[.,!?;:'"]/g, "");
    const existing = vocabularyMap.get(cleanWord);
    
    if (existing) {
      await supabase
        .from("user_vocabulary")
        .update({ times_seen: existing.times_seen + 1 })
        .eq("user_id", user.id)
        .eq("word", cleanWord);
    }
  }, [user, vocabularyMap]);

  // Delete a word from vocabulary
  const deleteWord = useCallback(async (word: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const cleanWord = word.toLowerCase().replace(/[.,!?;:'"]/g, "");
      
      const { error } = await supabase
        .from("user_vocabulary")
        .delete()
        .eq("user_id", user.id)
        .eq("word", cleanWord);

      if (error) throw error;

      await fetchVocabulary();
      
      toast({
        title: "Word removed",
        description: `"${cleanWord}" removed from vocabulary`,
      });

      return true;
    } catch (error) {
      console.error("Error deleting word:", error);
      return false;
    }
  }, [user, toast, fetchVocabulary]);

  // Get vocabulary statistics
  const getStats = useCallback(() => {
    const stats = {
      total: vocabulary.length,
      new: vocabulary.filter(w => w.status === 1).length,
      recognized: vocabulary.filter(w => w.status === 2).length,
      familiar: vocabulary.filter(w => w.status === 3).length,
      learned: vocabulary.filter(w => w.status === 4).length,
      known: vocabulary.filter(w => w.status === 5).length,
    };
    return stats;
  }, [vocabulary]);

  // Get words due for review (SRS-style)
  const getWordsForReview = useCallback(() => {
    const now = new Date();
    return vocabulary.filter(w => {
      if (w.status === 5) return false; // Known words don't need review
      if (!w.next_review_at) return true; // Never reviewed
      return new Date(w.next_review_at) <= now;
    });
  }, [vocabulary]);

  return {
    vocabulary,
    loading,
    getWordStatus,
    isWordKnown,
    saveWord,
    updateWordStatus,
    markAsKnown,
    incrementTimesSeen,
    deleteWord,
    getStats,
    getWordsForReview,
    refetch: fetchVocabulary,
  };
};