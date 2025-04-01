import { clearScreen, promptInput, drawBox } from './uiHelpers';
import { generateLogo, getTheme, bootSequence } from './visualEffects';
import { loadProfile, createProfile, listProfiles } from '../core/playerProfile';
import { createNewGame, loadGame } from '../core/gameState';
import { renderMainMenu } from './mainMenu';
import { successAnimation, loadingAnimation } from './visualEffects';
import { listSaves } from '../core/gameInit';

// Track if we've shown the boot sequence
let bootSequenceShown = false;

export async function renderEntryMenu(): Promise<void> {
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
      '3. ' + theme.accent('Exit')
    ];
    
    console.log(drawBox('WELCOME', menuOptions.join('\n')));
    console.log('');
    
    const choice = await promptInput('Select an option: ');
    
    if (choice === '1') {
      const success = await newGameMenu();
      if (success) {
        await renderMainMenu();
        return;
      }
    } else if (choice === '2') {
      const success = await loadGameMenu();
      if (success) {
        await renderMainMenu();
        return;
      }
    } else if (choice === '3') {
      console.log('Thanks for playing Terminal Escape!');
      process.exit(0);
    } else {
      console.log(theme.error('Invalid option. Press Enter to continue...'));
      await promptInput('');
    }
  }
}

async function newGameMenu(): Promise<boolean> {
  const theme = getTheme();
  
  clearScreen();
  console.log(theme.accent('=== NEW GAME ==='));
  console.log('');
  
  const playerName = await promptInput('Enter your name: ');
  
  if (!playerName) {
    console.log(theme.error('Name cannot be empty.'));
    await promptInput('Press Enter to continue...');
    return false;
  }
  
  await loadingAnimation('Creating new game...', 1000);
  
  // Create a new game state
  const gameState = createNewGame(playerName);
  
  await successAnimation('Game created successfully!');
  return true;
}

async function loadGameMenu(): Promise<boolean> {
  const theme = getTheme();
  
  clearScreen();
  console.log(theme.accent('=== LOAD GAME ==='));
  console.log('');
  
  // Get list of save files (just player names)
  const saveFiles = await listSaves();
  
  if (saveFiles.length === 0) {
    console.log(theme.warning('No saved games found.'));
    await promptInput('Press Enter to continue...');
    return false;
  }
  
  console.log('Available players:');
  saveFiles.forEach((save, index) => {
    console.log(`${index + 1}. ${theme.accent(save)}`);
  });
  console.log('');
  
  const choice = await promptInput('Select a player (or 0 to cancel): ');
  const choiceNum = parseInt(choice);
  
  if (choiceNum === 0 || isNaN(choiceNum) || choiceNum > saveFiles.length) {
    return false;
  }
  
  const playerName = saveFiles[choiceNum - 1];
  
  // Try to load the save
  await loadingAnimation('Loading game...', 1000);
  const success = await loadGame(playerName);
  
  if (success) {
    await successAnimation('Game loaded successfully!');
    return true;
  } else {
    console.log(theme.error('Failed to load game.'));
    await promptInput('Press Enter to continue...');
    return false;
  }
} 