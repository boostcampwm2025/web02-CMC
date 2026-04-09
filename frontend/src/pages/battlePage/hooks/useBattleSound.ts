import { useEffect } from 'react';
import { soundManager } from '@/commons/utils/soundManager';

export const BGM_OPTIONS = [
  { key: 'lofi', label: 'LoFi', src: '/sounds/lofi.mp3' },
  { key: 'chill', label: 'Chill', src: '/sounds/chill.mp3' },
  { key: 'groove', label: 'Groove', src: '/sounds/groove.mp3' },
  { key: 'hiphop', label: 'Hip Hop', src: '/sounds/hiphop.mp3' },
  { key: 'jazz', label: 'Jazz', src: '/sounds/jazz.mp3' },
  { key: 'rock', label: 'Rock', src: '/sounds/rock.mp3' },
  { key: 'romantic', label: 'Romantic', src: '/sounds/romantic.mp3' }
];

export default function useBattleSound() {
  useEffect(() => {
    soundManager.preload('timerWarning', '/sounds/timerSound.wav');
    soundManager.preload('notificationPing', '/sounds/notificationPing.mp3');
    soundManager.preload('swoosh', '/sounds/swoosh.mp3');
    soundManager.preload('swordSlash', '/sounds/swordSlash.mp3');
    soundManager.preload('fanfare', '/sounds/fanfare.mp3');
    soundManager.preload('click', '/sounds/click.mp3');
    soundManager.preload('click2', '/sounds/click2.mp3');

    BGM_OPTIONS.forEach((bgm) => {
      soundManager.preloadBGM(bgm.key, bgm.src);
    });
  }, []);

  useEffect(() => {
    if (!soundManager.getCurrentBGM()) {
      soundManager.playBGM(BGM_OPTIONS[0].key);
    }
  }, []);

  return { bgmOptions: BGM_OPTIONS };
}
