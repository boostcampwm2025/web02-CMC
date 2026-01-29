import { useEffect } from 'react';
import { soundManager } from '@/commons/utils/soundManager';

export function useTutorialSounds() {
  useEffect(() => {
    soundManager.preload('timerWarning', '/sounds/timerSound.wav');
    soundManager.preload('notificationPing', '/sounds/notificationPing.mp3');
    soundManager.preload('swoosh', '/sounds/swoosh.mp3');
    soundManager.preload('swordSlash', '/sounds/swordSlash.mp3');
    soundManager.preload('fanfare', '/sounds/fanfare.mp3');
    soundManager.preload('click', '/sounds/click.mp3');
    soundManager.preload('click2', '/sounds/click2.mp3');
  }, []);
}
