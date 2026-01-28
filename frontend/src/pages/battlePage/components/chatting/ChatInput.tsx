import SendIcon from '@/assets/icon/send.svg?react';
import { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue) {
      onSend(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-[#2D2D3F]">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          className="flex-1 bg-[#2D2D3F] border border-[#3D3D4F] rounded-md px-3 py-2.5 text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#FF6900]"
        />
        <button onClick={handleSend} className="p-2.5 rounded-md bg-[#3D3D4F] hover:bg-[#4D4D5F] transition-colors">
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
