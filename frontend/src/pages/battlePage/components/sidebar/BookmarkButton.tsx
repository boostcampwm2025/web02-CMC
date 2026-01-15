import ClockIcon from '@/assets/icon/clock.svg?react';
import MessageIcon from '@/assets/icon/message.svg?react';

interface BookmarkButtonProps {
  onOpen: () => void;
  isOpen: boolean;
  highlight?: boolean;
}

export default function BookmarkButton({ onOpen, isOpen, highlight = false }: BookmarkButtonProps) {
  if (isOpen) return null;

  return (
    <div
      className={`fixed left-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 ${highlight ? 'z-[120]' : 'z-30'}`}
      data-tutorial="sidebar-buttons"
    >
      {/* 문제 설명 */}
      <button
        onClick={onOpen}
        className="group relative bg-linear-to-r from-[#FF6900] to-[#FF8533] px-3 py-2 rounded-r-md shadow-md hover:shadow-lg transition-all duration-200 hover:translate-x-1 flex items-center gap-1"
        aria-label="문제 설명 보기"
      >
        <MessageIcon className="w-3.5 h-3.5" />
        <span className="text-sm">문제 설명</span>
      </button>

      {/* 타임라인 */}
      <button
        onClick={onOpen}
        className="group relative bg-linear-to-r from-[#AD46FF] to-[#6BA3FF] px-3 py-2 rounded-r-md shadow-md hover:shadow-lg transition-all duration-200 hover:translate-x-1 flex items-center gap-1"
        aria-label="타임라인 보기"
      >
        <ClockIcon className="w-3.5 h-3.5" />
        <span className="text-sm">타임라인</span>
      </button>
    </div>
  );
}
