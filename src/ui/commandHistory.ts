// Maximum number of commands to store in history
const MAX_HISTORY_SIZE = 50;

// Command history for each player
const commandHistories: Record<string, string[]> = {};
let currentHistoryIndex = -1;
let currentInput = '';

// Initialize command history for a player
export function initCommandHistory(playerName: string): void {
  if (!commandHistories[playerName]) {
    commandHistories[playerName] = [];
  }
  currentHistoryIndex = -1;
  currentInput = '';
}

// Add a command to history
export function addToHistory(playerName: string, command: string): void {
  if (!commandHistories[playerName]) {
    initCommandHistory(playerName);
  }
  
  // Don't add empty commands or duplicates of the last command
  if (command.trim() === '' || 
      (commandHistories[playerName].length > 0 && 
       commandHistories[playerName][0] === command)) {
    return;
  }
  
  // Add to the beginning of the array
  commandHistories[playerName].unshift(command);
  
  // Trim history if it gets too long
  if (commandHistories[playerName].length > MAX_HISTORY_SIZE) {
    commandHistories[playerName].pop();
  }
  
  // Reset index
  currentHistoryIndex = -1;
  currentInput = '';
}

// Get previous command from history
export function getPreviousCommand(playerName: string, currentCommand: string): string {
  if (!commandHistories[playerName] || commandHistories[playerName].length === 0) {
    return currentCommand;
  }
  
  // Save current input if we're just starting to navigate history
  if (currentHistoryIndex === -1) {
    currentInput = currentCommand;
  }
  
  // Move back in history
  currentHistoryIndex = Math.min(currentHistoryIndex + 1, commandHistories[playerName].length - 1);
  return commandHistories[playerName][currentHistoryIndex];
}

// Get next command from history
export function getNextCommand(playerName: string): string {
  if (!commandHistories[playerName] || currentHistoryIndex === -1) {
    return currentInput;
  }
  
  // Move forward in history
  currentHistoryIndex = Math.max(currentHistoryIndex - 1, -1);
  
  // Return original input if we've reached the end of history
  if (currentHistoryIndex === -1) {
    return currentInput;
  }
  
  return commandHistories[playerName][currentHistoryIndex];
}

// Get all commands in history
export function getCommandHistory(playerName: string): string[] {
  return commandHistories[playerName] || [];
}

// Clear command history
export function clearCommandHistory(playerName: string): void {
  commandHistories[playerName] = [];
  currentHistoryIndex = -1;
  currentInput = '';
} 