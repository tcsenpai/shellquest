import { createNewGame, loadGame } from '../core/gameState';
import { listSaves } from '../core/gameInit';
import { getLeaderboard, formatTime } from '../core/leaderboard';
import { startLevel, getAllLevels } from '../core/levelSystem';
import { renderGameUI } from './gameUI';
import { clearScreen, promptInput, styles, drawBox } from './uiHelpers';
import { 
  generateLogo, 
  getTheme, 
  setTheme, 
  themes, 
  bootSequence,
  animateText,
  successAnimation,
  loadingAnimation
} from './visualEffects';
import { showAchievements } from '../core/achievements';
import { renderProgressMap } from './progressMap';
import { 
  toggleSound, 
  toggleAmbientSound, 
  toggleSoundEffects, 
  setSoundVolume,
  soundConfig,
  initSoundSystem
} from './soundEffects';
import { addToHistory } from './commandHistory';

// Track if we've shown the boot sequence
let bootSequenceShown = false;

// Initialize sound system in the main menu
initSoundSystem();

export async function renderMainMenu(): Promise<void> {
  // Show boot sequence only once
  if (!bootSequenceShown) {
    await bootSequence();
    bootSequenceShown = true;
  } else {
    clearScreen();
    console.log(generateLogo());
    console.log('');
  }
  
  const theme = getTheme();
  
  while (true) {
    clearScreen();
    console.log(generateLogo());
    console.log(theme.secondary('A Linux Terminal Escape Room Game'));
    console.log('');
    
    const menuOptions = [
      '1. ' + theme.accent('New Game'),
      '2. ' + theme.accent('Load Game'),
      '3. ' + theme.accent('Leaderboard'),
      '4. ' + theme.accent('Achievements'),
      '5. ' + theme.accent('Progress Map'),
      '6. ' + theme.accent('Settings'),
      '7. ' + theme.accent('Exit')
    ];
    
    console.log(drawBox('MAIN MENU', menuOptions.join('\n')));
    console.log('');
    
    const choice = await promptInput('Select an option: ');
    
    switch (choice) {
      case '1':
        await newGameMenu();
        break;
      case '2':
        await loadGameMenu();
        break;
      case '3':
        await showLeaderboard();
        break;
      case '4':
        await showAchievements();
        await promptInput('Press Enter to continue...');
        break;
      case '5':
        clearScreen();
        renderProgressMap();
        await promptInput('Press Enter to continue...');
        break;
      case '6':
        await showSettings();
        break;
      case '7':
        await animateText('Thanks for playing Terminal Escape!', 30);
        process.exit(0);
      default:
        console.log(theme.error('Invalid option. Press Enter to continue...'));
        await promptInput('');
    }
  }
}

// Add a new settings menu
async function showSettings(): Promise<void> {
  const theme = getTheme();
  
  while (true) {
    clearScreen();
    console.log(theme.accent('=== SETTINGS ==='));
    console.log('');
    
    console.log('1. ' + theme.accent('Change Theme'));
    console.log('2. ' + theme.accent('Back to Main Menu'));
    console.log('');
    
    const choice = await promptInput('Select an option: ');
    
    if (choice === '1') {
      await changeTheme();
    } else if (choice === '2') {
      return;
    } else {
      console.log(theme.error('Invalid option. Press Enter to continue...'));
      await promptInput('');
    }
  }
}

// Add a theme selection menu
async function changeTheme(): Promise<void> {
  const theme = getTheme();
  
  clearScreen();
  console.log(theme.accent('=== SELECT THEME ==='));
  console.log('');
  
  Object.keys(themes).forEach((themeName, index) => {
    console.log(`${index + 1}. ${theme.accent(themes[themeName].name)}`);
  });
  
  console.log('');
  const choice = await promptInput('Select a theme: ');
  const themeIndex = parseInt(choice) - 1;
  
  if (themeIndex >= 0 && themeIndex < Object.keys(themes).length) {
    const selectedTheme = Object.keys(themes)[themeIndex] as keyof typeof themes;
    setTheme(selectedTheme);
    await successAnimation('Theme changed successfully!');
  } else {
    console.log(theme.error('Invalid theme selection.'));
    await promptInput('Press Enter to continue...');
  }
}

// Update the existing functions to use the current theme
async function newGameMenu(): Promise<void> {
  const theme = getTheme();
  
  clearScreen();
  console.log(theme.accent('=== NEW GAME ==='));
  console.log('');
  
  const playerName = await promptInput('Enter your name: ');
  
  if (!playerName) {
    console.log(theme.error('Name cannot be empty.'));
    await promptInput('Press Enter to continue...');
    return;
  }
  
  await loadingAnimation('Creating new game...', 1000);
  
  const gameState = createNewGame(playerName);
  startLevel(gameState.currentLevel);
  
  await renderGameUI();
}

async function loadGameMenu(): Promise<void> {
  clearScreen();
  console.log('=== Load Game ===');
  console.log('');
  
  const saves = await listSaves();
  if (saves.length === 0) {
    console.log('No saved games found. Press Enter to return to main menu...');
    await promptInput('');
    return;
  }
  
  console.log('Available saves:');
  saves.forEach((save, index) => {
    console.log(`${index + 1}. ${save.replace('.json', '')}`);
  });
  console.log('');
  
  const choice = await promptInput('Select a save to load (or 0 to cancel): ');
  const choiceNum = parseInt(choice);
  
  if (choiceNum === 0 || isNaN(choiceNum) || choiceNum > saves.length) {
    return;
  }
  
  const saveName = saves[choiceNum - 1].replace('.json', '');
  const success = await loadGame(saveName);
  
  if (success) {
    await renderGameUI();
  } else {
    console.log('Failed to load game. Press Enter to return to main menu...');
    await promptInput('');
  }
}

async function showLeaderboard(): Promise<void> {
  clearScreen();
  console.log('=== Leaderboard ===');
  console.log('');
  
  const leaderboard = await getLeaderboard();
  
  if (leaderboard.players.length === 0) {
    console.log('No entries yet. Be the first to complete the game!');
  } else {
    console.log('Top Players:');
    console.log('-----------');
    leaderboard.players.slice(0, 10).forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.playerName} - ${formatTime(entry.completionTime)}`);
    });
  }
  
  console.log('');
  await promptInput('Press Enter to return to main menu...');
}

// Add this function to the mainMenu.ts file
async function soundSettings(): Promise<void> {
  const theme = getTheme();
  
  while (true) {
    clearScreen();
    console.log(theme.accent('=== SOUND SETTINGS ==='));
    console.log('');
    
    console.log(`1. Sound: ${soundConfig.enabled ? theme.success('ON') : theme.error('OFF')}`);
    console.log(`2. Ambient Sound: ${soundConfig.ambientEnabled ? theme.success('ON') : theme.error('OFF')}`);
    console.log(`3. Sound Effects: ${soundConfig.effectsEnabled ? theme.success('ON') : theme.error('OFF')}`);
    console.log(`4. Volume: ${Math.round(soundConfig.volume * 100)}%`);
    console.log('5. Back to Settings');
    console.log('');
    
    const choice = await promptInput('Select an option: ');
    
    switch (choice) {
      case '1':
        toggleSound();
        break;
      case '2':
        toggleAmbientSound();
        break;
      case '3':
        toggleSoundEffects();
        break;
      case '4':
        await changeVolume();
        break;
      case '5':
        return;
      default:
        console.log(theme.error('Invalid option. Press Enter to continue...'));
        await promptInput('');
    }
  }
}

// Add this function to change volume
async function changeVolume(): Promise<void> {
  const theme = getTheme();
  
  clearScreen();
  console.log(theme.accent('=== VOLUME SETTINGS ==='));
  console.log('');
  
  console.log('Current volume: ' + Math.round(soundConfig.volume * 100) + '%');
  console.log('Enter a value between 0 and 100:');
  
  const input = await promptInput('');
  const volume = parseInt(input);
  
  if (isNaN(volume) || volume < 0 || volume > 100) {
    console.log(theme.error('Invalid volume. Please enter a number between 0 and 100.'));
    await promptInput('Press Enter to continue...');
    return;
  }
  
  setSoundVolume(volume / 100);
  console.log(theme.success(`Volume set to ${volume}%`));
  await promptInput('Press Enter to continue...');
} 