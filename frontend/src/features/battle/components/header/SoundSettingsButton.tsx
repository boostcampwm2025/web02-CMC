import { useState, useRef } from 'react';
import Icon from '@/commons/components/Icon';
import SoundSettingsPopover from './SoundSettingsPopover';
import Button from '@/commons/components/Button';

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
      <Button
        ref={soundButtonRef}
        variant="secondary"
        onClick={() => setIsSoundSettingsOpen(!isSoundSettingsOpen)}
        aria-label="사운드 설정"
        className="w-11 h-11 p-0 rounded-xl bg-[#2D2D3F]/80 shadow-lg border border-white/10"
      >
        <Icon name="sound" className="w-6 h-6" />
      </Button>
      <SoundSettingsPopover
        isOpen={isSoundSettingsOpen}
        onClose={() => setIsSoundSettingsOpen(false)}
        anchorEl={soundButtonRef.current}
        bgmOptions={bgmOptions}
      />
    </div>
  );
}
