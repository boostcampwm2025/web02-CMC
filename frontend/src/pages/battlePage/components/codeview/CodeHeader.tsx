interface CodeHeaderProps {
  onViewChange: (view: 'split' | 'tab') => void;
  currentView: 'split' | 'tab';
  currentTab: 'A' | 'B';
  onTabChange: (tab: 'A' | 'B') => void;
}

export default function CodeHeader({ onViewChange, currentView, currentTab, onTabChange }: CodeHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2D2D3F]">
      <button
        onClick={() => onViewChange('split')}
        className={`px-4 py-2 rounded-md text-sm transition-colors ${
          currentView === 'split' ? 'bg-[#FF6900] text-white' : 'text-[#99A1AF]'
        }`}
      >
        스플릿 뷰
      </button>
      <button
        onClick={() => onViewChange('tab')}
        className={`px-4 py-2 rounded-md text-sm transition-colors ${
          currentView === 'tab' ? 'bg-[#FF6900] text-white' : 'text-[#99A1AF]'
        }`}
      >
        탭 뷰
      </button>

      {currentView === 'tab' && (
        <div className="flex items-center gap-2 ml-4 border-l border-[#2D2D3F] pl-4">
          <button
            onClick={() => onTabChange('A')}
            className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
              currentTab === 'A' ? 'bg-[#2B7FFF] text-white' : 'text-[#51A2FF] hover:bg-[#1C2B4A]'
            }`}
          >
            A팀
          </button>
          <button
            onClick={() => onTabChange('B')}
            className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
              currentTab === 'B' ? 'bg-[#FB2C36] text-white' : 'text-[#FF5A5F] hover:bg-[#2D1F2B]'
            }`}
          >
            B팀
          </button>
        </div>
      )}
    </div>
  );
}
