import { styles, drawBox, drawTable } from './uiHelpers';
import { getTheme } from './visualEffects';

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