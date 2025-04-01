import { Level, LevelResult, registerLevel } from '../core/levelSystem';
import { getCurrentGameState } from '../core/gameState';

const level: Level = {
  id: 3,
  name: 'Process Control',
  description: 'Manage system processes to unlock the next level.',
  
  async initialize() {
    const gameState = getCurrentGameState();
    if (!gameState) return;
    
    // Initialize level state if not already present
    if (!gameState.levelStates[this.id]) {
      gameState.levelStates[this.id] = {
        processes: [
          { pid: 1, name: 'systemd', cpu: 0.1, memory: 4.2, status: 'running' },
          { pid: 423, name: 'sshd', cpu: 0.0, memory: 1.1, status: 'running' },
          { pid: 587, name: 'nginx', cpu: 0.2, memory: 2.3, status: 'running' },
          { pid: 842, name: 'malware.bin', cpu: 99.7, memory: 85.5, status: 'running' },
          { pid: 967, name: 'bash', cpu: 0.0, memory: 0.5, status: 'running' },
          { pid: 1024, name: 'firewall', cpu: 0.1, memory: 1.8, status: 'stopped' }
        ],
        firewallStarted: false,
        malwareKilled: false
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
    
    console.log('You\'ve gained access to the system\'s process manager.');
    console.log('Something seems to be consuming a lot of resources.');
    console.log('You need to stop the malicious process and start the firewall.');
    console.log('');
    
    console.log('Current processes:');
    console.log('PID    NAME         CPU%    MEM%    STATUS');
    console.log('--------------------------------------------');
    
    levelState.processes.forEach(proc => {
      console.log(
        `${proc.pid.toString().padEnd(7)}${proc.name.padEnd(13)}${proc.cpu.toFixed(1).padEnd(8)}${proc.memory.toFixed(1).padEnd(8)}${proc.status}`
      );
    });
    
    console.log('');
    console.log('System status: ' + (levelState.malwareKilled && levelState.firewallStarted ? 
                                    'SECURE' : 'VULNERABLE'));
    console.log('');
    console.log('Commands: "ps", "kill [pid]", "start [pid]", "info [pid]"');
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
    
    if (cmd === 'ps') {
      // Just show processes again (same as render)
      return {
        completed: false,
        message: 'Process list displayed.'
      };
    }
    
    if (cmd === 'kill' && parts.length > 1) {
      const pid = parseInt(parts[1]);
      const process = levelState.processes.find(p => p.pid === pid);
      
      if (!process) {
        return {
          completed: false,
          message: `No process with PID ${pid} found.`
        };
      }
      
      if (process.status === 'stopped') {
        return {
          completed: false,
          message: `Process ${pid} (${process.name}) is already stopped.`
        };
      }
      
      // Stop the process
      process.status = 'stopped';
      
      // Check if it was the malware
      if (process.name === 'malware.bin') {
        levelState.malwareKilled = true;
        
        // Check if level is completed
        if (levelState.firewallStarted) {
          return {
            completed: true,
            message: 'System secured! Malware stopped and firewall running.',
            nextAction: 'next_level'
          };
        }
        
        return {
          completed: false,
          message: `Killed malicious process ${pid} (${process.name}). Now start the firewall!`
        };
      }
      
      return {
        completed: false,
        message: `Process ${pid} (${process.name}) stopped.`
      };
    }
    
    if (cmd === 'start' && parts.length > 1) {
      const pid = parseInt(parts[1]);
      const process = levelState.processes.find(p => p.pid === pid);
      
      if (!process) {
        return {
          completed: false,
          message: `No process with PID ${pid} found.`
        };
      }
      
      if (process.status === 'running') {
        return {
          completed: false,
          message: `Process ${pid} (${process.name}) is already running.`
        };
      }
      
      // Start the process
      process.status = 'running';
      
      // Check if it was the firewall
      if (process.name === 'firewall') {
        levelState.firewallStarted = true;
        
        // Check if level is completed
        if (levelState.malwareKilled) {
          return {
            completed: true,
            message: 'System secured! Malware stopped and firewall running.',
            nextAction: 'next_level'
          };
        }
        
        return {
          completed: false,
          message: `Started firewall process ${pid}. Now kill the malware!`
        };
      }
      
      return {
        completed: false,
        message: `Process ${pid} (${process.name}) started.`
      };
    }
    
    if (cmd === 'info' && parts.length > 1) {
      const pid = parseInt(parts[1]);
      const process = levelState.processes.find(p => p.pid === pid);
      
      if (!process) {
        return {
          completed: false,
          message: `No process with PID ${pid} found.`
        };
      }
      
      let info = `Process Information:\n`;
      info += `PID: ${process.pid}\n`;
      info += `Name: ${process.name}\n`;
      info += `CPU Usage: ${process.cpu.toFixed(1)}%\n`;
      info += `Memory Usage: ${process.memory.toFixed(1)}%\n`;
      info += `Status: ${process.status}\n`;
      
      if (process.name === 'malware.bin') {
        info += `\nWARNING: This process appears to be malicious!`;
      } else if (process.name === 'firewall') {
        info += `\nNOTE: This is the system's security service.`;
      }
      
      return {
        completed: false,
        message: info
      };
    }
    
    return {
      completed: false,
      message: 'Unknown command or invalid syntax.'
    };
  },
  
  hints: [
    'Use "ps" to list all processes and their PIDs.',
    'Look for processes with unusually high CPU or memory usage.',
    'Use "kill [pid]" to stop a process and "start [pid]" to start one.',
    'You need to both kill the malware and start the firewall to complete the level.'
  ]
};

export function registerLevel3() {
  registerLevel(level);
} 