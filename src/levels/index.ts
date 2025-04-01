import { registerLevel1 } from './level1';
import { registerLevel2 } from './level2';
import { registerLevel3 } from './level3';
import { registerLevel4 } from './level4';
import { registerLevel5 } from './level5';

export function registerAllLevels() {
  registerLevel1();
  registerLevel2();
  registerLevel3();
  registerLevel4();
  registerLevel5();
  
  console.log('All levels registered successfully.');
} 