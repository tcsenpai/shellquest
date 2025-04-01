import readline from 'readline';
import kleur from 'kleur';

// Enable colors
kleur.enabled = true;

export function clearScreen(): void {
  console.clear();
}

export function promptInput(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise<string>(resolve => {
    rl.question(kleur.green('> ') + prompt, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

// Add styled text helpers
export const styles = {
  title: (text: string) => kleur.bold().cyan(text),
  subtitle: (text: string) => kleur.bold().blue(text),
  success: (text: string) => kleur.bold().green(text),
  error: (text: string) => kleur.bold().red(text),
  warning: (text: string) => kleur.bold().yellow(text),
  info: (text: string) => kleur.bold().magenta(text),
  command: (text: string) => kleur.bold().yellow(text),
  path: (text: string) => kleur.italic().white(text),
  highlight: (text: string) => kleur.bold().white(text),
  dim: (text: string) => kleur.dim().white(text)
};

// Add box drawing functions
export function drawBox(title: string, content: string): string {
  const lines = content.split('\n');
  const width = Math.max(title.length + 4, ...lines.map(line => line.length + 4));
  
  let result = '╔' + '═'.repeat(width - 2) + '╗\n';
  result += '║ ' + kleur.bold().cyan(title) + ' '.repeat(width - title.length - 3) + '║\n';
  result += '╠' + '═'.repeat(width - 2) + '╣\n';
  
  lines.forEach(line => {
    result += '║ ' + line + ' '.repeat(width - line.length - 3) + '║\n';
  });
  
  result += '╚' + '═'.repeat(width - 2) + '╝';
  return result;
}

export function drawTable(headers: string[], rows: string[][]): string {
  // Calculate column widths
  const colWidths = headers.map((h, i) => 
    Math.max(h.length, ...rows.map(row => row[i]?.length || 0)) + 2
  );
  
  // Create separator line
  const separator = '┼' + colWidths.map(w => '─'.repeat(w)).join('┼') + '┼';
  
  // Create header
  let result = '┌' + colWidths.map(w => '─'.repeat(w)).join('┬') + '┐\n';
  result += '│' + headers.map((h, i) => kleur.bold().white(h.padEnd(colWidths[i]))).join('│') + '│\n';
  result += '├' + separator.substring(1, separator.length - 1) + '┤\n';
  
  // Create rows
  rows.forEach(row => {
    result += '│' + row.map((cell, i) => cell.padEnd(colWidths[i])).join('│') + '│\n';
  });
  
  // Create footer
  result += '└' + colWidths.map(w => '─'.repeat(w)).join('┴') + '┘';
  
  return result;
} 