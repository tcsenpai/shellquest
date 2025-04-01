import fs from 'fs/promises';
import { getSavePath } from './gameInit';
import { createProfile, loadProfile, saveProfile } from './playerProfile';
import { getCurrentProfile } from './playerProfile';

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

export function setCurrentGameState(gameState: GameState): void {
  currentGameState = gameState;
}

export function createNewGame(playerName: string): GameState {
  const gameState: GameState = {
    playerName,
    currentLevel: 1,
    startTime: Date.now(),
    lastSaveTime: Date.now(),
    completedLevels: [],
    inventory: [],
    levelStates: {}
  };
  
  // Create a new profile for this player
  createOrLoadProfile(playerName);
  
  setCurrentGameState(gameState);
  
  // Save the initial game state
  saveGame();
  
  return gameState;
}

export async function saveGame(): Promise<{ success: boolean, message: string }> {
  if (!currentGameState) {
    return { 
      success: false, 
      message: 'No active game to save' 
    };
  }
  
  // Update save time
  currentGameState.lastSaveTime = Date.now();
  
  // Always use player name as save name
  const fileName = currentGameState.playerName;
  
  try {
    await fs.writeFile(
      getSavePath(fileName),
      JSON.stringify(currentGameState, null, 2)
    );
    return { 
      success: true, 
      message: `Game saved for ${fileName}` 
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Failed to save game: ${error}` 
    };
  }
}

export async function loadGame(playerName: string): Promise<boolean> {
  try {
    const saveData = await fs.readFile(getSavePath(playerName), 'utf-8');
    currentGameState = JSON.parse(saveData) as GameState;
    
    // Make sure the profile exists
    await createOrLoadProfile(currentGameState.playerName);
    
    console.log(`Game loaded for ${playerName}`);
    return true;
  } catch (error) {
    console.error('Failed to load game:', error);
    return false;
  }
}

// Autosave now just calls regular save
export async function autoSave(): Promise<{ success: boolean, message: string }> {
  return saveGame();
}

async function createOrLoadProfile(playerName: string): Promise<void> {
  const profile = await loadProfile(playerName);
  if (!profile) {
    await createProfile(playerName);
  }
}

export async function completeCurrentLevel(): Promise<void> {
  const gameState = getCurrentGameState();
  if (!gameState) return;
  
  // Add the level to completed levels in the game state
  if (!gameState.completedLevels.includes(gameState.currentLevel)) {
    gameState.completedLevels.push(gameState.currentLevel);
  }
  
  // Also update the profile
  const profile = await getCurrentProfile();
  if (profile) {
    if (!profile.completedLevels.includes(gameState.currentLevel)) {
      profile.completedLevels.push(gameState.currentLevel);
      await saveProfile(profile);
    }
  }
  
  // Move to the next level
  gameState.currentLevel++;
  
  // Save the game
  await saveGame();
} 