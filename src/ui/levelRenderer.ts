import { styles, drawBox, drawTable } from './uiHelpers';
import { getTheme } from './visualEffects';

// Helper function to wrap text to fit within a width
function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    // If adding this word would exceed the max width
    if ((currentLine + ' ' + word).length > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      // Add word to current line (with a space if not the first word)
      currentLine = currentLine.length === 0 ? word : currentLine + ' ' + word;
    }
  });

  // Add the last line
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

export const levelUI = {
  title: (text: string) => {
    const theme = getTheme();
    console.log(theme.accent(text));
  },
  
  subtitle: (text: string) => {
    const theme = getTheme();
    console.log(theme.secondary(text));
  },
  
  paragraph: (text: string) => console.log(text),
  
  spacer: () => console.log(''),
  
  box: (title: string, content: string) => {
    const theme = getTheme();
    console.log(drawBox(theme.accent(title), content));
  },
  
  // Improved level content box
  levelContent: (title: string, content: () => Promise<void>) => {
    const theme = getTheme();
    const boxWidth = 76;
    
    // Start capturing console output
    const originalLog = console.log;
    let capturedOutput: string[] = [];
    
    console.log = (...args) => {
      capturedOutput.push(args.join(' '));
    };
    
    // Execute the content function and then process the output
    return content().then(() => {
      // Restore console.log
      console.log = originalLog;
      
      // Process and format the captured output
      let formattedLines: string[] = [];
      
      capturedOutput.forEach(line => {
        // Skip empty lines at the beginning
        if (formattedLines.length === 0 && line.trim() === '') {
          return;
        }
        
        // Handle long lines by wrapping them
        if (line.length > boxWidth - 4) {
          const wrappedLines = wrapText(line, boxWidth - 4);
          formattedLines.push(...wrappedLines);
        } else {
          formattedLines.push(line);
        }
      });
      
      // Draw the box with the formatted content
      console.log('┌' + '─'.repeat(boxWidth - 2) + '┐');
      
      // Title bar
      console.log('│ ' + theme.accent(title.padEnd(boxWidth - 4)) + ' │');
      console.log('├' + '─'.repeat(boxWidth - 2) + '┤');
      
      // Content
      formattedLines.forEach(line => {
        console.log('│ ' + line.padEnd(boxWidth - 4) + ' │');
      });
      
      // Bottom of box
      console.log('└' + '─'.repeat(boxWidth - 2) + '┘');
    });
  },
  
  // Revert to the simpler input box
  inputBox: () => {
    const theme = getTheme();
    console.log('Enter your command below:');
  },
  
  terminal: (content: string) => {
    const theme = getTheme();
    console.log('  ' + theme.secondary('┌─ Terminal ───────────────────────┐'));
    content.split('\n').forEach(line => {
      console.log('  ' + theme.secondary('│') + ' ' + theme.accent(line));
    });
    console.log('  ' + theme.secondary('└────────────────────────────────────┘'));
  },
  
  fileSystem: (path: string, items: {name: string, type: string}[]) => {
    const theme = getTheme();
    console.log(theme.info(`Current directory: ${path}`));
    console.log('');
    
    if (items.length === 0) {
      console.log(theme.secondary('  (empty directory)'));
      return;
    }
    
    items.forEach(item => {
      const icon = item.type === 'dir' ? '📁' : '📄';
      console.log(`  ${icon} ${item.type === 'dir' ? theme.accent(item.name) : item.name}`);
    });
  },
  
  processTable: (processes: any[]) => {
    const headers = ['PID', 'NAME', 'CPU%', 'MEM%', 'STATUS'];
    const rows = processes.map(p => [
      p.pid.toString(),
      p.name,
      p.cpu.toFixed(1),
      p.memory.toFixed(1),
      p.status
    ]);
    
    console.log(drawTable(headers, rows));
  },
  
  commands: (commands: string[]) => {
    const theme = getTheme();
    console.log(theme.secondary('Available Commands:'));
    commands.forEach(cmd => console.log('  ' + theme.accent(cmd)));
  }
}; 