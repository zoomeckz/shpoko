// Level calculation utilities
// Lower XP requirements for easier leveling

export const LEVEL_THRESHOLDS = [0, 50, 120, 200, 300, 450, 650, 900, 1200, 1600];

export function calculateLevel(xp: number): number {
  let level = 1;
  let currentThreshold = 0;
  let nextThreshold = 50;
  
  while (xp >= nextThreshold) {
    level++;
    currentThreshold = nextThreshold;
    if (level <= 10) {
      nextThreshold = LEVEL_THRESHOLDS[level] || Math.floor(currentThreshold * 1.3);
    } else {
      nextThreshold = Math.floor(currentThreshold * 1.3);
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
    threshold = Math.floor(threshold * 1.3);
  }
  return threshold;
}

export function getXPForNextLevel(level: number): number {
  if (level < 10) return LEVEL_THRESHOLDS[level];
  
  // For levels 10+
  let threshold = LEVEL_THRESHOLDS[9];
  for (let i = 10; i <= level; i++) {
    threshold = Math.floor(threshold * 1.3);
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
