import fs from 'fs/promises';
import path from 'path';
import { Achievement } from './achievements';
import { getCurrentGameState } from './gameState';
import { getSavePath } from './gameInit';

export interface PlayerProfile {
  playerName: string;
  achievements: Achievement[];
  lastPlayed: number;
  totalPlayTime: number;
  completedLevels: number[];
}

// Use the same directory for profiles and saves
const profilesDir = path.join(process.cwd(), 'saves');

// Ensure profiles directory exists
export async function ensureProfilesDir(): Promise<void> {
  try {
    await fs.mkdir(profilesDir, { recursive: true });
  } catch (error) {
    console.error('Error creating profiles directory:', error);
  }
}

// Get profile path for a player
function getProfilePath(playerName: string): string {
  return path.join(profilesDir, `${playerName.toLowerCase()}_profile.json`);
}

// Create a new player profile
export async function createProfile(playerName: string): Promise<PlayerProfile> {
  const profile: PlayerProfile = {
    playerName,
    achievements: [],
    lastPlayed: Date.now(),
    totalPlayTime: 0,
    completedLevels: []
  };
  
  await saveProfile(profile);
  return profile;
}

// Load a player profile
export async function loadProfile(playerName: string): Promise<PlayerProfile | null> {
  try {
    const profilePath = getProfilePath(playerName);
    const data = await fs.readFile(profilePath, 'utf-8');
    return JSON.parse(data) as PlayerProfile;
  } catch (error) {
    // Profile doesn't exist or can't be read
    return null;
  }
}

// Save a player profile
export async function saveProfile(profile: PlayerProfile): Promise<void> {
  try {
    const profilePath = getProfilePath(profile.playerName);
    await fs.writeFile(profilePath, JSON.stringify(profile, null, 2));
  } catch (error) {
    console.error('Error saving profile:', error);
  }
}

// Get current player profile
export async function getCurrentProfile(): Promise<PlayerProfile | null> {
  const gameState = getCurrentGameState();
  if (!gameState) return null;
  
  const profile = await loadProfile(gameState.playerName);
  return profile;
}

// List all profiles
export async function listProfiles(): Promise<string[]> {
  try {
    const files = await fs.readdir(profilesDir);
    return files
      .filter(file => file.endsWith('_profile.json'))
      .map(file => file.replace('_profile.json', ''));
  } catch (error) {
    console.error('Error listing profiles:', error);
    return [];
  }
} 