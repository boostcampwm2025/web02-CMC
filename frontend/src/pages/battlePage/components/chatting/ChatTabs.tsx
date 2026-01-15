import PeopleIcon from '@/assets/icon/peoples.svg?react';
import WordIcon from '@/assets/icon/world.svg?react';

interface ChatTabsProps {
  activeTab: 'team' | 'all';
  onTabChange: (tab: 'team' | 'all') => void;
  team: 'A' | 'B' | 'NONE';
  unreadTeamCount: number;
  unreadAllCount: number;
}

export default function ChatTabs({ activeTab, onTabChange, team, unreadTeamCount, unreadAllCount }: ChatTabsProps) {
  const teamColor = team === 'A' ? 'bg-blue-600' : team === 'B' ? 'bg-red-600' : 'bg-gray-600';
  const showAllCount = unreadAllCount > 0;
  const showTeamCount = unreadTeamCount > 0;

  if (team === 'NONE') {
    return (
      <div className="flex-1 py-3 w-full text-[13px] font-medium rounded-t-lg bg-[#FF6900] text-white">
        <span className="flex items-center justify-center gap-1">
          <WordIcon className="w-[20px] h-[20px]" />
          <span className="">전체 라운지</span>
          {showAllCount && (
            <span className="min-w-[18px] px-1.5 py-[1px] text-[11px] rounded-full bg-white/20 text-white">
              {unreadAllCount}
            </span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div className="flex gap-0 bg-[#2D2D3F] rounded-lg p-1">
      <button
        onClick={() => onTabChange('team')}
        className={`flex-1 py-3 px-3 text-[13px] font-medium rounded-md transition-colors ${
          activeTab === 'team' ? `${teamColor} text-white` : 'bg-transparent text-[#99A1AF] hover:text-white'
        }`}
      >
        <span className="flex items-center justify-center gap-1">
          <PeopleIcon className="w-[20px] h-[20px]" />
          <span className="">팀 라운지</span>
          {showTeamCount && (
            <span className="min-w-[18px] px-1.5 py-[1px] text-[11px] rounded-full bg-black/30 text-white">
              {unreadTeamCount}
            </span>
          )}
        </span>
      </button>
      <button
        onClick={() => onTabChange('all')}
        className={`flex-1 py-3 px-3 text-[13px] font-medium rounded-md transition-colors ${
          activeTab === 'all' ? 'bg-[#FF6900] text-white' : 'bg-transparent text-[#99A1AF] hover:text-white'
        }`}
      >
        <span className="flex items-center justify-center gap-1">
          <WordIcon className="w-[20px] h-[20px]" />
          <span className="">전체 라운지</span>
          {showAllCount && (
            <span className="min-w-[18px] px-1.5 py-[1px] text-[11px] rounded-full bg-black/30 text-white">
              {unreadAllCount}
            </span>
          )}
        </span>
      </button>
    </div>
  );
}
