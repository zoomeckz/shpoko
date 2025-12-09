// Level calculation utilities

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000];

export function calculateLevel(xp: number): number {
  let level = 1;
  let currentThreshold = 0;
  let nextThreshold = 100;
  
  while (xp >= nextThreshold) {
    level++;
    currentThreshold = nextThreshold;
    if (level <= 10) {
      nextThreshold = LEVEL_THRESHOLDS[level] || Math.floor(currentThreshold * 1.5);
    } else {
      nextThreshold = Math.floor(currentThreshold * 1.5);
    }
  }
  
  return level;
}

export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level <= 10) return LEVEL_THRESHOLDS[level - 1];
  
  // For levels beyond 10, calculate recursively
  let threshold = LEVEL_THRESHOLDS[9]; // Level 10 threshold
  for (let i = 10; i < level; i++) {
    threshold = Math.floor(threshold * 1.5);
  }
  return threshold;
}

export function getXPForNextLevel(level: number): number {
  if (level < 10) return LEVEL_THRESHOLDS[level];
  
  // For levels 10+
  let threshold = LEVEL_THRESHOLDS[9];
  for (let i = 10; i <= level; i++) {
    threshold = Math.floor(threshold * 1.5);
  }
  return threshold;
}

export function calculateLevelProgress(xp: number, level: number): number {
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForNextLevel(level);
  
  const xpInCurrentLevel = xp - currentLevelXP;
  const xpRequiredForNext = nextLevelXP - currentLevelXP;
  
  if (xpRequiredForNext <= 0) return 100;
  
  const progress = (xpInCurrentLevel / xpRequiredForNext) * 100;
  return Math.min(100, Math.max(0, progress));
}
