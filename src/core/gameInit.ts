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
export async function listSaves() {
  try {
    const files = await fs.readdir(SAVE_DIR);
    return files.filter(file => file.endsWith('.json'));
  } catch (error) {
    console.error('Failed to list saves:', error);
    return [];
  }
}

export const getSavePath = (saveName: string) => path.join(SAVE_DIR, `${saveName}.json`);
export const getLeaderboardPath = () => LEADERBOARD_PATH; 