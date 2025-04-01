import { Level, LevelResult, registerLevel } from '../core/levelSystem';
import { getCurrentGameState } from '../core/gameState';

const level: Level = {
  id: 4,
  name: 'Permissions Puzzle',
  description: 'Fix file permissions to access a protected file.',
  
  async initialize() {
    const gameState = getCurrentGameState();
    if (!gameState) return;
    
    // Initialize level state if not already present
    if (!gameState.levelStates[this.id]) {
      gameState.levelStates[this.id] = {
        files: [
          { name: 'README.txt', permissions: 'rw-r--r--', owner: 'user', group: 'user' },
          { name: 'secret_data.db', permissions: '----------', owner: 'root', group: 'root' },
          { name: 'change_permissions.sh', permissions: 'r--------', owner: 'user', group: 'user' },
          { name: 'access_key.bin', permissions: 'rw-------', owner: 'root', group: 'user' }
        ],
        currentUser: 'user',
        sudoAvailable: false,
        scriptExecutable: false,
        accessKeyReadable: false
      };
    }
  },
  
  async render() {
    const gameState = getCurrentGameState();
    if (!gameState) return;
    
    // Make sure level state is initialized
    if (!gameState.levelStates[this.id]) {
      await this.initialize();
    }
    
    const levelState = gameState.levelStates[this.id];
    
    console.log('You need to access the protected files to proceed.');
    console.log(`Current user: ${levelState.currentUser}`);
    console.log('');
    
    console.log('Files in current directory:');
    console.log('PERMISSIONS  OWNER  GROUP  FILENAME');
    console.log('----------------------------------------');
    
    levelState.files.forEach(file => {
      console.log(
        `${file.permissions}  ${file.owner.padEnd(6)}${file.group.padEnd(7)}${file.name}`
      );
    });
    
    console.log('');
    console.log('Commands: "ls", "cat [file]", "chmod [permissions] [file]", "sudo [command]", "sh [script]"');
  },
  
  async handleInput(input: string): Promise<LevelResult> {
    const gameState = getCurrentGameState();
    if (!gameState) {
      return { completed: false };
    }
    
    // Make sure level state is initialized
    if (!gameState.levelStates[this.id]) {
      await this.initialize();
    }
    
    const levelState = gameState.levelStates[this.id];
    const command = input.trim();
    
    // Split command into parts
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    
    if (cmd === 'ls') {
      // Just show files again (same as render)
      return {
        completed: false,
        message: 'File list displayed.'
      };
    }
    
    if (cmd === 'cat' && parts.length > 1) {
      const fileName = parts[1];
      const file = levelState.files.find(f => f.name === fileName);
      
      if (!file) {
        return {
          completed: false,
          message: `File ${fileName} not found.`
        };
      }
      
      // Check if user has read permission
      const canRead = (levelState.currentUser === file.owner && file.permissions[0] === 'r') ||
                      (levelState.currentUser !== file.owner && 
                       levelState.currentUser === file.group && file.permissions[3] === 'r') ||
                      (levelState.currentUser !== file.owner && 
                       levelState.currentUser !== file.group && file.permissions[6] === 'r') ||
                      (levelState.currentUser === 'root'); // root can read anything
      
      if (!canRead) {
        return {
          completed: false,
          message: `Permission denied: Cannot read ${fileName}`
        };
      }
      
      // Return file contents based on filename
      if (fileName === 'README.txt') {
        return {
          completed: false,
          message: `File contents:\n\nWelcome to the permissions puzzle!\n\nYou need to:\n1. Make the script executable\n2. Run the script to gain sudo access\n3. Access the protected data`
        };
      } else if (fileName === 'secret_data.db') {
        return {
          completed: true,
          message: `File contents:\n\nCONGRATULATIONS!\nYou've successfully navigated the permissions puzzle and accessed the protected data.\n\nProceeding to next level...`,
          nextAction: 'next_level'
        };
      } else if (fileName === 'change_permissions.sh') {
        return {
          completed: false,
          message: `File contents:\n\n#!/bin/bash\n# This script grants sudo access\necho "Granting temporary sudo access..."\n# More script content here...`
        };
      } else if (fileName === 'access_key.bin') {
        levelState.accessKeyReadable = true;
        return {
          completed: false,
          message: `File contents:\n\nBINARY DATA: sudo_access_granted=true\n\nYou can now use sudo commands!`
        };
      }
    }
    
    if (cmd === 'chmod' && parts.length > 2) {
      const permissions = parts[1];
      const fileName = parts[2];
      const file = levelState.files.find(f => f.name === fileName);
      
      if (!file) {
        return {
          completed: false,
          message: `File ${fileName} not found.`
        };
      }
      
      // Check if user has permission to change permissions
      const canModify = (levelState.currentUser === file.owner) || 
                        (levelState.currentUser === 'root');
      
      if (!canModify) {
        return {
          completed: false,
          message: `Permission denied: Cannot modify permissions of ${fileName}`
        };
      }
      
      // Simple permission handling (just for the game)
      if (permissions === '+x' || permissions === 'u+x') {
        // Make executable for owner
        const newPerms = file.permissions.split('');
        newPerms[2] = 'x';
        file.permissions = newPerms.join('');
        
        if (fileName === 'change_permissions.sh') {
          levelState.scriptExecutable = true;
        }
        
        return {
          completed: false,
          message: `Changed permissions of ${fileName} to ${file.permissions}`
        };
      } else if (permissions === '+r' || permissions === 'g+r') {
        // Make readable for group
        const newPerms = file.permissions.split('');
        newPerms[3] = 'r';
        file.permissions = newPerms.join('');
        
        return {
          completed: false,
          message: `Changed permissions of ${fileName} to ${file.permissions}`
        };
      } else {
        // For simplicity, just update the permissions string
        file.permissions = permissions.length === 10 ? permissions : file.permissions;
        return {
          completed: false,
          message: `Changed permissions of ${fileName} to ${file.permissions}`
        };
      }
    }
    
    if (cmd === 'sh' && parts.length > 1) {
      const scriptName = parts[1];
      const file = levelState.files.find(f => f.name === scriptName);
      
      if (!file) {
        return {
          completed: false,
          message: `Script ${scriptName} not found.`
        };
      }
      
      // Check if script is executable
      const canExecute = file.permissions[2] === 'x';
      
      if (!canExecute) {
        return {
          completed: false,
          message: `Permission denied: Cannot execute ${scriptName}. Make it executable first.`
        };
      }
      
      if (scriptName === 'change_permissions.sh') {
        levelState.sudoAvailable = true;
        return {
          completed: false,
          message: `Executing ${scriptName}...\n\nGranting temporary sudo access...\nYou can now use sudo commands!`
        };
      }
      
      return {
        completed: false,
        message: `Executed ${scriptName}, but nothing happened.`
      };
    }
    
    if (cmd === 'sudo' && parts.length > 1) {
      if (!levelState.sudoAvailable && !levelState.accessKeyReadable) {
        return {
          completed: false,
          message: `sudo: command not found. You need to gain sudo access first.`
        };
      }
      
      // Handle sudo commands
      const sudoCmd = parts[1].toLowerCase();
      
      if (sudoCmd === 'cat' && parts.length > 2) {
        const fileName = parts[2];
        const file = levelState.files.find(f => f.name === fileName);
        
        if (!file) {
          return {
            completed: false,
            message: `File ${fileName} not found.`
          };
        }
        
        // With sudo, we can read any file
        if (fileName === 'secret_data.db') {
          return {
            completed: true,
            message: `File contents:\n\nCONGRATULATIONS!\nYou've successfully navigated the permissions puzzle and accessed the protected data.\n\nProceeding to next level...`,
            nextAction: 'next_level'
          };
        } else {
          return {
            completed: false,
            message: `File contents of ${fileName} displayed with sudo privileges.`
          };
        }
      } else if (sudoCmd === 'chmod' && parts.length > 3) {
        const permissions = parts[2];
        const fileName = parts[3];
        const file = levelState.files.find(f => f.name === fileName);
        
        if (!file) {
          return {
            completed: false,
            message: `File ${fileName} not found.`
          };
        }
        
        // With sudo, we can change any permissions
        file.permissions = permissions.length === 10 ? permissions : 'rw-r--r--';
        
        return {
          completed: false,
          message: `Changed permissions of ${fileName} to ${file.permissions} with sudo privileges.`
        };
      }
    }
    
    return {
      completed: false,
      message: 'Unknown command or invalid syntax.'
    };
  },
  
  hints: [
    'First read the README.txt file to understand what you need to do.',
    'You need to make the script executable with "chmod +x change_permissions.sh"',
    'After making the script executable, run it with "sh change_permissions.sh"',
    'Once you have sudo access, you can access any file with "sudo cat secret_data.db"',
    'Alternatively, you can make the access_key.bin readable by your group with "chmod g+r access_key.bin"'
  ]
};

export function registerLevel4() {
  registerLevel(level);
} 