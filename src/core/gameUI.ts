// Add a status message system
let statusMessage = '';
let statusMessageTimeout: NodeJS.Timeout | null = null;

// Function to set a temporary status message
function setStatusMessage(message: string, duration = 3000): void {
  statusMessage = message;
  
  // Clear any existing timeout
  if (statusMessageTimeout) {
    clearTimeout(statusMessageTimeout);
  }
  
  // Set a timeout to clear the message
  statusMessageTimeout = setTimeout(() => {
    statusMessage = '';
    // Redraw the UI if needed
    renderPrompt();
  }, duration);
}

// Function to render the command prompt with status message
function renderPrompt(): void {
  // Clear the current line
  process.stdout.write('\r\x1b[K');
  
  // If there's a status message, show it above the prompt
  if (statusMessage) {
    console.log(statusMessage);
    statusMessage = ''; // Clear it after showing
  }
  
  // Show the prompt
  process.stdout.write('> ');
}

// Update the auto-save function call
const saveResult = await autoSave();
if (saveResult.success) {
  setStatusMessage(saveResult.message);
} 