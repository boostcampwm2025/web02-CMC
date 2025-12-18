import SendIcon from '@/assets/icon/send.svg?react';

export default function ChatInput() {
  return (
    <div className="p-4 border-t border-[#2D2D3F]">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="메시지를 입력하세요..."
          className="flex-1 bg-[#2D2D3F] border border-[#3D3D4F] rounded-md px-3 py-2.5 text-[13px] text-white placeholder-[#666] focus:outline-none focus:border-[#FF6900]"
        />
        <button className="p-2.5 rounded-md bg-[#3D3D4F] hover:bg-[#4D4D5F] transition-colors">
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
