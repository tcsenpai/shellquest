import figlet from 'figlet';
import gradient from 'gradient-string';
import kleur from 'kleur';

// Theme definitions
export type Theme = {
  name: string;
  primary: (text: string) => string;
  secondary: (text: string) => string;
  accent: (text: string) => string;
  success: (text: string) => string;
  error: (text: string) => string;
  warning: (text: string) => string;
  info: (text: string) => string;
  logo: (text: string) => string;
};

// Available themes
export const themes = {
  hacker: {
    name: 'Hacker',
    primary: kleur.green,
    secondary: kleur.green().dim,
    accent: kleur.white().bold,
    success: kleur.green().bold,
    error: kleur.red().bold,
    warning: kleur.yellow().bold,
    info: kleur.blue().bold,
    logo: (text: string) => gradient.atlas(text)
  },
  cyberpunk: {
    name: 'Cyberpunk',
    primary: kleur.magenta,
    secondary: kleur.blue,
    accent: kleur.yellow().bold,
    success: kleur.cyan().bold,
    error: kleur.red().bold,
    warning: kleur.yellow().bold,
    info: kleur.magenta().bold,
    logo: (text: string) => gradient.passion(text)
  },
  retro: {
    name: 'Retro',
    primary: kleur.yellow,
    secondary: kleur.white().dim,
    accent: kleur.white().bold,
    success: kleur.green().bold,
    error: kleur.red().bold,
    warning: kleur.yellow().bold,
    info: kleur.blue().bold,
    logo: (text: string) => gradient.morning(text)
  }
};

// Current theme (default to hacker)
let currentTheme: Theme = themes.hacker;

// Set the active theme
export function setTheme(themeName: keyof typeof themes): void {
  if (themes[themeName]) {
    currentTheme = themes[themeName];
  }
}

// Get the current theme
export function getTheme(): Theme {
  return currentTheme;
}

// Generate figlet text
export function figletText(text: string, font: figlet.Fonts = 'Standard'): string {
  try {
    return figlet.textSync(text, { font });
  } catch (error) {
    console.error('Error generating figlet text:', error);
    return text;
  }
}

// Animated text display
export async function animateText(text: string, delay = 30): Promise<void> {
  for (let i = 0; i < text.length; i++) {
    process.stdout.write(currentTheme.primary(text[i]));
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  console.log('');
}

// Loading animation
export async function loadingAnimation(message: string, duration = 2000): Promise<void> {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  
  const start = Date.now();
  const interval = setInterval(() => {
    const frame = frames[i++ % frames.length];
    process.stdout.write(`\r${currentTheme.primary(frame)} ${message}`);
  }, 80);
  
  await new Promise(resolve => setTimeout(resolve, duration));
  clearInterval(interval);
  process.stdout.write(`\r${currentTheme.success('✓')} ${message}\n`);
}

// Success animation
export async function successAnimation(message: string): Promise<void> {
  const frames = ['[    ]', '[=   ]', '[==  ]', '[=== ]', '[====]'];
  let i = 0;
  
  const interval = setInterval(() => {
    process.stdout.write(`\r${currentTheme.success(frames[i++ % frames.length])} ${message}`);
    if (i > frames.length * 2) {
      clearInterval(interval);
      console.log(`\r${currentTheme.success('[====]')} ${message}`);
    }
  }, 100);
  
  await new Promise(resolve => setTimeout(resolve, frames.length * 2 * 100 + 100));
}

// Typewriter effect for terminal output
export async function typewriter(text: string, speed = 10): Promise<void> {
  const lines = text.split('\n');
  
  for (const line of lines) {
    for (let i = 0; i < line.length; i++) {
      process.stdout.write(line[i]);
      await new Promise(resolve => setTimeout(resolve, speed));
    }
    console.log('');
  }
}

// Generate a cool logo
export function generateLogo(): string {
  const logo = figletText('TERMINAL ESCAPE', 'ANSI Shadow');
  return currentTheme.logo(logo);
}

// Boot sequence animation
export async function bootSequence(): Promise<void> {
  console.clear();
  
  await loadingAnimation('Initializing system', 1000);
  await loadingAnimation('Loading kernel modules', 800);
  await loadingAnimation('Mounting file systems', 600);
  await loadingAnimation('Starting network services', 700);
  await loadingAnimation('Launching Terminal Escape', 1000);
  
  console.log('\n');
  console.log(generateLogo());
  console.log('\n');
  
  await animateText('Welcome to Terminal Escape - A Linux Terminal Escape Room Game', 20);
  console.log('\n');
} 