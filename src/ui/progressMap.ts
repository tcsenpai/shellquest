import { getAllLevels, getLevelById } from '../core/levelSystem';
import { getCurrentGameState } from '../core/gameState';
import { getTheme } from './visualEffects';

export function renderProgressMap(): void {
  const gameState = getCurrentGameState();
  if (!gameState) return;
  
  const theme = getTheme();
  const allLevels = getAllLevels();
  const currentLevelId = gameState.currentLevel;
  
  console.log(theme.accent('=== Progress Map ==='));
  console.log('');
  
  // Calculate the maximum level name length for formatting
  const maxNameLength = Math.max(...allLevels.map(level => level.name.length));
  
  // Create a visual map of levels
  console.log('┌' + '─'.repeat(maxNameLength + 22) + '┐');
  
  allLevels.forEach((level, index) => {
    const levelNumber = level.id;
    const isCurrentLevel = levelNumber === currentLevelId;
    const isCompleted = levelNumber < currentLevelId;
    const isLocked = levelNumber > currentLevelId;
    
    let statusIcon;
    let levelName;
    
    if (isCompleted) {
      statusIcon = theme.success('✓');
      levelName = theme.success(level.name.padEnd(maxNameLength));
    } else if (isCurrentLevel) {
      statusIcon = theme.accent('▶');
      levelName = theme.accent(level.name.padEnd(maxNameLength));
    } else if (isLocked) {
      statusIcon = theme.secondary('🔒');
      levelName = theme.secondary(level.name.padEnd(maxNameLength));
    }
    
    console.log(`│ ${statusIcon} Level ${levelNumber.toString().padStart(2)} │ ${levelName} │`);
    
    // Add connector line between levels
    if (index < allLevels.length - 1) {
      console.log('│ ' + ' '.repeat(maxNameLength + 20) + '│');
      console.log('│ ' + theme.secondary('│').padStart(7) + ' '.repeat(maxNameLength + 14) + '│');
      console.log('│ ' + theme.secondary('▼').padStart(7) + ' '.repeat(maxNameLength + 14) + '│');
      console.log('│ ' + ' '.repeat(maxNameLength + 20) + '│');
    }
  });
  
  console.log('└' + '─'.repeat(maxNameLength + 22) + '┘');
  
  // Show completion percentage
  const completedLevels = Math.max(0, currentLevelId - 1);
  const completionPercentage = Math.round((completedLevels / allLevels.length) * 100);
  
  console.log('');
  console.log(`Overall Progress: ${completedLevels}/${allLevels.length} levels completed (${completionPercentage}%)`);
  
  // Visual progress bar
  const progressBarWidth = 40;
  const filledWidth = Math.round((completionPercentage / 100) * progressBarWidth);
  const emptyWidth = progressBarWidth - filledWidth;
  
  const progressBar = '[' + 
    theme.success('='.repeat(filledWidth)) + 
    theme.secondary('-'.repeat(emptyWidth)) + 
    '] ' + completionPercentage + '%';
  
  console.log(progressBar);
} 