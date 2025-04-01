import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Game directories
const SAVE_DIR = path.join(__dirname, '../../saves');
const LEADERBOARD_PATH = path.join(__dirname, '../../leaderboard.json');

export async function initializeGame() {
  // Ensure save directory exists
  try {
    await fs.mkdir(SAVE_DIR, { recursive: true });
    console.log('Save directory initialized.');
  } catch (error) {
    console.error('Failed to create save directory:', error);
  }

  // Ensure leaderboard file exists
  try {
    try {
      await fs.access(LEADERBOARD_PATH);
    } catch {
      // Create empty leaderboard if it doesn't exist
      await fs.writeFile(LEADERBOARD_PATH, JSON.stringify({ players: [] }, null, 2));
    }
    console.log('Leaderboard initialized.');
  } catch (error) {
    console.error('Failed to initialize leaderboard:', error);
  }
}

// Helper functions for save management
export async function listSaves(): Promise<string[]> {
  try {
    await ensureSavesDir();
    const files = await fs.readdir(SAVE_DIR);
    
    // Filter out profile files and remove .json extension
    return files
      .filter(file => file.endsWith('.json') && !file.endsWith('_profile.json'))
      .map(file => file.replace('.json', ''));
  } catch (error) {
    console.error('Error listing saves:', error);
    return [];
  }
}

export function getSavePath(saveName: string): string {
  // Remove .json extension if it's already there
  const baseName = saveName.endsWith('.json') 
    ? saveName.slice(0, -5) 
    : saveName;
    
  return path.join(SAVE_DIR, `${baseName}.json`);
}

export const getLeaderboardPath = () => LEADERBOARD_PATH;

// Ensure saves directory exists
export async function ensureSavesDir(): Promise<void> {
  try {
    await fs.mkdir(SAVE_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating saves directory:', error);
  }
} 