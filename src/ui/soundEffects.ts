import player from 'play-sound';

const audioPlayer = player({});

export function playSound(sound: 'success' | 'error' | 'typing' | 'levelComplete'): void {
  try {
    const soundMap = {
      success: 'sounds/success.wav',
      error: 'sounds/error.wav',
      typing: 'sounds/typing.wav',
      levelComplete: 'sounds/level-complete.wav'
    };
    
    audioPlayer.play(soundMap[sound], (err) => {
      if (err) console.error('Error playing sound:', err);
    });
  } catch (error) {
    // Silently fail if sound can't be played
  }
} 