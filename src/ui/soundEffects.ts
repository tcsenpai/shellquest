// Simplified sound effects module that doesn't actually play sounds
// but maintains the interface for the rest of the application

export const soundConfig = {
  enabled: false,
  volume: 0.5,
  ambientEnabled: false,
  effectsEnabled: false
};

// Play a sound effect (does nothing)
export function playSound(sound: 'success' | 'error' | 'typing' | 'levelComplete'): void {
  // No-op function to maintain API compatibility
}

// Play ambient sound (does nothing)
export function playAmbientSound(): void {
  // No-op function to maintain API compatibility
}

// Stop the ambient sound (does nothing)
export function stopAmbientSound(): void {
  // No-op function to maintain API compatibility
}

// Toggle sound on/off
export function toggleSound(): boolean {
  return soundConfig.enabled;
}

// Toggle ambient sound on/off
export function toggleAmbientSound(): boolean {
  return soundConfig.ambientEnabled;
}

// Toggle sound effects on/off
export function toggleSoundEffects(): boolean {
  return soundConfig.effectsEnabled;
}

// Set sound volume
export function setSoundVolume(volume: number): void {
  soundConfig.volume = Math.max(0, Math.min(1, volume));
}

// Initialize sound system (does nothing)
export function initSoundSystem(): void {
  // No-op function to maintain API compatibility
} 