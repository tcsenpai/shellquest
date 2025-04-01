import { Level, LevelResult, registerLevel } from '../core/levelSystem';
import { getCurrentGameState } from '../core/gameState';

const level: Level = {
  id: 1,
  name: 'The Locked Terminal',
  description: 'You find yourself in front of a locked terminal. You need to find the password to proceed.',
  
  async initialize() {
    const gameState = getCurrentGameState();
    if (!gameState) return;
    
    // Initialize level state if not already present
    if (!gameState.levelStates[this.id]) {
      gameState.levelStates[this.id] = {
        attempts: 0,
        foundClue1: false,
        foundClue2: false
      };
    }
  },
  
  async render() {
    const gameState = getCurrentGameState();
    if (!gameState) return;
    
    const levelState = gameState.levelStates[this.id];
    
    console.log('You find yourself in a dimly lit room with a computer terminal.');
    console.log('The screen shows a password prompt, and you need to get in.');
    console.log('');
    console.log('The terminal reads:');
    console.log('');
    console.log('  ╔════════════════════════════════════╗');
    console.log('  ║ SYSTEM LOCKED                      ║');
    console.log('  ║                                    ║');
    console.log('  ║ Enter password:                    ║');
    console.log('  ║ Hint: The admin loves penguins     ║');
    console.log('  ╚════════════════════════════════════╝');
    console.log('');
    
    if (levelState.foundClue1) {
      console.log('You found a sticky note that says: "The password is the mascot\'s name"');
    }
    
    if (levelState.foundClue2) {
      console.log('You found a book about Linux with a page bookmarked about Tux.');
    }
    
    console.log('');
    console.log('Commands: "look around", "check desk", "check drawer", "enter [password]"');
  },
  
  async handleInput(input: string): Promise<LevelResult> {
    const gameState = getCurrentGameState();
    if (!gameState) {
      return { completed: false };
    }
    
    const levelState = gameState.levelStates[this.id];
    const command = input.toLowerCase().trim();
    
    if (command === 'look around') {
      return {
        completed: false,
        message: 'You see a desk with a computer on it. There\'s a drawer in the desk and some books on a shelf.'
      };
    }
    
    if (command === 'check desk') {
      levelState.foundClue1 = true;
      return {
        completed: false,
        message: 'You found a sticky note that says: "The password is the mascot\'s name"'
      };
    }
    
    if (command === 'check drawer') {
      levelState.foundClue2 = true;
      return {
        completed: false,
        message: 'You found a book about Linux with a page bookmarked about Tux.'
      };
    }
    
    if (command.startsWith('enter ')) {
      const password = command.substring(6).trim().toLowerCase();
      levelState.attempts++;
      
      if (password === 'tux') {
        return {
          completed: true,
          message: 'Access granted! The terminal unlocks, revealing the next challenge.',
          nextAction: 'next_level'
        };
      } else {
        return {
          completed: false,
          message: `Incorrect password. The system rejects your attempt. (Attempt ${levelState.attempts})`
        };
      }
    }
    
    return {
      completed: false,
      message: 'Unknown command. Try something else.'
    };
  },
  
  hints: [
    'Try looking around the room for clues.',
    'The password is related to Linux.',
    'Tux is the Linux mascot - a penguin.'
  ]
};

export function registerLevel1() {
  registerLevel(level);
} 