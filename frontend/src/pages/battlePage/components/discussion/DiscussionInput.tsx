import { useState } from 'react';
import { getDiscussionConfig, isInputDisabled } from '../../utils/battlePhase';
import { useBattleStore, selectBattleProgress, selectSelectedTeam } from '../../stores/battleStore';
import BattleIcon from '@/assets/icon/battle.svg?react';
import ShieldIcon from '@/assets/icon/shield.svg?react';

interface DiscussionInputProps {
  disabled?: boolean;
  onSubmit?: (content: string) => void;
}

export default function DiscussionInput({ disabled = false, onSubmit }: DiscussionInputProps) {
  const battleProgress = useBattleStore(selectBattleProgress);
  const team = useBattleStore(selectSelectedTeam);
  const [inputValue, setInputValue] = useState('');

  const phase = battleProgress?.phase;
  const shouldShow = !isInputDisabled(team, phase);

  // 중립 진영이거나 공격/방어 Phase가 아니면 DiscussionInput 표시 안 함
  if (!shouldShow) {
    return null;
  }

  const config = getDiscussionConfig(phase);

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

  // Phase별 컬러 및 아이콘 설정
  const getPhaseStyle = () => {
    if (phase === 'ATTACK') {
      return {
        Icon: BattleIcon,
        iconBoxBg: 'bg-red-500/20',
        iconColor: 'text-red-400',
        borderColor: 'border-red-500/50',
        focusRingColor: 'focus:ring-red-500/50',
        bgGradient: 'from-red-950/70 to-red-900/50',
        textColor: 'text-red-400'
      };
    } else {
      // DEFENSE
      return {
        Icon: ShieldIcon,
        iconBoxBg: 'bg-blue-500/20',
        iconColor: 'text-blue-400',
        borderColor: 'border-blue-500/50',
        focusRingColor: 'focus:ring-blue-500/50',
        bgGradient: 'from-blue-950/70 to-blue-900/50',
        textColor: 'text-blue-400'
      };
    }
  };

  const phaseStyle = getPhaseStyle();
  const PhaseIcon = phaseStyle.Icon;

  return (
    <section
      className={`w-full bg-linear-to-r ${phaseStyle.bgGradient} border ${phaseStyle.borderColor} rounded-lg overflow-hidden shadow-lg`}
      data-tutorial="discussion-input"
    >
      <div className="px-4 py-4">
        <div className="flex items-center gap-4">
          {/* 좌측 아이콘 박스 */}
          <div className={`rounded-xl flex items-center justify-center shrink-0 w-16 h-16 ${phaseStyle.iconBoxBg}`}>
            <PhaseIcon className={`w-8 h-8 ${phaseStyle.iconColor}`} />
          </div>

          {/* 입력 영역 */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={config.placeholderText}
                disabled={disabled}
                autoFocus
                className={`flex-1 bg-black/30 backdrop-blur-md border ${phaseStyle.borderColor} rounded-lg px-4 py-3 text-[14px] text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${phaseStyle.focusRingColor} disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
              />
              <button
                onClick={handleSubmit}
                disabled={disabled}
                className={`px-4 py-3 bg-black/30 backdrop-blur-md text-white rounded-lg border border-white/10 transition-all flex items-center justify-center gap-2`}
              >
                {config.buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
