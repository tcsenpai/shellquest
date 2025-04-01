import fs from 'fs/promises';
import path from 'path';
import { getCurrentGameState } from './gameState';
import { getTheme, successAnimation } from '../ui/visualEffects';
import { playSound } from '../ui/soundEffects';

// Define achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  secret?: boolean;
  unlocked: boolean;
  unlockedAt?: number;
}

// Define all achievements
export const achievements: Achievement[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first level',
    icon: '🏆',
    unlocked: false
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a level in under 60 seconds',
    icon: '⚡',
    unlocked: false
  },
  {
    id: 'no_hints',
    name: 'Solo Hacker',
    description: 'Complete a level without using hints',
    icon: '🧠',
    unlocked: false
  },
  {
    id: 'command_master',
    name: 'Command Master',
    description: 'Use at least 10 different commands in one level',
    icon: '💻',
    unlocked: false
  },
  {
    id: 'persistence',
    name: 'Persistence',
    description: 'Try at least 20 commands in a single level',
    icon: '🔨',
    unlocked: false
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Visit all directories in a file system level',
    icon: '🧭',
    unlocked: false
  },
  {
    id: 'easter_egg_hunter',
    name: 'Easter Egg Hunter',
    description: 'Find a hidden secret',
    icon: '🥚',
    secret: true,
    unlocked: false
  },
  {
    id: 'master_hacker',
    name: 'Master Hacker',
    description: 'Complete the game',
    icon: '👑',
    unlocked: false
  }
];

// Path to achievements file
const achievementsPath = path.join(process.cwd(), 'achievements.json');

// Load achievements from file
export async function loadAchievements(): Promise<Achievement[]> {
  try {
    const data = await fs.readFile(achievementsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, create it with default achievements
    await saveAchievements(achievements);
    return achievements;
  }
}

// Save achievements to file
export async function saveAchievements(achievements: Achievement[]): Promise<void> {
  try {
    await fs.writeFile(achievementsPath, JSON.stringify(achievements, null, 2));
  } catch (error) {
    console.error('Error saving achievements:', error);
  }
}

// Get player achievements
export async function getPlayerAchievements(playerName: string): Promise<Achievement[]> {
  const allAchievements = await loadAchievements();
  
  // Filter achievements for this player (in a real game, you'd store player-specific achievements)
  return allAchievements;
}

// Unlock an achievement
export async function unlockAchievement(achievementId: string): Promise<boolean> {
  const gameState = getCurrentGameState();
  if (!gameState) return false;
  
  // Load achievements
  const allAchievements = await loadAchievements();
  const achievement = allAchievements.find(a => a.id === achievementId);
  
  if (!achievement || achievement.unlocked) {
    return false; // Achievement doesn't exist or is already unlocked
  }
  
  // Unlock the achievement
  achievement.unlocked = true;
  achievement.unlockedAt = Date.now();
  
  // Save achievements
  await saveAchievements(allAchievements);
  
  // Show achievement notification
  const theme = getTheme();
  console.log('\n');
  console.log('╔' + '═'.repeat(50) + '╗');
  console.log('║ ' + theme.accent('Achievement Unlocked!').padEnd(48) + ' ║');
  console.log('║ ' + `${achievement.icon}  ${achievement.name}`.padEnd(48) + ' ║');
  console.log('║ ' + achievement.description.padEnd(48) + ' ║');
  console.log('╚' + '═'.repeat(50) + '╝');
  
  // Play sound
  playSound('success');
  
  return true;
}

// Check and potentially unlock achievements based on game events
export async function checkAchievements(event: string, data?: any): Promise<void> {
  const gameState = getCurrentGameState();
  if (!gameState) return;
  
  switch (event) {
    case 'level_completed':
      // First Steps achievement
      await unlockAchievement('first_steps');
      
      // Speed Demon achievement
      const levelState = gameState.levelStates[gameState.currentLevel];
      if (levelState && levelState.startTime) {
        const completionTime = Date.now() - levelState.startTime;
        if (completionTime < 60000) { // Less than 60 seconds
          await unlockAchievement('speed_demon');
        }
      }
      
      // No Hints achievement
      if (levelState && !levelState.usedHint) {
        await unlockAchievement('no_hints');
      }
      
      // Command Master achievement
      if (levelState && levelState.uniqueCommands && levelState.uniqueCommands.size >= 10) {
        await unlockAchievement('command_master');
      }
      
      // Persistence achievement
      if (levelState && levelState.commandCount && levelState.commandCount >= 20) {
        await unlockAchievement('persistence');
      }
      
      // Master Hacker achievement (game completed)
      const allLevels = data?.allLevels || [];
      if (gameState.currentLevel >= allLevels.length) {
        await unlockAchievement('master_hacker');
      }
      break;
      
    case 'hint_used':
      // Mark that hints were used for this level
      const currentLevel = gameState.currentLevel;
      if (!gameState.levelStates[currentLevel]) {
        gameState.levelStates[currentLevel] = {};
      }
      gameState.levelStates[currentLevel].usedHint = true;
      break;
      
    case 'command_used':
      // Track unique commands used
      const level = gameState.currentLevel;
      if (!gameState.levelStates[level]) {
        gameState.levelStates[level] = {};
      }
      
      if (!gameState.levelStates[level].uniqueCommands) {
        gameState.levelStates[level].uniqueCommands = new Set();
      }
      
      if (!gameState.levelStates[level].commandCount) {
        gameState.levelStates[level].commandCount = 0;
      }
      
      gameState.levelStates[level].uniqueCommands.add(data.command);
      gameState.levelStates[level].commandCount++;
      break;
      
    case 'easter_egg_found':
      await unlockAchievement('easter_egg_hunter');
      break;
      
    case 'all_directories_visited':
      await unlockAchievement('explorer');
      break;
  }
}

// Display achievements screen
export async function showAchievements(): Promise<void> {
  const gameState = getCurrentGameState();
  if (!gameState) return;
  
  const theme = getTheme();
  const allAchievements = await loadAchievements();
  
  console.clear();
  console.log(theme.accent('=== Achievements ==='));
  console.log('');
  
  // Group achievements by unlocked status
  const unlockedAchievements = allAchievements.filter(a => a.unlocked);
  const lockedAchievements = allAchievements.filter(a => !a.unlocked && !a.secret);
  const secretAchievements = allAchievements.filter(a => !a.unlocked && a.secret);
  
  // Display unlocked achievements
  console.log(theme.success('Unlocked Achievements:'));
  if (unlockedAchievements.length === 0) {
    console.log('  None yet. Keep playing!');
  } else {
    unlockedAchievements.forEach(a => {
      console.log(`  ${a.icon} ${theme.accent(a.name)} - ${a.description}`);
    });
  }
  
  console.log('');
  
  // Display locked achievements
  console.log(theme.secondary('Locked Achievements:'));
  if (lockedAchievements.length === 0) {
    console.log('  You\'ve unlocked all regular achievements!');
  } else {
    lockedAchievements.forEach(a => {
      console.log(`  ${a.icon} ${theme.accent(a.name)} - ${a.description}`);
    });
  }
  
  console.log('');
  
  // Display secret achievements (just show that they exist)
  console.log(theme.warning('Secret Achievements:'));
  secretAchievements.forEach(a => {
    console.log(`  ${a.icon} ${theme.accent('???')} - Find this secret achievement!`);
  });
  
  console.log('');
  console.log(`Total Progress: ${unlockedAchievements.length}/${allAchievements.length} achievements unlocked`);
}

// Add this function to the achievements.ts file
export async function triggerAchievement(
  eventType: 'level_completed' | 'hint_used' | 'command_used' | 'easter_egg_found' | 'all_directories_visited',
  data: any = {}
): Promise<void> {
  const gameState = getCurrentGameState();
  if (!gameState) return;
  
  // Process the event and check for achievements
  switch (eventType) {
    case 'level_completed':
      // First level completion
      if (data.levelId === 1) {
        await unlockAchievement('first_steps');
      }
      
      // Complete a level quickly
      if (data.timeSpent && data.timeSpent < 60) {
        await unlockAchievement('speed_demon');
      }
      
      // Complete a level without hints
      if (!data.usedHint) {
        await unlockAchievement('no_hints');
      }
      
      // Complete all levels
      if (data.levelId === data.allLevels) {
        await unlockAchievement('master_hacker');
      }
      break;
      
    case 'hint_used':
      // Track hint usage
      const currentLevel = gameState.currentLevel;
      if (!gameState.levelStates[currentLevel]) {
        gameState.levelStates[currentLevel] = {};
      }
      gameState.levelStates[currentLevel].usedHint = true;
      break;
      
    case 'command_used':
      // Track unique commands used
      const level = gameState.currentLevel;
      if (!gameState.levelStates[level]) {
        gameState.levelStates[level] = {};
      }
      
      if (!gameState.levelStates[level].uniqueCommands) {
        gameState.levelStates[level].uniqueCommands = new Set();
      }
      
      if (!gameState.levelStates[level].commandCount) {
        gameState.levelStates[level].commandCount = 0;
      }
      
      gameState.levelStates[level].uniqueCommands.add(data.command);
      gameState.levelStates[level].commandCount++;
      
      // Check for command master achievement
      if (gameState.levelStates[level].uniqueCommands.size >= 10) {
        await unlockAchievement('command_master');
      }
      
      // Check for persistence achievement
      if (gameState.levelStates[level].commandCount >= 20) {
        await unlockAchievement('persistence');
      }
      break;
      
    case 'easter_egg_found':
      await unlockAchievement('easter_egg_hunter');
      break;
      
    case 'all_directories_visited':
      await unlockAchievement('explorer');
      break;
  }
}

// Add this function to initialize achievements
export async function initializeAchievements(): Promise<void> {
  try {
    // Check if achievements file exists, if not create it
    if (!fs.existsSync(achievementsPath)) {
      await fs.writeFile(achievementsPath, JSON.stringify(achievements, null, 2));
    }
  } catch (error) {
    console.error('Error initializing achievements:', error);
  }
} 