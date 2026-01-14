import { useState } from 'react';
import SidebarHeader from './SidebarHeader';
import BattleInfoSection from './BattleInfoSection';
import TimelineSection from '../timeline/TimelineSection';
import { useResize } from '../../hooks/useResize';

interface BattleSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  language: string;
  category: string;
  raiseZIndex?: boolean;
}

type Tab = 'info' | 'timeline';

export default function BattleSidebar({ isOpen, onClose, title, description, language, category }: BattleSidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const { width, isResizing, setIsResizing } = useResize({
    initialWidth: 400
  });

  return (
    <aside
      style={{ width: `${width}px` }}
      className={`fixed top-0 left-0 h-full bg-[#0a0a1a] border-r border-[#1A1A2E] z-100 transform transition-transform duration-300 ease-in-out shadow-2xl ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isResizing ? 'select-none' : ''}`}
    >
      <SidebarHeader activeTab={activeTab} onTabChange={setActiveTab} onClose={onClose} />
      <div className="flex justify-between">
        <div className="flex-1 h-[calc(100vh-65px)] overflow-y-auto overflow-x-hidden">
          {activeTab === 'info' ? (
            <BattleInfoSection title={title} description={description} language={language} category={category} />
          ) : (
            <TimelineSection />
          )}
        </div>
        <div className="relative h-[calc(100vh-65px)]">
          <button
            onMouseDown={() => setIsResizing(true)}
            className="peer absolute right-0 top-1/2 -translate-y-1/2 w-[4px] h-[80px] bg-orange-400 hover:bg-orange-500 cursor-ew-resize transition-colors z-10"
          />
          <div className="absolute inset-y-0 right-0 w-[8px] bg-orange-400/30 opacity-0 peer-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
      </div>
    </aside>
  );
}
