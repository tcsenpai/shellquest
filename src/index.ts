#!/usr/bin/env bun

import { renderMainMenu } from './ui/mainMenu';
import { initializeGame } from './core/gameInit';
import { registerAllLevels } from './levels';

async function main() {
  // Initialize game systems
  await initializeGame();
  
  // Register all game levels
  registerAllLevels();
  
  // Render the main menu to start (which now includes the boot sequence)
  await renderMainMenu();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 