import { useState, useRef } from 'react';
import SoundIcon from '@/assets/icon/sound.svg?react';
import SoundSettingsPopover from './SoundSettingsPopover';

export interface BGMOption {
  key: string;
  label: string;
  src: string;
}

interface SoundSettingsButtonProps {
  bgmOptions: BGMOption[];
}

export default function SoundSettingsButton({ bgmOptions }: SoundSettingsButtonProps) {
  const [isSoundSettingsOpen, setIsSoundSettingsOpen] = useState(false);
  const soundButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="fixed top-4 right-4 z-10">
      <button
        ref={soundButtonRef}
        onClick={() => setIsSoundSettingsOpen(!isSoundSettingsOpen)}
        className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#2D2D3F]/80 hover:bg-[#3D3D4F] text-white transition-all shadow-lg border border-white/10"
        aria-label="사운드 설정"
      >
        <SoundIcon className="w-6 h-6" />
      </button>
      <SoundSettingsPopover
        isOpen={isSoundSettingsOpen}
        onClose={() => setIsSoundSettingsOpen(false)}
        anchorEl={soundButtonRef.current}
        bgmOptions={bgmOptions}
      />
    </div>
  );
}
