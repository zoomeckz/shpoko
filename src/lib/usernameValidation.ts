// Common profanity filter - basic list, can be expanded
const profanityList = [
  "fuck", "shit", "ass", "bitch", "damn", "cunt", "dick", "cock", "pussy",
  "bastard", "whore", "slut", "fag", "nigger", "nigga", "retard", "nazi",
  "penis", "vagina", "asshole", "motherfucker", "bullshit", "piss",
  // Add more as needed
];

export interface UsernameValidationResult {
  isValid: boolean;
  error: string | null;
}

export const validateUsername = (username: string): UsernameValidationResult => {
  const trimmed = username.trim();

  // Check length
  if (trimmed.length < 3) {
    return { isValid: false, error: "Username must be at least 3 characters" };
  }

  if (trimmed.length > 20) {
    return { isValid: false, error: "Username must be 20 characters or less" };
  }

  // Allow letters, numbers, and spaces only (no special characters)
  const validPattern = /^[a-zA-Z0-9 ]+$/;
  if (!validPattern.test(trimmed)) {
    return { isValid: false, error: "Username can only contain letters, numbers, and spaces" };
  }

  // No leading or trailing spaces (already trimmed, but double spaces)
  if (/\s{2,}/.test(trimmed)) {
    return { isValid: false, error: "Username cannot contain consecutive spaces" };
  }

  // Check for profanity
  const lowerUsername = trimmed.toLowerCase();
  for (const word of profanityList) {
    if (lowerUsername.includes(word)) {
      return { isValid: false, error: "Username contains inappropriate language" };
    }
  }

  return { isValid: true, error: null };
};

export const canChangeUsername = (lastChange: string | null): { canChange: boolean; daysRemaining: number } => {
  if (!lastChange) {
    return { canChange: true, daysRemaining: 0 };
  }

  const lastChangeDate = new Date(lastChange);
  const now = new Date();
  const diffMs = now.getTime() - lastChangeDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, 30 - diffDays);

  return {
    canChange: diffDays >= 30,
    daysRemaining,
  };
};
