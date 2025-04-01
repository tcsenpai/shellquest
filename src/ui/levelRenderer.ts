import { styles, drawBox, drawTable } from './uiHelpers';

export const levelUI = {
  title: (text: string) => console.log(styles.title(text)),
  subtitle: (text: string) => console.log(styles.subtitle(text)),
  paragraph: (text: string) => console.log(text),
  spacer: () => console.log(''),
  
  box: (title: string, content: string) => console.log(drawBox(title, content)),
  
  terminal: (content: string) => {
    console.log('  ' + styles.dim('┌─ Terminal ───────────────────────┐'));
    content.split('\n').forEach(line => {
      console.log('  ' + styles.dim('│') + ' ' + styles.highlight(line));
    });
    console.log('  ' + styles.dim('└────────────────────────────────────┘'));
  },
  
  fileSystem: (path: string, items: {name: string, type: string}[]) => {
    console.log(styles.path(`Current directory: ${path}`));
    console.log('');
    
    if (items.length === 0) {
      console.log(styles.dim('  (empty directory)'));
      return;
    }
    
    items.forEach(item => {
      const icon = item.type === 'dir' ? '📁' : '📄';
      console.log(`  ${icon} ${item.name}`);
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
    console.log(styles.subtitle('Available Commands:'));
    commands.forEach(cmd => console.log('  ' + styles.command(cmd)));
  }
}; 