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
  saveGame(playerName);
  
  return gameState;
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
    
    // Make sure the profile exists
    await createOrLoadProfile(currentGameState.playerName);
    
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