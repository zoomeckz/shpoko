/**
 * Fuzzy answer matching utility for language learning
 * Allows close answers with partial credit
 */

// Common acceptable alternatives for Bulgarian/English translations
const equivalentPhrases: Record<string, string[]> = {
  "i am fine": ["i am good", "i'm fine", "i'm good", "im fine", "im good"],
  "i am good": ["i am fine", "i'm fine", "i'm good", "im fine", "im good"],
  "hello": ["hi", "hey"],
  "hi": ["hello", "hey"],
  "goodbye": ["bye", "see you", "farewell"],
  "bye": ["goodbye", "see you", "farewell"],
  "thank you": ["thanks", "thank you very much"],
  "thanks": ["thank you", "thank you very much"],
  "yes": ["yeah", "yep", "yup"],
  "no": ["nope", "nah"],
  "okay": ["ok", "alright", "fine"],
  "ok": ["okay", "alright", "fine"],
};

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

export interface FuzzyMatchResult {
  isExact: boolean;
  isClose: boolean;
  isWrong: boolean;
  similarity: number; // 0-1, where 1 is exact match
  xpMultiplier: number; // 1 for exact, 0.5 for close, 0 for wrong
}

/**
 * Check if an answer is correct, close, or wrong
 * @param userAnswer - The user's answer
 * @param correctAnswers - Array of correct answers
 * @param threshold - Similarity threshold for "close" answers (default 0.7)
 */
export function fuzzyMatchAnswer(
  userAnswer: string,
  correctAnswers: string[],
  threshold: number = 0.7
): FuzzyMatchResult {
  const normalizedUser = userAnswer.trim().toLowerCase();
  const normalizedCorrect = correctAnswers.map(a => a.trim().toLowerCase());
  
  // Check for exact match
  if (normalizedCorrect.includes(normalizedUser)) {
    return {
      isExact: true,
      isClose: false,
      isWrong: false,
      similarity: 1,
      xpMultiplier: 1,
    };
  }
  
  // Check for equivalent phrases
  for (const correct of normalizedCorrect) {
    const equivalents = equivalentPhrases[correct] || [];
    if (equivalents.includes(normalizedUser)) {
      return {
        isExact: false,
        isClose: true,
        isWrong: false,
        similarity: 0.9,
        xpMultiplier: 0.7,
      };
    }
    
    // Also check if user's answer has equivalents that match correct
    const userEquivalents = equivalentPhrases[normalizedUser] || [];
    if (userEquivalents.includes(correct)) {
      return {
        isExact: false,
        isClose: true,
        isWrong: false,
        similarity: 0.9,
        xpMultiplier: 0.7,
      };
    }
  }
  
  // Calculate similarity using Levenshtein distance
  let bestSimilarity = 0;
  
  for (const correct of normalizedCorrect) {
    const distance = levenshteinDistance(normalizedUser, correct);
    const maxLength = Math.max(normalizedUser.length, correct.length);
    const similarity = maxLength === 0 ? 1 : 1 - (distance / maxLength);
    
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
    }
  }
  
  // If similarity is above threshold, it's a close answer
  if (bestSimilarity >= threshold) {
    return {
      isExact: false,
      isClose: true,
      isWrong: false,
      similarity: bestSimilarity,
      xpMultiplier: 0.5,
    };
  }
  
  // Otherwise, it's wrong
  return {
    isExact: false,
    isClose: false,
    isWrong: true,
    similarity: bestSimilarity,
    xpMultiplier: 0,
  };
}
