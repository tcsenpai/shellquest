import { getCurrentGameState, saveGame } from '../core/gameState';
import { getLevelById, completeCurrentLevel, getAllLevels } from '../core/levelSystem';
import { renderMainMenu } from './mainMenu';
import { clearScreen, promptInput } from './uiHelpers';
import { styles, drawBox, drawTable } from './uiHelpers';

export async function renderGameUI(): Promise<void> {
  const gameState = getCurrentGameState();
  if (!gameState) {
    console.error('No active game');
    await renderMainMenu();
    return;
  }
  
  // Game loop
  while (true) {
    // Get the current level at the start of each loop iteration
    const currentLevel = getLevelById(gameState.currentLevel);
    if (!currentLevel) {
      console.error(styles.error(`Level ${gameState.currentLevel} not found`));
      await renderMainMenu();
      return;
    }
    
    clearScreen();
    
    // Display game header
    console.log(drawBox(
      `TERMINAL ESCAPE - ${styles.title(currentLevel.name)}`,
      `Player: ${styles.highlight(gameState.playerName)}\nLevel: ${gameState.currentLevel}/${getAllLevels().length}`
    ));
    console.log('');
    
    // Render current level
    await currentLevel.render();
    
    console.log('');
    console.log('Available commands:');
    console.log(`${styles.command('/help')} - Show help, ${styles.command('/save')} - Save game, ${styles.command('/menu')} - Main menu, ${styles.command('/hint')} - Get a hint`);
    console.log('');
    
    // Get player input
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
        console.log('Game saved successfully!');
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
      console.log(result.message);
      await promptInput('Press Enter to continue...');
    }
    
    if (result.completed) {
      await completeCurrentLevel();
      
      if (result.nextAction === 'main_menu') {
        await renderMainMenu();
        return;
      } else if (result.nextAction === 'next_level') {
        const nextLevelId = gameState.currentLevel + 1;
        const nextLevel = getLevelById(nextLevelId);
        
        if (nextLevel) {
          gameState.currentLevel = nextLevelId;
          // We don't need to reassign currentLevel here since we'll get it at the start of the next loop
        } else {
          // Game completed
          clearScreen();
          console.log('Congratulations! You have completed all levels!');
          await promptInput('Press Enter to return to the main menu...');
          await renderMainMenu();
          return;
        }
      }
    }
  }
}

async function showHelp(): Promise<void> {
  clearScreen();
  console.log('=== Help ===');
  console.log('');
  console.log('Terminal Escape is a puzzle game where you solve Linux-themed challenges.');
  console.log('');
  console.log('Special Commands:');
  console.log('/help  - Show this help screen');
  console.log('/save  - Save your game');
  console.log('/menu  - Return to main menu');
  console.log('/hint  - Get a hint for the current level');
  console.log('');
  console.log('Each level has its own commands and puzzles to solve.');
  console.log('');
  await promptInput('Press Enter to continue...');
}

async function showHint(hints: string[]): Promise<void> {
  const gameState = getCurrentGameState();
  if (!gameState) return;
  
  // Get level state for hints
  const levelState = gameState.levelStates[gameState.currentLevel] || {};
  const hintIndex = levelState.hintIndex || 0;
  
  clearScreen();
  console.log('=== Hint ===');
  console.log('');
  
  if (hintIndex < hints.length) {
    console.log(hints[hintIndex]);
    
    // Update hint index for next time
    gameState.levelStates[gameState.currentLevel] = {
      ...levelState,
      hintIndex: hintIndex + 1
    };
  } else {
    console.log('No more hints available for this level.');
  }
  
  console.log('');
  await promptInput('Press Enter to continue...');
} 