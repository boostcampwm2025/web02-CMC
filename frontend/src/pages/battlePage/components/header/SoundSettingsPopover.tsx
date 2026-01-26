import { useState, useEffect, useRef } from 'react';
import { soundManager } from '@/commons/utils/soundManager';
import CloseIcon from '@/assets/icon/close.svg?react';
import PlayIcon from '@/assets/icon/play.svg?react';
import PauseIcon from '@/assets/icon/pause.svg?react';
import SoundIcon from '@/assets/icon/sound.svg?react';

interface SoundSettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

const BGM_OPTIONS = [
  { key: 'acoustic', label: 'Acoustic ambient', src: '/sounds/acoustic.mp3' },
  { key: 'groove', label: 'Groove', src: '/sounds/groove.mp3' },
  { key: 'hiphop', label: 'Hip Hop', src: '/sounds/hiphop.mp3' },
  { key: 'jazz', label: 'Jazz', src: '/sounds/jazz.mp3' },
  { key: 'lofi', label: 'Lo-Fi', src: '/sounds/lofi.mp3' }
];

export default function SoundSettingsPopover({ isOpen, onClose, anchorEl }: SoundSettingsPopoverProps) {
  const [volume, setVolume] = useState(soundManager.getBGMVolume());
  const [selectedBGM, setSelectedBGM] = useState<string | null>(soundManager.getCurrentBGM());
  const [isPlaying, setIsPlaying] = useState(soundManager.isBGMPlaying());
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setVolume(soundManager.getBGMVolume());
      setSelectedBGM(soundManager.getCurrentBGM());
      setIsPlaying(soundManager.isBGMPlaying());
    }
  }, [isOpen]);

  // BGM 재생 상태 주기적 확인
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setIsPlaying(soundManager.isBGMPlaying());
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorEl]);

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    soundManager.setBGMVolume(value);
    soundManager.setEffectVolume(value);
  };

  const handleBGMSelect = (bgm: (typeof BGM_OPTIONS)[0]) => {
    setSelectedBGM(bgm.key);
    soundManager.playBGM(bgm.key, bgm.src);
    setIsPlaying(true);
  };

  if (!isOpen || !anchorEl) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute top-full right-0 mt-2 z-[1000] bg-[#1E1E2F] rounded-lg shadow-xl border border-[#2D2D3F] p-4 w-[280px]"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">사운드 설정</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-300 transition-colors p-1" aria-label="닫기">
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>

      {/* 브금 선택 */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">브금</label>
        <div className="flex items-center gap-2">
          <select
            value={selectedBGM || ''}
            onChange={(e) => {
              const bgm = BGM_OPTIONS.find((opt) => opt.key === e.target.value);
              if (bgm) handleBGMSelect(bgm);
            }}
            className="flex-1 px-3 py-2 text-sm bg-[#2D2D3F] border border-[#3D3D4F] rounded hover:border-purple-600/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-300"
          >
            <option value="">음악 선택</option>
            {BGM_OPTIONS.map((bgm) => (
              <option key={bgm.key} value={bgm.key}>
                {bgm.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (selectedBGM) {
                // 일시정지/재생 토글
                if (isPlaying) {
                  // 재생 중이면 일시정지
                  soundManager.pauseBGM();
                  setIsPlaying(false);
                } else {
                  // 일시정지 중이면 재개
                  const currentBGM = soundManager.getCurrentBGM();
                  if (currentBGM) {
                    // 이전에 재생하던 BGM 재개
                    soundManager.resumeBGM();
                    setIsPlaying(true);
                  } else {
                    // 선택된 BGM 재생
                    const bgm = BGM_OPTIONS.find((opt) => opt.key === selectedBGM);
                    if (bgm) {
                      soundManager.playBGM(bgm.key, bgm.src);
                      setIsPlaying(true);
                    }
                  }
                }
              } else {
                // 선택된 BGM이 없으면 첫 번째 옵션 재생
                if (BGM_OPTIONS.length > 0) {
                  handleBGMSelect(BGM_OPTIONS[0]);
                  setIsPlaying(true);
                }
              }
            }}
            className="w-8 h-8 rounded-full bg-[#2D2D3F] hover:bg-[#3D3D4F] border border-[#3D3D4F] flex items-center justify-center transition-colors shrink-0"
            aria-label={selectedBGM && isPlaying ? 'BGM 일시정지' : 'BGM 재생'}
          >
            {selectedBGM && isPlaying ? (
              <PauseIcon className="w-4 h-4 text-white" />
            ) : (
              <PlayIcon className="w-4 h-4 text-white ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* 볼륨 조절 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-400">볼륨</label>
          <span className="text-xs text-gray-400">{Math.round(volume * 100)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <SoundIcon className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-[#2D2D3F] rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #9333ea 0%, #9333ea ${volume * 100}%, #2D2D3F ${volume * 100}%, #2D2D3F 100%)`
            }}
          />
        </div>
      </div>
    </div>
  );
}
