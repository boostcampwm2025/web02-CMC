import MessageIcon from '@/assets/icon/message.svg?react';
import ClockIcon from '@/assets/icon/clock.svg?react';
import CloseIcon from '@/assets/icon/close.svg?react';

interface SidebarHeaderProps {
  activeTab: 'info' | 'timeline';
  onTabChange: (tab: 'info' | 'timeline') => void;
  onClose: () => void;
}

export default function SidebarHeader({ activeTab, onTabChange, onClose }: SidebarHeaderProps) {
  return (
    <div>
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <div className="flex gap-6 flex-1">
          <button
            onClick={() => onTabChange('info')}
            className={`flex items-center gap-2 px-2 py-2 text-[15px] font-bold transition-colors ${
              activeTab === 'info' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageIcon className="w-5 h-5" />
            문제 설명
          </button>
          <button
            onClick={() => onTabChange('timeline')}
            className={`flex items-center gap-2 px-2 py-2 text-[15px] font-bold transition-colors ${
              activeTab === 'timeline' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ClockIcon className="w-5 h-5" />
            타임라인
          </button>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label=" 닫기">
          <CloseIcon className="w-5 h-5 " />
        </button>
      </div>
      {/* 활성 탭 밑줄 */}
      <div
        className={`h-[2px] transition-all duration-300 ${
          activeTab === 'info'
            ? 'bg-linear-to-r from-[#FF6900] to-[#FF8533]'
            : 'bg-linear-to-r from-[#AD46FF] to-[#6BA3FF]'
        }`}
      />
    </div>
  );
}
