import BattleIcon from '@/assets/icon/battle.svg?react';
import { useState } from 'react';

interface ObjectionInputProps {
  disabled?: boolean;
  onSubmit?: (content: string) => void;
}

export default function ObjectionInput({ disabled = false, onSubmit }: ObjectionInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    if (inputValue.trim() && !disabled) {
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
    <section className="w-[500px] bg-[#1E1E2F] rounded-lg overflow-hidden">
      <div className="p-4 flex gap-1">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="상대 진영에 이의제기..."
          autoFocus
          className="w-full bg-[#2D2D3F] border border-[#FF5A5F] rounded-md px-4 py-3 text-[13px] text-white placeholder-[#666] focus:outline-none focus:border-[#FF5A5F]"
        />
        <button
          onClick={handleSubmit}
          className="w-[140px] px-3 py-2 bg-[#4A5568] text-[13px] text-white rounded-md hover:bg-[#5A6578] transition-colors flex items-center gap-1"
        >
          <BattleIcon className="w-[24px] h-[24px]" />
          이의제기
        </button>
      </div>
    </section>
  );
}
