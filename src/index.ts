#!/usr/bin/env bun

import { renderEntryMenu } from './ui/entryMenu';
import { initializeGame } from './core/gameInit';
import { registerAllLevels } from './levels';
import { initializeAchievements } from './core/achievements';

async function main() {
  // Initialize game systems
  await initializeGame();
  
  // Initialize achievements
  await initializeAchievements();
  
  // Register all game levels
  registerAllLevels();
  
  // Render the entry menu to start
  await renderEntryMenu();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 