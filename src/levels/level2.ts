import { Level, LevelResult, registerLevel } from "../core/levelSystem";
import { getCurrentGameState } from "../core/gameState";

interface Level2State {
  currentDir: string;
  fileSystem: {
    [key: string]: {
      type: "dir" | "file";
      contents?: string[];
      content?: string;
    };
  };
  foundKey?: boolean;
}

const level: Level = {
  id: 2,
  name: "File System Maze",
  description: "Navigate through a virtual file system to find the key.",

  async initialize() {
    const gameState = getCurrentGameState();
    if (!gameState) return;

    // Initialize level state if not already present
    //if (!gameState.levelStates[this.id]) {
    gameState.levelStates[this.id] = {
      currentDir: "/home/user",
      fileSystem: {
        "/home/user": {
          type: "dir",
          contents: ["Documents", "Pictures", ".hidden"],
        },
        "/home/user/Documents": {
          type: "dir",
          contents: ["notes.txt", "system.key"],
        },
        "/home/user/Documents/notes.txt": {
          type: "file",
          content: "The system key is hidden somewhere in this directory...",
        },
        "/home/user/Documents/system.key": {
          type: "file",
          content: "Congratulations! You found the system key: XK42-9Y7Z",
        },
        "/home/user/Pictures": {
          type: "dir",
          contents: ["vacation.jpg"],
        },
        "/home/user/Pictures/vacation.jpg": {
          type: "file",
          content: "Just a nice beach photo.",
        },
        "/home/user/.hidden": {
          type: "dir",
          contents: ["readme.md"],
        },
        "/home/user/.hidden/readme.md": {
          type: "file",
          content: "Nothing to see here...",
        },
      },
    };
    //}
  },

  async render() {
    const gameState = getCurrentGameState();
    if (!gameState) return;

    // Make sure level state is initialized
    if (!gameState.levelStates[this.id]) {
      await this.initialize();
      return; // Return here to ensure the state is available in the next render
    }

    const levelState = gameState.levelStates[this.id] as Level2State;
    if (!levelState || !levelState.currentDir || !levelState.fileSystem) {
      console.log("[DEBUG] Level state not properly initialized");
      console.log(JSON.stringify(levelState, null, 2));
      console.log("Error: Level state not properly initialized");
      return;
    }

    const { currentDir, fileSystem } = levelState;

    console.log(
      "You're in a virtual file system and need to find the system key."
    );
    console.log("");
    console.log(`Current directory: ${currentDir}`);
    console.log("");

    if (fileSystem[currentDir].type === "dir") {
      console.log("Contents:");
      if (fileSystem[currentDir].contents.length === 0) {
        console.log("  (empty directory)");
      } else {
        fileSystem[currentDir].contents.forEach((item) => {
          const path = `${currentDir}/${item}`;
          const type = fileSystem[path].type === "dir" ? "Directory" : "File";
          console.log(`  ${item} (${type})`);
        });
      }
    } else {
      console.log("File content:");
      console.log(fileSystem[currentDir].content);
    }

    console.log("");
    console.log(
      'Commands: "ls", "cd [dir]", "cat [file]", "pwd", "find [name]"'
    );
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
    const fileSystem = levelState.fileSystem;
    const command = input.trim();

    // Split command into parts
    const parts = command.split(" ");
    const cmd = parts[0].toLowerCase();

    if (cmd === "ls") {
      // List directory contents
      return {
        completed: false,
        message: fileSystem[levelState.currentDir].contents.join("\n"),
      };
    }

    if (cmd === "pwd") {
      // Print working directory
      return {
        completed: false,
        message: levelState.currentDir,
      };
    }

    if (cmd === "cd" && parts.length > 1) {
      // Change directory
      const target = parts[1];

      if (target === "..") {
        // Go up one directory
        const pathParts = levelState.currentDir.split("/");
        if (pathParts.length > 2) {
          // Don't go above /home/user
          pathParts.pop();
          levelState.currentDir = pathParts.join("/");
          return {
            completed: false,
            message: `Changed directory to ${levelState.currentDir}`,
          };
        } else {
          return {
            completed: false,
            message: "Cannot go above the home directory.",
          };
        }
      } else if (target === ".") {
        // Stay in current directory
        return {
          completed: false,
          message: `Still in ${levelState.currentDir}`,
        };
      } else {
        // Go to specified directory
        const newPath = `${levelState.currentDir}/${target}`;

        if (fileSystem[newPath] && fileSystem[newPath].type === "dir") {
          levelState.currentDir = newPath;
          return {
            completed: false,
            message: `Changed directory to ${levelState.currentDir}`,
          };
        } else {
          return {
            completed: false,
            message: `Cannot change to ${target}: No such directory`,
          };
        }
      }
    }

    if (cmd === "cat" && parts.length > 1) {
      // View file contents
      const target = parts[1];
      const filePath = `${levelState.currentDir}/${target}`;

      if (fileSystem[filePath] && fileSystem[filePath].type === "file") {
        const content = fileSystem[filePath].content;

        // Check if this is the key file
        if (filePath === "/home/user/Documents/system.key") {
          levelState.foundKey = true;
          return {
            completed: true,
            message: `You found the system key! The file contains: ${content}`,
            nextAction: "next_level",
          };
        }

        return {
          completed: false,
          message: `File contents: ${content}`,
        };
      } else {
        return {
          completed: false,
          message: `Cannot read ${target}: No such file`,
        };
      }
    }

    if (cmd === "find" && parts.length > 1) {
      // Simple find implementation
      const target = parts[1];
      const results: string[] = [];

      // Search through the file system
      Object.keys(fileSystem).forEach((path) => {
        if (path.includes(target)) {
          results.push(path);
        }
      });

      if (results.length > 0) {
        return {
          completed: false,
          message: `Found matches:\n${results.join("\n")}`,
        };
      } else {
        return {
          completed: false,
          message: `No matches found for "${target}"`,
        };
      }
    }

    return {
      completed: false,
      message: "Unknown command or invalid syntax.",
    };
  },

  hints: [
    'Try using basic Linux commands like "ls", "cd", and "cat".',
    "Remember that hidden files and directories start with a dot (.)",
    'Use "ls" to list files, "cd" to change directories, and "cat" to view file contents.',
  ],
};

export function registerLevel2() {
  registerLevel(level);
}
