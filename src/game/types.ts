// Game-wide type definitions

export interface WorldNode {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string | null;
  isDungeon: boolean;
  lessonId: string;
  xpReward: number;
  nodeNumber: number;
  weekNumber: number;
  worldZone: WorldZone;
}

export type WorldZone = 'school' | 'city' | 'sewer' | 'forest' | 'space';

export interface GameCallbacks {
  onNodeSelect: (nodeId: string) => void;
  onEnterLevel: (nodeId: string) => void;
  isNodeUnlocked: (nodeId: string) => boolean;
  isNodeCompleted: (nodeId: string) => boolean;
}

export interface GameData {
  nodes: WorldNode[];
  currentNodeId: string | null;
  callbacks: GameCallbacks;
}

// Player state for platformer
export interface PlayerState {
  isGrounded: boolean;
  isJumping: boolean;
  isFalling: boolean;
  isRunning: boolean;
  facingRight: boolean;
  coyoteTimeLeft: number;
  jumpBuffered: boolean;
  canDoubleJump: boolean;
  isHurt: boolean;
  isStomping: boolean;
}

// Enemy types
export type EnemyType = 'coyote' | 'bobcat' | 'cougar' | 'bear' | 'wolf' | 'fox';

// Enemy state
export interface EnemyState {
  type: EnemyType;
  health: number;
  isAlert: boolean;
  isDefeated: boolean;
  patrolDirection: number;
  wordToRelease: BulgarianWord;
}

// Bulgarian vocabulary word
export interface BulgarianWord {
  cyrillic: string;
  romanized: string;
  english: string;
}

// Level data for platformer
export interface LevelData {
  nodeId: string;
  lessonId: string;
  worldZone: WorldZone;
  words: BulgarianWord[];
}

// VFX types
export type VFXType = 
  | 'dust_puff' 
  | 'stomp_burst' 
  | 'word_popup' 
  | 'unlock_spark' 
  | 'rocket_smoke';

// Audio event types
export type AudioEvent = 
  | 'footstep_walk'
  | 'footstep_run'
  | 'jump_start'
  | 'jump_land'
  | 'stomp'
  | 'enemy_defeat'
  | 'word_popup'
  | 'node_unlock'
  | 'button_click'
  | 'rocket_launch'
  | 'hurt'
  | 'victory';

// World zone colors and themes
export const WORLD_ZONES: Record<WorldZone, {
  name: string;
  primaryColor: number;
  secondaryColor: number;
  bgGradientTop: number;
  bgGradientBottom: number;
}> = {
  school: {
    name: 'School',
    primaryColor: 0x4ade80,
    secondaryColor: 0x22c55e,
    bgGradientTop: 0x87ceeb,
    bgGradientBottom: 0x98fb98,
  },
  city: {
    name: 'City',
    primaryColor: 0x94a3b8,
    secondaryColor: 0x64748b,
    bgGradientTop: 0x475569,
    bgGradientBottom: 0x1e293b,
  },
  sewer: {
    name: 'Sewer',
    primaryColor: 0x65a30d,
    secondaryColor: 0x4d7c0f,
    bgGradientTop: 0x1f2937,
    bgGradientBottom: 0x111827,
  },
  forest: {
    name: 'Forest',
    primaryColor: 0x059669,
    secondaryColor: 0x047857,
    bgGradientTop: 0x064e3b,
    bgGradientBottom: 0x022c22,
  },
  space: {
    name: 'Space',
    primaryColor: 0x8b5cf6,
    secondaryColor: 0x7c3aed,
    bgGradientTop: 0x0f0a1e,
    bgGradientBottom: 0x1a0a2e,
  },
};
