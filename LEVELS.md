# LEVELS.md - Guide to Adding New Levels

## Introduction

ShellQuest is designed to be easily expandable with new levels. This guide explains how to create and integrate new levels into the game.

## Level Structure

Each level is defined as an object that implements the `Level` interface. A level consists of:

1. **Basic Information**: ID, name, and description
2. **State Management**: Methods to initialize and manage level-specific state
3. **User Interface**: Methods to render the level and handle user input
4. **Hints**: An array of progressive hints for players who get stuck

## Creating a New Level

### Step 1: Create a new file

Create a new file in the `src/levels` directory, e.g., `levelX.ts` where X is the next level number.

### Step 2: Implement the Level interface

```typescript
import { Level, LevelResult, registerLevel } from '../core/levelSystem';
import { getCurrentGameState } from '../core/gameState';
import { levelUI } from '../ui/levelRenderer'; // Optional, for enhanced UI

const level: Level = {
  id: X, // Replace X with the next level number
  name: 'Your Level Name',
  description: 'Brief description of your level',

  async initialize() {
    const gameState = getCurrentGameState();
    if (!gameState) return;

    // Initialize level state if not already present
    if (!gameState.levelStates[this.id]) {
      gameState.levelStates[this.id] = {
        // Define your level-specific state here
        // For example:
        attempts: 0,
        someFlag: false,
        // Add any other state variables your level needs
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

    // Display level information and UI
    console.log('Your level description and UI goes here');
    console.log('');

    // Display available commands
    console.log('Commands: "command1", "command2", etc.');
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

    // Handle different commands
    if (cmd === 'command1') {
      // Do something
      return {
        completed: false,
        message: 'Response to command1'
      };
    }

    // Handle level completion
    if (cmd === 'win_command') {
      return {
        completed: true,
        message: 'Congratulations! You completed the level.',
        nextAction: 'next_level'
      };
    }

    // Default response for unknown commands
    return {
      completed: false,
      message: 'Unknown command. Try something else.'
    };
  },

  hints: [
    'First hint - very subtle',
    'Second hint - more direct',
    'Third hint - almost gives away the solution'
  ]
};

export function registerLevelX() { // Replace X with the level number
  registerLevel(level);
}
````

### Step 3: Update the levels index file

Edit `src/levels/index.ts` to import and register your new level:

```typescript
import { registerLevel1 } from "./level1";
import { registerLevel2 } from "./level2";
// ... other levels
import { registerLevelX } from "./levelX"; // Add your new level

export function registerAllLevels() {
  registerLevel1();
  registerLevel2();
  // ... other levels
  registerLevelX(); // Register your new level

  console.log("All levels registered successfully.");
}
```

## Implementing Complex Level Mechanics

### File System Navigation

To implement a file system level (like Level 2), you need to:

1. Create a virtual file system structure in your level state
2. Implement commands like `ls`, `cd`, and `cat`
3. Track the current directory and handle path navigation

Here's an example of a file system state structure:

```typescript
// In initialize()
gameState.levelStates[this.id] = {
  currentDir: "/home/user",
  fileSystem: {
    "/home/user": {
      type: "dir",
      contents: ["Documents", "Pictures", ".hidden"],
    },
    "/home/user/Documents": {
      type: "dir",
      contents: ["notes.txt"],
    },
    "/home/user/Documents/notes.txt": {
      type: "file",
      content: "This is a text file.",
    },
    // Add more directories and files
  },
};
```

Handling file system commands:

```typescript
// In handleInput()
if (cmd === "ls") {
  // List directory contents
  return {
    completed: false,
    message: fileSystem[levelState.currentDir].contents.join("\n"),
  };
}

if (cmd === "cd" && parts.length > 1) {
  const target = parts[1];

  if (target === "..") {
    // Go up one directory
    const pathParts = levelState.currentDir.split("/");
    if (pathParts.length > 2) {
      pathParts.pop();
      levelState.currentDir = pathParts.join("/");
      return {
        completed: false,
        message: `Changed directory to ${levelState.currentDir}`,
      };
    }
  } else {
    // Go to specified directory
    const newPath = `${levelState.currentDir}/${target}`;

    if (fileSystem[newPath] && fileSystem[newPath].type === "dir") {
      levelState.currentDir = newPath;
      return {
        completed: false,
        message: `Changed directory to ${levelState.currentDir}`,
      };
    }
  }
}

if (cmd === "cat" && parts.length > 1) {
  const target = parts[1];
  const path = `${levelState.currentDir}/${target}`;

  if (fileSystem[path] && fileSystem[path].type === "file") {
    return {
      completed: false,
      message: fileSystem[path].content,
    };
  }
}
```

### Process Management

For a process management level (like Level 3), you can:

1. Create a list of processes with properties like PID, name, CPU usage, etc.
2. Implement commands like `ps`, `kill`, and `start`
3. Track process states and check for completion conditions

Example process state:

```typescript
// In initialize()
gameState.levelStates[this.id] = {
  processes: [
    { pid: 1, name: "systemd", cpu: 0.1, memory: 4.2, status: "running" },
    { pid: 423, name: "sshd", cpu: 0.0, memory: 1.1, status: "running" },
    {
      pid: 842,
      name: "malware.bin",
      cpu: 99.7,
      memory: 85.5,
      status: "running",
    },
    { pid: 1024, name: "firewall", cpu: 0.1, memory: 1.8, status: "stopped" },
  ],
  firewallStarted: false,
  malwareKilled: false,
};
```

Handling process commands:

```typescript
// In handleInput()
if (cmd === "ps") {
  // Format and display process list
  let output = "PID    NAME         CPU%    MEM%    STATUS\n";
  output += "--------------------------------------------\n";

  levelState.processes.forEach((proc) => {
    output += `${proc.pid.toString().padEnd(7)}${proc.name.padEnd(13)}${proc.cpu
      .toFixed(1)
      .padEnd(8)}${proc.memory.toFixed(1).padEnd(8)}${proc.status}\n`;
  });

  return {
    completed: false,
    message: output,
  };
}

if (cmd === "kill" && parts.length > 1) {
  const pid = parseInt(parts[1]);
  const process = levelState.processes.find((p) => p.pid === pid);

  if (process) {
    process.status = "stopped";

    if (process.name === "malware.bin") {
      levelState.malwareKilled = true;

      // Check if level is completed
      if (levelState.firewallStarted) {
        return {
          completed: true,
          message: "System secured! Malware stopped and firewall running.",
          nextAction: "next_level",
        };
      }
    }
  }
}

if (cmd === "start" && parts.length > 1) {
  const pid = parseInt(parts[1]);
  const process = levelState.processes.find((p) => p.pid === pid);

  if (process) {
    process.status = "running";

    if (process.name === "firewall") {
      levelState.firewallStarted = true;

      // Check if level is completed
      if (levelState.malwareKilled) {
        return {
          completed: true,
          message: "System secured! Malware stopped and firewall running.",
          nextAction: "next_level",
        };
      }
    }
  }
}
```

### File Permissions

For a permissions-based level (like Level 4):

1. Create files with permission attributes
2. Implement commands like `chmod` and `sudo`
3. Check permissions before allowing file access

Example permissions state:

```typescript
// In initialize()
gameState.levelStates[this.id] = {
  files: [
    {
      name: "README.txt",
      permissions: "rw-r--r--",
      owner: "user",
      group: "user",
    },
    {
      name: "secret_data.db",
      permissions: "----------",
      owner: "root",
      group: "root",
    },
    {
      name: "change_permissions.sh",
      permissions: "r--------",
      owner: "user",
      group: "user",
    },
  ],
  currentUser: "user",
  sudoAvailable: false,
};
```

Handling permission commands:

```typescript
// In handleInput()
if (cmd === "cat" && parts.length > 1) {
  const fileName = parts[1];
  const file = levelState.files.find((f) => f.name === fileName);

  if (file) {
    // Check if user has read permission
    const canRead =
      (levelState.currentUser === file.owner && file.permissions[0] === "r") ||
      (levelState.currentUser !== file.owner &&
        levelState.currentUser === file.group &&
        file.permissions[3] === "r") ||
      (levelState.currentUser !== file.owner &&
        levelState.currentUser !== file.group &&
        file.permissions[6] === "r") ||
      levelState.currentUser === "root"; // root can read anything

    if (!canRead) {
      return {
        completed: false,
        message: `Permission denied: Cannot read ${fileName}`,
      };
    }

    // Return file content based on the file name
    if (fileName === "README.txt") {
      return {
        completed: false,
        message:
          "This system contains important data. You need to access secret_data.db to proceed.",
      };
    }
    // Handle other files...
  }
}

if (cmd === "chmod" && parts.length > 2) {
  const permissions = parts[1]; // e.g., +x
  const fileName = parts[2];
  const file = levelState.files.find((f) => f.name === fileName);

  if (file) {
    // Check if user owns the file
    if (
      levelState.currentUser !== file.owner &&
      levelState.currentUser !== "root"
    ) {
      return {
        completed: false,
        message: `Permission denied: Only the owner can change permissions of ${fileName}`,
      };
    }

    // Handle different chmod formats
    if (permissions === "+x") {
      // Make file executable
      let newPermissions = file.permissions.split("");
      newPermissions[2] = "x"; // Owner execute
      file.permissions = newPermissions.join("");

      if (fileName === "change_permissions.sh") {
        levelState.scriptExecutable = true;
      }

      return {
        completed: false,
        message: `Changed permissions of ${fileName} to ${file.permissions}`,
      };
    }
    // Handle other permission changes...
  }
}
```

### Network Configuration

For a network-based level (like Level 5):

1. Create network interfaces, firewall rules, and DNS settings
2. Implement commands like `ifconfig`, `ping`, and `firewall-cmd`
3. Track network state and check for connectivity

Example network state:

```typescript
// In initialize()
gameState.levelStates[this.id] = {
  interfaces: [
    { name: "lo", status: "UP", ip: "127.0.0.1", netmask: "255.0.0.0" },
    { name: "eth0", status: "DOWN", ip: "", netmask: "" },
  ],
  firewall: {
    enabled: true,
    rules: [
      { port: 80, protocol: "tcp", action: "DENY" },
      { port: 443, protocol: "tcp", action: "DENY" },
    ],
  },
  dns: {
    configured: false,
    server: "",
  },
  gateway: {
    configured: false,
    address: "",
  },
};
```

Handling network commands:

```typescript
// In handleInput()
if (cmd === "ifconfig") {
  if (parts.length === 1) {
    // Show all interfaces
    let output = "Network Interfaces:\n";
    output += "NAME   STATUS   IP            NETMASK\n";
    output += "----------------------------------------\n";

    levelState.interfaces.forEach((iface) => {
      output += `${iface.name.padEnd(7)}${iface.status.padEnd(
        9
      )}${iface.ip.padEnd(14)}${iface.netmask}\n`;
    });

    return {
      completed: false,
      message: output,
    };
  } else if (parts.length >= 4) {
    // Configure an interface
    const ifaceName = parts[1];
    const ip = parts[2];
    const netmask = parts[3];

    const iface = levelState.interfaces.find((i) => i.name === ifaceName);

    if (iface) {
      iface.ip = ip;
      iface.netmask = netmask;

      return {
        completed: false,
        message: `Configured ${ifaceName} with IP ${ip} and netmask ${netmask}.`,
      };
    }
  }
}

if (cmd === "ifup" && parts.length > 1) {
  const ifaceName = parts[1];
  const iface = levelState.interfaces.find((i) => i.name === ifaceName);

  if (iface) {
    iface.status = "UP";

    return {
      completed: false,
      message: `Interface ${ifaceName} is now UP.`,
    };
  }
}

if (cmd === "firewall-cmd") {
  if (parts.includes("--disable")) {
    levelState.firewall.enabled = false;

    return {
      completed: false,
      message: "Firewall disabled.",
    };
  }

  if (parts.includes("--allow") && parts.length > 2) {
    const port = parseInt(parts[parts.indexOf("--allow") + 1]);

    // Find the rule for this port
    const rule = levelState.firewall.rules.find((r) => r.port === port);

    if (rule) {
      rule.action = "ALLOW";

      return {
        completed: false,
        message: `Port ${port} is now allowed through the firewall.`,
      };
    }
  }
}
```

## Using the Enhanced UI

The game includes a `levelUI` helper in `src/ui/levelRenderer.ts` that provides styled UI components for your levels:

```typescript
import { levelUI } from "../ui/levelRenderer";

// In render()
levelUI.title("Welcome to My Level");
levelUI.paragraph("This is a description of the level.");
levelUI.spacer();

// Display a terminal
levelUI.terminal(
  "$ ls -la\ntotal 12\ndrwxr-xr-x 2 user user 4096 Jan 1 12:00 ."
);

// Display a file system
const items = [
  { name: "Documents", type: "dir" },
  { name: "notes.txt", type: "file" },
];
levelUI.fileSystem("/home/user", items);

// Display a process table
levelUI.processTable(levelState.processes);

// Display available commands
levelUI.commands(["ls", "cd [dir]", "cat [file]"]);
```

## Level State Management

The level state is stored in `gameState.levelStates[levelId]`. This is where you should store any level-specific data that needs to persist between renders or commands.

## Level Results

When handling user input, your level should return a `LevelResult` object:

```typescript
interface LevelResult {
  completed: boolean; // Whether the level is completed
  message?: string; // Optional message to display to the user
  nextAction?: "next_level" | "main_menu" | "continue"; // What to do next
}
```

- Set `completed: true` when the player solves the level
- Use `nextAction: 'next_level'` to proceed to the next level
- Use `nextAction: 'main_menu'` to return to the main menu
- Use `nextAction: 'continue'` or omit to stay in the current level

## Best Practices

1. **Initialization**: Always check if the level state exists and initialize it if not
2. **Progressive Difficulty**: Make your level challenging but fair
3. **Clear Instructions**: Make sure players understand what they need to do
4. **Meaningful Feedback**: Provide helpful responses to player commands
5. **Multiple Solutions**: When possible, allow multiple ways to solve the puzzle
6. **Thematic Consistency**: Try to maintain the Linux/tech theme of the game
7. **Hints**: Provide at least 3 hints of increasing specificity

## Example Level Ideas

- **Network Security**: Configure a firewall to block specific attacks
- **Cryptography**: Decode encrypted messages using various ciphers
- **Database Challenge**: Use SQL-like commands to extract information
- **Git Simulation**: Navigate and manipulate a git repository
- **Container Escape**: Escape from a simulated container environment

## Testing Your Level

Always test your level thoroughly to ensure:

- It can be completed
- All commands work as expected
- The level state initializes correctly
- Transitions to the next level work properly

Happy level creating!

