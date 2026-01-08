import { useState } from 'react';
import BattleIcon from '@/assets/icon/battle.svg?react';
import { isInputDisabled, getDiscussionConfig } from '../../utils/battlePhase';
import { useBattleStore, selectBattleProgress, selectSelectedTeam } from '../../stores/battleStore';
import { TEAM_COLORS } from '../../types/teamColors';

interface DiscussionInputProps {
  disabled?: boolean;
  onSubmit?: (content: string) => void;
}

export default function DiscussionInput({ disabled = false, onSubmit }: DiscussionInputProps) {
  const battleProgress = useBattleStore(selectBattleProgress);
  const team = useBattleStore(selectSelectedTeam);
  const [inputValue, setInputValue] = useState('');

  // 중립 진영은 DiscussionInput 표시 안 함
  if (team === 'NONE') {
    return null;
  }

  const phase = battleProgress?.phase;
  const turnStatus = battleProgress?.turn?.status;

  const { placeholderText, buttonText, Icon, isAttacking } = getDiscussionConfig(team, phase);
  const disabled_input = isInputDisabled(team, phase, turnStatus, disabled);

  const handleSubmit = () => {
    if (inputValue.trim() && !disabled_input) {
      onSubmit?.(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const hintText = isAttacking
    ? '상대 진영의 코드와 주장의 빈틈을 노려 반론을 던져보세요.'
    : '아직 이의제기 단계가 아닙니다. 잠시만 기다려주세요.';

  const colors = TEAM_COLORS[team];

  return (
    <section
      className={`w-full bg-linear-to-r ${colors.containerGradient} border ${colors.border} rounded-lg overflow-hidden shadow-lg`}
    >
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BattleIcon className={`w-5 h-5 ${colors.primary}`} />
            <h3 className="text-white text-[15px] font-semibold">{team}팀 이의제기</h3>
          </div>
          {isAttacking && (
            <div
              className={`flex items-center gap-1.5 bg-linear-to-r ${colors.badgeGradient} px-3 py-1.5 rounded-full`}
            >
              <span className="text-white text-[12px] font-medium">반격 시간</span>
            </div>
          )}
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholderText}
            disabled={disabled_input}
            autoFocus
            className={`flex-1 bg-[#2D2D3F] border ${colors.border} rounded-lg px-4 py-3 text-[14px] text-white placeholder-[#666] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
          />
          <button
            onClick={handleSubmit}
            disabled={disabled_input}
            className={`px-6 py-3 ${colors.primaryBg} text-white rounded-lg ${colors.buttonHover} ${colors.buttonActive} transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-[14px] shadow-md hover:shadow-lg`}
          >
            <Icon className="w-5 h-5" />
            {buttonText}
          </button>
        </div>

        <div className={`flex items-start gap-2 ${colors.primary} text-[12px]`}>
          <p className="leading-relaxed">{hintText}</p>
        </div>
      </div>
    </section>
  );
}
