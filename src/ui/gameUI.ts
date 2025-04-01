import { getCurrentGameState, saveGame } from '../core/gameState';
import { getLevelById, completeCurrentLevel, getAllLevels } from '../core/levelSystem';
import { renderMainMenu } from './mainMenu';
import { clearScreen, promptInput, styles, drawBox, drawTable } from './uiHelpers';
import { 
  getTheme, 
  successAnimation, 
  typewriter,
  loadingAnimation
} from './visualEffects';
import { playSound } from './soundEffects';
import { levelUI } from './levelRenderer';

export async function renderGameUI(): Promise<void> {
  const gameState = getCurrentGameState();
  if (!gameState) {
    console.error(styles.error('No active game'));
    await renderMainMenu();
    return;
  }
  
  const theme = getTheme();
  
  // Game loop
  while (true) {
    // Get the current level at the start of each loop iteration
    const currentLevel = getLevelById(gameState.currentLevel);
    if (!currentLevel) {
      console.error(theme.error(`Level ${gameState.currentLevel} not found`));
      await renderMainMenu();
      return;
    }
    
    clearScreen();
    
    // Display game header
    console.log(drawBox(
      `TERMINAL ESCAPE - ${theme.accent(currentLevel.name)}`,
      `Player: ${theme.accent(gameState.playerName)}\nLevel: ${gameState.currentLevel}/${getAllLevels().length}`
    ));
    console.log('');
    
    // Render current level in a box
    await levelUI.levelContent(currentLevel.name, async () => {
      await currentLevel.render();
    });
    
    console.log('');
    console.log(theme.secondary('Available commands:'));
    console.log(`${theme.accent('/help')} - Show help, ${theme.accent('/save')} - Save game, ${theme.accent('/menu')} - Main menu, ${theme.accent('/hint')} - Get a hint`);
    console.log('');
    
    // Display input box and get player input
    levelUI.inputBox();
    const input = await promptInput('');
    
    // Handle special commands
    if (input.startsWith('/')) {
      const command = input.slice(1).toLowerCase();
      
      if (command === 'help') {
        await showHelp();
        continue;
      }
      
      if (command === 'save') {
        await saveGame();
        await successAnimation('Game saved successfully!');
        await promptInput('Press Enter to continue...');
        continue;
      }
      
      if (command === 'menu') {
        await renderMainMenu();
        return;
      }
      
      if (command === 'hint') {
        await showHint(currentLevel.hints);
        continue;
      }
    }
    
    // Process level-specific input
    const result = await currentLevel.handleInput(input);
    
    if (result.message) {
      console.log('');
      await typewriter(result.message, 5);
      await promptInput('Press Enter to continue...');
    }
    
    if (result.completed) {
      playSound('levelComplete');
      await completeCurrentLevel();
      await successAnimation('Level completed!');
      
      if (result.nextAction === 'main_menu') {
        await renderMainMenu();
        return;
      } else if (result.nextAction === 'next_level') {
        const nextLevelId = gameState.currentLevel + 1;
        const nextLevel = getLevelById(nextLevelId);
        
        if (nextLevel) {
          gameState.currentLevel = nextLevelId;
          await loadingAnimation('Loading next level...', 1500);
        } else {
          // Game completed
          clearScreen();
          console.log(theme.success('🎉 Congratulations! You have completed all levels! 🎉'));
          await typewriter('You have proven yourself to be a master of the terminal.', 20);
          await promptInput('Press Enter to return to the main menu...');
          await renderMainMenu();
          return;
        }
      }
    }
  }
}

async function showHelp(): Promise<void> {
  const theme = getTheme();
  
  clearScreen();
  console.log(theme.accent('=== Help ==='));
  console.log('');
  console.log('Terminal Escape is a puzzle game where you solve Linux-themed challenges.');
  console.log('');
  console.log(theme.secondary('Special Commands:'));
  console.log(`${theme.accent('/help')}  - Show this help screen`);
  console.log(`${theme.accent('/save')}  - Save your game`);
  console.log(`${theme.accent('/menu')}  - Return to main menu`);
  console.log(`${theme.accent('/hint')}  - Get a hint for the current level`);
  console.log('');
  console.log('Each level has its own commands and puzzles to solve.');
  console.log('');
  await promptInput('Press Enter to continue...');
}

async function showHint(hints: string[]): Promise<void> {
  const gameState = getCurrentGameState();
  if (!gameState) return;
  
  const theme = getTheme();
  
  // Get level state for hints
  const levelState = gameState.levelStates[gameState.currentLevel] || {};
  const hintIndex = levelState.hintIndex || 0;
  
  clearScreen();
  console.log(theme.accent('=== Hint ==='));
  console.log('');
  
  if (hintIndex < hints.length) {
    await typewriter(hints[hintIndex], 20);
    
    // Update hint index for next time
    gameState.levelStates[gameState.currentLevel] = {
      ...levelState,
      hintIndex: hintIndex + 1
    };
  } else {
    console.log(theme.warning('No more hints available for this level.'));
  }
  
  console.log('');
  await promptInput('Press Enter to continue...');
} 