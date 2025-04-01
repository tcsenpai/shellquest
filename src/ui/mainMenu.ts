import { createNewGame, loadGame } from '../core/gameState';
import { listSaves } from '../core/gameInit';
import { getLeaderboard, formatTime } from '../core/leaderboard';
import { startLevel, getAllLevels } from '../core/levelSystem';
import { renderGameUI } from './gameUI';
import { clearScreen, promptInput, styles, drawBox } from './uiHelpers';
import kleur from 'kleur';

// ASCII art logo
const LOGO = `
████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗     
╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║     
   ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║     
   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║     
   ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗
   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝
                                                                  
███████╗███████╗ ██████╗ █████╗ ██████╗ ███████╗                 
██╔════╝██╔════╝██╔════╝██╔══██╗██╔══██╗██╔════╝                 
█████╗  ███████╗██║     ███████║██████╔╝█████╗                   
██╔══╝  ╚════██║██║     ██╔══██║██╔═══╝ ██╔══╝                   
███████╗███████║╚██████╗██║  ██║██║     ███████╗                 
╚══════╝╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝     ╚══════╝                 
`;

export async function renderMainMenu(): Promise<void> {
  while (true) {
    clearScreen();
    console.log(kleur.cyan(LOGO));
    console.log(styles.subtitle('A Linux Terminal Escape Room Game'));
    console.log('');
    
    const menuOptions = [
      '1. ' + styles.command('New Game'),
      '2. ' + styles.command('Load Game'),
      '3. ' + styles.command('Leaderboard'),
      '4. ' + styles.command('Exit')
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
        console.log('Thanks for playing!');
        process.exit(0);
      default:
        console.log('Invalid option. Press Enter to continue...');
        await promptInput('');
    }
  }
}

async function newGameMenu(): Promise<void> {
  clearScreen();
  console.log('=== New Game ===');
  console.log('');
  
  const playerName = await promptInput('Enter your name: ');
  if (!playerName) {
    console.log('Name cannot be empty. Press Enter to return to main menu...');
    await promptInput('');
    return;
  }
  
  // Create new game state
  createNewGame(playerName);
  
  // Start the first level
  const levels = getAllLevels();
  if (levels.length > 0) {
    await startLevel(levels[0].id);
    await renderGameUI();
  } else {
    console.log('No levels available. Press Enter to return to main menu...');
    await promptInput('');
  }
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