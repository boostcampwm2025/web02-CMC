import { useState } from 'react';
import { isInputDisabled, getDiscussionConfig } from '../../utils/battlePhase';
import { useBattleStore, selectBattleProgress, selectSelectedTeam } from '../../stores/battleStore';

interface DiscussionInputProps {
  disabled?: boolean;
  onSubmit?: (content: string) => void;
}

export default function DiscussionInput({ disabled = false, onSubmit }: DiscussionInputProps) {
  const battleProgress = useBattleStore(selectBattleProgress);
  const team = useBattleStore(selectSelectedTeam);
  const [inputValue, setInputValue] = useState('');

  const phase = battleProgress?.phase;
  const turnStatus = battleProgress?.turn?.status;

  const { placeholderText, buttonText, Icon } = getDiscussionConfig(team, phase);
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

  return (
    <section className="w-full bg-[#1E1E2F] rounded-lg overflow-hidden">
      <div className="p-4 flex gap-1">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholderText}
          disabled={disabled_input}
          autoFocus
          className="w-full bg-[#2D2D3F] border border-[#FF5A5F] rounded-md px-4 py-3 text-[13px] text-white placeholder-[#666] focus:outline-none focus:border-[#FF5A5F] disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled_input}
          className="w-[140px] py-2 bg-[#4A5568] text-[15px] text-white rounded-md hover:bg-[#5A6578] transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#4A5568]"
        >
          <Icon className="w-[22px] h-[22px]" />
          {buttonText}
        </button>
      </div>
    </section>
  );
}
