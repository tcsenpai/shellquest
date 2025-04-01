import fs from 'fs/promises';
import { getLeaderboardPath } from './gameInit';

interface LeaderboardEntry {
  playerName: string;
  completionTime: number; // in milliseconds
  completionDate: string;
}

interface Leaderboard {
  players: LeaderboardEntry[];
}

export async function getLeaderboard(): Promise<Leaderboard> {
  try {
    const data = await fs.readFile(getLeaderboardPath(), 'utf-8');
    return JSON.parse(data) as Leaderboard;
  } catch (error) {
    console.error('Failed to read leaderboard:', error);
    return { players: [] };
  }
}

export async function updateLeaderboard(
  playerName: string, 
  completionTime: number
): Promise<boolean> {
  try {
    const leaderboard = await getLeaderboard();
    
    // Add new entry
    leaderboard.players.push({
      playerName,
      completionTime,
      completionDate: new Date().toISOString()
    });
    
    // Sort by completion time (fastest first)
    leaderboard.players.sort((a, b) => a.completionTime - b.completionTime);
    
    // Save updated leaderboard
    await fs.writeFile(
      getLeaderboardPath(),
      JSON.stringify(leaderboard, null, 2)
    );
    
    return true;
  } catch (error) {
    console.error('Failed to update leaderboard:', error);
    return false;
  }
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;
  
  return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
} 