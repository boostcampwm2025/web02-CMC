interface CodeHeaderProps {
  onViewChange: (view: 'split' | 'tab') => void;
  currentView: 'split' | 'tab';
}

export default function CodeHeader({ onViewChange, currentView }: CodeHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2D2D3F]">
      <button
        onClick={() => onViewChange('split')}
        className={`px-4 py-2 rounded-md text-[14px] transition-colors ${
          currentView === 'split' ? 'bg-[#FF6900] text-white' : 'text-[#99A1AF]'
        }`}
      >
        스플릿 뷰
      </button>
      <button
        onClick={() => onViewChange('tab')}
        className={`px-4 py-2 rounded-md text-[14px] transition-colors ${
          currentView === 'tab' ? 'bg-[#FF6900] text-white' : 'text-[#99A1AF]'
        }`}
      >
        탭 뷰
      </button>
    </div>
  );
}
