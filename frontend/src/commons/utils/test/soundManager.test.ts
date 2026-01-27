import { describe, it, expect, beforeEach, vi } from 'vitest';
import { soundManager } from '../soundManager';

// HTMLAudioElement 모킹
global.Audio = vi.fn().mockImplementation(() => ({
  preload: '',
  loop: false,
  volume: 0.5,
  currentTime: 0,
  paused: true,
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn()
}));

describe('SoundManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('BGM 볼륨', () => {
    it('기본 볼륨은 0.5', () => {
      expect(soundManager.getBGMVolume()).toBe(0.5);
    });

    it('볼륨 설정 및 조회', () => {
      soundManager.setBGMVolume(0.7);
      expect(soundManager.getBGMVolume()).toBe(0.7);
    });

    it('볼륨은 0과 1 사이로 제한', () => {
      soundManager.setBGMVolume(1.5);
      expect(soundManager.getBGMVolume()).toBe(1);

      soundManager.setBGMVolume(-0.5);
      expect(soundManager.getBGMVolume()).toBe(0);
    });
  });

  describe('효과음 볼륨', () => {
    it('기본 볼륨은 0.5', () => {
      expect(soundManager.getEffectVolume()).toBe(0.5);
    });

    it('볼륨 설정 및 조회', () => {
      soundManager.setEffectVolume(0.8);
      expect(soundManager.getEffectVolume()).toBe(0.8);
    });

    it('볼륨은 0과 1 사이로 제한', () => {
      soundManager.setEffectVolume(2);
      expect(soundManager.getEffectVolume()).toBe(1);

      soundManager.setEffectVolume(-1);
      expect(soundManager.getEffectVolume()).toBe(0);
    });
  });

  describe('BGM 사전 로드', () => {
    it('BGM 사전 로드', () => {
      soundManager.preloadBGM('test', '/sounds/test.mp3');
      expect(global.Audio).toHaveBeenCalled();
    });

    it('중복 로드 방지', () => {
      soundManager.preloadBGM('test', '/sounds/test.mp3');
      soundManager.preloadBGM('test', '/sounds/test.mp3');
      expect(global.Audio).toHaveBeenCalledTimes(1);
    });
  });
});
