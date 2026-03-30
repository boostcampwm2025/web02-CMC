import Icon from '@/commons/components/Icon';

export type SidebarTab = 'info' | 'timeline' | 'reference';

interface SidebarHeaderProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onClose: () => void;
  hasReferenceData: boolean;
}

export default function SidebarHeader({ activeTab, onTabChange, onClose, hasReferenceData }: SidebarHeaderProps) {
  const getUnderlineColor = () => {
    switch (activeTab) {
      case 'info':
        return 'bg-linear-to-r from-[#FF6900] to-[#FF8533]';
      case 'timeline':
        return 'bg-linear-to-r from-[#AD46FF] to-[#6BA3FF]';
      case 'reference':
        return 'bg-gradient-to-r from-green-600 to-emerald-600';
      default:
        return 'bg-linear-to-r from-[#FF6900] to-[#FF8533]';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <div className="flex gap-4 flex-1">
          <button
            onClick={() => onTabChange('info')}
            className={`flex items-center gap-2 px-2 py-2 text-sm font-bold transition-colors ${
              activeTab === 'info' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon name="message" className="w-5 h-5" />
            문제 설명
          </button>
          <button
            onClick={() => onTabChange('timeline')}
            className={`flex items-center gap-2 px-2 py-2 text-sm font-bold transition-colors ${
              activeTab === 'timeline' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon name="clock" className="w-5 h-5" />
            타임라인
          </button>
          {hasReferenceData && (
            <button
              onClick={() => onTabChange('reference')}
              className={`flex items-center gap-2 px-2 py-2 text-sm font-bold transition-colors ${
                activeTab === 'reference' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon name="bookOpen" className="w-5 h-5" />
              참고 자료
            </button>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label=" 닫기">
          <Icon name="close" className="w-5 h-5 " />
        </button>
      </div>
      {/* 활성 탭 밑줄 */}
      <div className={`h-0.5 transition-all duration-300 ${getUnderlineColor()}`} />
    </div>
  );
}
