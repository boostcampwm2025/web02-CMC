import { useState, useEffect, useRef } from 'react';
import { getDiscussionConfig } from '../../utils/battlePhase';
import { useBattleStore, selectBattleProgress } from '../../stores/battleStore';

interface DiscussionInputProps {
  disabled?: boolean;
  onSubmit?: (content: string) => void;
}

export default function DiscussionInput({ disabled = false, onSubmit }: DiscussionInputProps) {
  const battleProgress = useBattleStore(selectBattleProgress);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0.2);
  const inputRef = useRef<HTMLInputElement>(null);

  const phase = battleProgress?.phase;
  const config = getDiscussionConfig(phase);
  const PhaseIcon = config.Icon;

  // 아이콘 펄스 애니메이션
  useEffect(() => {
    if (disabled) return;

    const interval = setInterval(() => {
      setGlowIntensity((prev) => (prev === 0.2 ? 0.5 : 0.2));
    }, 700);

    return () => clearInterval(interval);
  }, [disabled]);

  // Phase 변경 시 input 초기화 및 focus
  useEffect(() => {
    setInputValue('');
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [phase, disabled]);

  const handleSubmit = () => {
    if (inputValue.trim() && !disabled) {
      onSubmit?.(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSubmit();
    }
  };

  if (!config.isActive || !PhaseIcon) return null;

  return (
    <section
      className={`relative w-full rounded-xl overflow-visible border-2 transition-all duration-500 ${config.colors.bg} ${config.colors.glowBorder} ${
        isFocused ? 'scale-[1.01]' : ''
      }`}
    >
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1 rounded-b-lg text-xs font-bold tracking-wider uppercase border-x border-b ${config.colors.badge}`}
      >
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          {config.label} 페이즈
        </span>
      </div>

      <div className="relative px-5 py-6 pt-8">
        <div className="flex items-center gap-4">
          <div
            className={`rounded-xl flex items-center justify-center shrink-0 w-16 h-16 border-2 ${config.colors.iconBox}`}
          >
            <PhaseIcon
              className={`w-8 h-8 ${config.colors.icon} transition-transform duration-300 ${
                glowIntensity > 0.3 ? 'scale-110' : 'scale-100'
              }`}
            />
          </div>

          <div className="flex-1 flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={config.placeholderText}
              disabled={disabled}
              className={`w-full bg-black/30 backdrop-blur-sm rounded-lg px-4 py-3.5 text-sm text-white placeholder-gray-500/60 border-2 transition-colors focus:outline-none focus:ring-2 ${
                isFocused ? config.colors.focusBorder : config.colors.border
              } ${config.colors.focusRing} disabled:opacity-50 disabled:cursor-not-allowed`}
            />

            <button
              onClick={handleSubmit}
              disabled={disabled || !inputValue.trim()}
              className={`px-5 py-3.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all whitespace-nowrap shrink-0 ${config.colors.button} disabled:opacity-40 disabled:cursor-not-allowed ${
                !disabled && inputValue.trim() ? 'hover:scale-105' : ''
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
