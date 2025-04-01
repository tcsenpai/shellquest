import { getCurrentGameState, autoSave } from './gameState';
import { updateLeaderboard } from './leaderboard';

export interface Level {
  id: number;
  name: string;
  description: string;
  initialize: () => Promise<void>;
  render: () => Promise<void>;
  handleInput: (input: string) => Promise<LevelResult>;
  hints: string[];
}

export interface LevelResult {
  completed: boolean;
  message?: string;
  nextAction?: 'next_level' | 'main_menu' | 'continue';
}

// Registry of all available levels
const levels: Record<number, Level> = {};

export function registerLevel(level: Level) {
  levels[level.id] = level;
  console.log(`Registered level: ${level.id} - ${level.name}`);
}

export function getLevelById(id: number): Level | undefined {
  return levels[id];
}

export function getAllLevels(): Level[] {
  return Object.values(levels).sort((a, b) => a.id - b.id);
}

export async function startLevel(levelId: number): Promise<boolean> {
  const gameState = getCurrentGameState();
  if (!gameState) {
    console.error('No active game');
    return false;
  }
  
  const level = getLevelById(levelId);
  if (!level) {
    console.error(`Level ${levelId} not found`);
    return false;
  }
  
  gameState.currentLevel = levelId;
  
  // Initialize level
  await level.initialize();
  
  // Auto-save when starting a new level
  await autoSave();
  
  return true;
}

export async function completeCurrentLevel(): Promise<void> {
  const gameState = getCurrentGameState();
  if (!gameState) return;
  
  if (!gameState.completedLevels.includes(gameState.currentLevel)) {
    gameState.completedLevels.push(gameState.currentLevel);
  }
  
  // If this was the final level, update the leaderboard
  const allLevels = getAllLevels();
  if (gameState.completedLevels.length === allLevels.length) {
    const totalTime = Date.now() - gameState.startTime;
    await updateLeaderboard(gameState.playerName, totalTime);
  }
  
  // Auto-save on level completion
  await autoSave();
} 