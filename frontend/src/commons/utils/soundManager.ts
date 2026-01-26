class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private bgmSounds: Map<string, HTMLAudioElement> = new Map();
  private currentBgmKey: string | null = null;
  private bgmVolume: number = 0.5;
  private effectVolume: number = 0.5;

  preload(key: string, src: string) {
    const audio = new Audio(src);
    audio.preload = 'auto';
    this.sounds.set(key, audio);
  }

  play(key: string, volume?: number) {
    const audio = this.sounds.get(key);
    if (audio) {
      audio.currentTime = 0;
      audio.volume = volume ?? this.effectVolume;
      audio.play().catch((error) => {
        console.error(`사운드 파일 에러: ${key}`, error);
      });
    }
  }

  // BGM 사전 로드
  preloadBGM(key: string, src: string) {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.loop = true;
    this.bgmSounds.set(key, audio);
  }

  // BGM 재생
  playBGM(key: string, src: string) {
    // 기존 BGM 정지
    this.stopBGM();

    // Map에서 가져오거나 새로 생성
    let audio = this.bgmSounds.get(key);
    if (!audio) {
      audio = new Audio(src);
      audio.loop = true;
      this.bgmSounds.set(key, audio);
    }

    audio.volume = this.bgmVolume;
    audio.play().catch((error) => {
      console.error(`BGM 재생 에러: ${key}`, error);
    });

    this.currentBgmKey = key;
  }

  // BGM 정지
  stopBGM() {
    if (this.currentBgmKey) {
      const audio = this.bgmSounds.get(this.currentBgmKey);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      this.currentBgmKey = null;
    }
  }

  // BGM 일시정지
  pauseBGM() {
    if (this.currentBgmKey) {
      const audio = this.bgmSounds.get(this.currentBgmKey);
      if (audio) {
        audio.pause();
      }
    }
  }

  // BGM 재개
  resumeBGM() {
    if (this.currentBgmKey) {
      const audio = this.bgmSounds.get(this.currentBgmKey);
      if (audio) {
        audio.play().catch((error) => {
          console.error('BGM 재개 에러:', error);
        });
      }
    }
  }

  // BGM 재생 중인지 확인
  isBGMPlaying(): boolean {
    if (!this.currentBgmKey) return false;
    const audio = this.bgmSounds.get(this.currentBgmKey);
    return audio !== undefined && !audio.paused;
  }

  // BGM 볼륨 설정
  setBGMVolume(volume: number) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.currentBgmKey) {
      const audio = this.bgmSounds.get(this.currentBgmKey);
      if (audio) {
        audio.volume = this.bgmVolume;
      }
    }
  }

  // 이펙트 사운드 볼륨 설정
  setEffectVolume(volume: number) {
    this.effectVolume = Math.max(0, Math.min(1, volume));
  }

  // 현재 BGM 키 반환
  getCurrentBGM(): string | null {
    return this.currentBgmKey;
  }

  // BGM 볼륨 반환
  getBGMVolume(): number {
    return this.bgmVolume;
  }

  // 이펙트 볼륨 반환
  getEffectVolume(): number {
    return this.effectVolume;
  }
}

export const soundManager = new SoundManager();
