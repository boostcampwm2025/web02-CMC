import { useState, useRef } from 'react';
import { getDiscussionConfig } from '../../utils/battlePhase';
import { useBattleStore, selectBattleProgress } from '../../stores/battleStore';
import BattleIcon from '@/assets/icon/battle.svg?react';
import ShieldIcon from '@/assets/icon/shield.svg?react';

const MAX_LENGTH = 120;

interface DiscussionInputProps {
  onSubmit?: (content: string) => void;
}

export default function DiscussionInput({ onSubmit }: DiscussionInputProps) {
  const battleProgress = useBattleStore(selectBattleProgress);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const round = battleProgress?.round;
  const phase = battleProgress?.phase;
  const config = getDiscussionConfig(phase);
  const PhaseIcon = phase === 'ATTACK' ? BattleIcon : ShieldIcon;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    const over = newValue.length > MAX_LENGTH;

    if (over) {
      if (inputValue.length < MAX_LENGTH) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
      newValue = newValue.slice(0, MAX_LENGTH);
    }

    setInputValue(newValue);
  };

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSubmit?.(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSubmit();
    }
  };

  if (!config.isActive) return null;

  return (
    <section
      className={`discussion-input-width relative rounded-xl overflow-visible border-2 transition-all duration-500 ${config.colors.bg} ${config.colors.glowBorder} ${
        isFocused ? 'scale-[1.01]' : ''
      }`}
    >
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1 rounded-b-lg text-xs font-bold tracking-wider uppercase border-x border-b ${config.colors.badge}`}
      >
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          {round}R {config.label}
        </span>
      </div>

      <div className=" relative px-5 py-6 pt-8">
        <div className="flex items-center gap-4">
          <div
            className={`rounded-xl flex items-center justify-center shrink-0 w-16 h-16 border-2 ${config.colors.iconBox}
    animate-pulse`}
          >
            <PhaseIcon className={`w-8 h-8 ${config.colors.icon}`} />
          </div>

          <div className="flex-1 flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={config.placeholderText}
              autoFocus
              className={`w-full bg-black/30 backdrop-blur-sm rounded-lg px-4 py-3.5 text-sm text-white placeholder-gray-500/60 border-2 transition-colors focus:outline-none focus:ring-2 ${
                isFocused ? config.colors.focusBorder : config.colors.border
              } ${config.colors.focusRing} ${isShaking ? 'animate-input-exceed-shake' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
            />

            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim()}
              className={`px-5 py-3.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all whitespace-nowrap shrink-0 ${config.colors.button} disabled:opacity-40 disabled:cursor-not-allowed ${
                inputValue.trim() ? 'hover:scale-105' : ''
              }`}
            >
              {config.buttonText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
