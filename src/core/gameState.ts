import fs from 'fs/promises';
import { getSavePath } from './gameInit';

export interface GameState {
  playerName: string;
  currentLevel: number;
  startTime: number;
  lastSaveTime: number;
  completedLevels: number[];
  inventory: string[];
  levelStates: Record<number, any>;
}

let currentGameState: GameState | null = null;

export function getCurrentGameState(): GameState | null {
  return currentGameState;
}

export function createNewGame(playerName: string): GameState {
  const newState: GameState = {
    playerName,
    currentLevel: 1,
    startTime: Date.now(),
    lastSaveTime: Date.now(),
    completedLevels: [],
    inventory: [],
    levelStates: {}
  };
  
  currentGameState = newState;
  return newState;
}

export async function saveGame(saveName?: string): Promise<boolean> {
  if (!currentGameState) {
    console.error('No active game to save');
    return false;
  }
  
  // Update save time
  currentGameState.lastSaveTime = Date.now();
  
  // Use player name as save name if not specified
  const fileName = saveName || currentGameState.playerName;
  
  try {
    await fs.writeFile(
      getSavePath(fileName),
      JSON.stringify(currentGameState, null, 2)
    );
    console.log(`Game saved as ${fileName}`);
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
}

export async function loadGame(saveName: string): Promise<boolean> {
  try {
    const saveData = await fs.readFile(getSavePath(saveName), 'utf-8');
    currentGameState = JSON.parse(saveData) as GameState;
    console.log(`Game loaded: ${saveName}`);
    return true;
  } catch (error) {
    console.error('Failed to load game:', error);
    return false;
  }
}

export async function autoSave(): Promise<boolean> {
  if (!currentGameState) return false;
  return saveGame(`${currentGameState.playerName}_autosave`);
} 