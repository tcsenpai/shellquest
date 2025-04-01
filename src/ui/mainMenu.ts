import { createNewGame, loadGame, getCurrentGameState } from '../core/gameState';
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
import { renderEntryMenu } from './entryMenu';

// Track if we've shown the boot sequence
let bootSequenceShown = false;

// Initialize sound system in the main menu
initSoundSystem();

export async function renderMainMenu(): Promise<void> {
  const gameState = getCurrentGameState();
  if (!gameState) {
    // If no game state, go back to entry menu
    await renderEntryMenu();
    return;
  }
  
  const theme = getTheme();
  
  while (true) {
    clearScreen();
    console.log(generateLogo());
    console.log(theme.secondary('A Linux Terminal Escape Room Game'));
    console.log('');
    
    const menuOptions = [
      '1. ' + theme.accent('Continue Game'),
      '2. ' + theme.accent('Achievements'),
      '3. ' + theme.accent('Progress Map'),
      '4. ' + theme.accent('Leaderboard'),
      '5. ' + theme.accent('Settings'),
      '6. ' + theme.accent('Back to Entry Menu'),
      '7. ' + theme.accent('Exit')
    ];
    
    console.log(drawBox('MAIN MENU', menuOptions.join('\n')));
    console.log('');
    console.log(theme.info(`Player: ${gameState.playerName}`));
    console.log('');
    
    const choice = await promptInput('Select an option: ');
    
    if (choice === '1') {
      // Continue game
      startLevel(gameState.currentLevel);
      await renderGameUI();
    } else if (choice === '2') {
      // Show achievements
      await showAchievements();
      await promptInput('Press Enter to continue...');
    } else if (choice === '3') {
      // Show progress map
      clearScreen();
      await renderProgressMap();
      await promptInput('Press Enter to continue...');
    } else if (choice === '4') {
      // Show leaderboard
      await showLeaderboard();
    } else if (choice === '5') {
      // Settings
      await showSettings();
    } else if (choice === '6') {
      // Back to entry menu
      await renderEntryMenu();
      return;
    } else if (choice === '7') {
      // Exit
      await animateText('Thanks for playing Terminal Escape!', 30);
      process.exit(0);
    } else {
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

async function showLeaderboard(): Promise<void> {
  const theme = getTheme();
  
  clearScreen();
  console.log(theme.accent('=== LEADERBOARD ==='));
  console.log('');
  
  const leaderboard = await getLeaderboard();
  
  if (leaderboard.players.length === 0) {
    console.log(theme.warning('No entries yet. Be the first to complete the game!'));
  } else {
    console.log('Top Players:');
    console.log('-----------');
    leaderboard.players.slice(0, 10).forEach((entry, index) => {
      console.log(`${index + 1}. ${theme.accent(entry.playerName)} - ${formatTime(entry.completionTime)}`);
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