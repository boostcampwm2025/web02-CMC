import { useState, useRef, useEffect } from 'react';
import SidebarHeader from './SidebarHeader';
import BattleInfoSection from './BattleInfoSection';
import { useResize } from '../../hooks/useResize';
import SidebarTimelineSection from './SidebarTimelineSection';

interface BattleSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  language: string;
  category: string;
  topics: string[];
  raiseZIndex?: boolean;
  activeTab: Tab;
  onActiveTabChange: (tab: Tab) => void;
}

type Tab = 'info' | 'timeline';

export default function BattleSidebar({
  isOpen,
  onClose,
  title,
  description,
  language,
  category,
  topics,
  raiseZIndex = false,
  activeTab = 'info',
  onActiveTabChange
}: BattleSidebarProps) {
  const { width, isResizing, setIsResizing } = useResize({
    initialWidth: 400
  });

  const [isWideLayout, setIsWideLayout] = useState(false);
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setIsWideLayout(entries[0].contentRect.width >= 650);
      }
    });
    if (asideRef.current) {
      observer.observe(asideRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <aside
      data-tutorial="sidebar-panel"
      ref={asideRef}
      style={{ width: `${width}px` }}
      className={`fixed top-0 left-0 h-full sidebar-width bg-[#0a0a1a] border-r border-[#1A1A2E] transform transition-transform duration-300 ease-in-out shadow-2xl ${
        raiseZIndex ? 'z-[101]' : 'z-100'
      } ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isResizing ? 'select-none' : ''}`}
    >
      <SidebarHeader activeTab={activeTab} onTabChange={onActiveTabChange} onClose={onClose} />
      <div className="flex justify-between">
        <div className="flex-1 h-[calc(100vh-65px)] overflow-y-auto overflow-x-hidden">
          {activeTab === 'info' ? (
            <BattleInfoSection title={title} description={description} language={language} category={category} />
          ) : (
            <SidebarTimelineSection isWide={isWideLayout} topics={topics} />
          )}
        </div>
        <div className="relative h-[calc(100vh-65px)]">
          <button
            onMouseDown={() => setIsResizing(true)}
            className="peer absolute right-0 top-1/2 -translate-y-1/2 w-1 h-20 bg-orange-400 hover:bg-orange-500 cursor-ew-resize transition-colors z-10"
          />
          <div className="absolute inset-y-0 right-0 w-2 bg-orange-400/30 opacity-0 peer-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
      </div>
    </aside>
  );
}
