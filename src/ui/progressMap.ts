import { getAllLevels } from '../core/levelSystem';
import { getCurrentProfile } from '../core/playerProfile';
import { getTheme } from './visualEffects';

export async function renderProgressMap(): Promise<void> {
  const profile = await getCurrentProfile();
  if (!profile) {
    console.log('No active player profile. Please start a game first.');
    return;
  }
  
  const theme = getTheme();
  const allLevels = getAllLevels();
  const completedLevels = profile.completedLevels;
  const currentLevelId = Math.max(...completedLevels) + 1;
  
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
  const completedLevelsCount = completedLevels.length;
  const completionPercentage = Math.round((completedLevelsCount / allLevels.length) * 100);
  
  console.log('');
  console.log(`Overall Progress: ${completedLevelsCount}/${allLevels.length} levels completed (${completionPercentage}%)`);
  
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