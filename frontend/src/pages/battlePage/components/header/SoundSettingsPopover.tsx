import { useState, useEffect, useRef } from 'react';
import { soundManager } from '@/commons/utils/soundManager';
import CloseIcon from '@/assets/icon/close.svg?react';
import PlayIcon from '@/assets/icon/play.svg?react';
import PauseIcon from '@/assets/icon/pause.svg?react';
import VolumeSlider from './VolumeSlider';

interface BGMOption {
  key: string;
  label: string;
  src: string;
}

interface SoundSettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  bgmOptions: BGMOption[];
}

export default function SoundSettingsPopover({ isOpen, onClose, anchorEl, bgmOptions }: SoundSettingsPopoverProps) {
  const [bgmVolume, setBgmVolume] = useState(() => soundManager.getBGMVolume());
  const [effectVolume, setEffectVolume] = useState(() => soundManager.getEffectVolume());
  const [selectedBGM, setSelectedBGM] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // 팝오버가 열릴 때 soundManager 상태와 동기화
  useEffect(() => {
    if (!isOpen) return;

    const currentBGM = soundManager.getCurrentBGM();
    setSelectedBGM(currentBGM || bgmOptions[0]?.key || null);
    setIsPlaying(soundManager.isBGMPlaying());
    setBgmVolume(soundManager.getBGMVolume());
    setEffectVolume(soundManager.getEffectVolume());
  }, [isOpen]);

  // 외부 클릭 감지
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsidePopover = popoverRef.current?.contains(target);
      const clickedInsideButton = anchorEl?.contains(target);

      if (!clickedInsidePopover && !clickedInsideButton) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorEl]);

  const handleBGMVolumeChange = (value: number) => {
    setBgmVolume(value);
    soundManager.setBGMVolume(value);
  };

  const handleEffectVolumeChange = (value: number) => {
    setEffectVolume(value);
    soundManager.setEffectVolume(value);
  };

  const handleBGMSelect = (bgmKey: string) => {
    if (!bgmKey) {
      soundManager.stopAllBGM();
      setSelectedBGM(null);
      setIsPlaying(false);
      return;
    }

    setSelectedBGM(bgmKey);
    soundManager.playBGM(bgmKey);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    const targetBGM = selectedBGM || bgmOptions[0]?.key;
    if (!targetBGM) return;

    if (!selectedBGM) {
      handleBGMSelect(targetBGM);
      return;
    }

    if (isPlaying) {
      soundManager.pauseBGM();
      setIsPlaying(false);
    } else {
      soundManager.resumeBGM();
      setIsPlaying(true);
    }
  };

  if (!isOpen || !anchorEl) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute top-full right-0 mt-2 z-1000 bg-[#1E1E2F]/70 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 p-6 w-[320px] animate-in fade-in zoom-in duration-200"
    >
      <div className="relative flex items-center mb-6">
        <h3 className="flex-1 text-sm font-bold text-white text-center">사운드 설정</h3>
        <button
          onClick={onClose}
          className="absolute right-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          aria-label="닫기"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-base text-gray-400 text-left mb-3">BGM 선택</label>
          <div className="flex items-center gap-2">
            <select
              value={selectedBGM || ''}
              onChange={(e) => handleBGMSelect(e.target.value)}
              className="flex-1 px-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-gray-200 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#1E1E2F]">
                선택 안함
              </option>
              {bgmOptions.map((bgm) => (
                <option key={bgm.key} value={bgm.key} className="bg-[#1E1E2F]">
                  {bgm.label}
                </option>
              ))}
            </select>
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all active:scale-95 group"
              aria-label={isPlaying ? '일시정지' : '재생'}
            >
              {isPlaying ? (
                <PauseIcon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              ) : (
                <PlayIcon className="w-5 h-5 text-white ml-0.5 group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <VolumeSlider label="BGM 볼륨" value={bgmVolume} onChange={handleBGMVolumeChange} />
          <VolumeSlider label="효과음 볼륨" value={effectVolume} onChange={handleEffectVolumeChange} />
        </div>
      </div>
    </div>
  );
}
