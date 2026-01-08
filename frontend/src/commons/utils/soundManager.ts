class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();

  preload(key: string, src: string) {
    const audio = new Audio(src);
    audio.preload = 'auto';
    this.sounds.set(key, audio);
  }

  play(key: string, volume = 0.5) {
    const audio = this.sounds.get(key);
    if (audio) {
      audio.currentTime = 0;
      audio.volume = volume;
      audio.play().catch((error) => {
        console.error(`사운드 파일 에러: ${key}`, error);
      });
    }
  }
}

export const soundManager = new SoundManager();
