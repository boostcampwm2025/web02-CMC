import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SidebarHeader, { type SidebarTab } from './SidebarHeader';
import BattleInfoSection from './BattleInfoSection';
import ReferenceSection from './ReferenceSection';
import { useResize } from '../../hooks/useResize';
import SidebarTimelineSection from './SidebarTimelineSection';
import { useGetBattleInfo } from '@/commons/hooks/useGetBattleInfo';

interface BattleSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  raiseZIndex?: boolean;
  activeTab: SidebarTab;
  onActiveTabChange: (tab: SidebarTab) => void;
}

export default function BattleSidebar({
  isOpen,
  onClose,
  raiseZIndex = false,
  activeTab = 'info',
  onActiveTabChange
}: BattleSidebarProps) {
  const { id: battleId } = useParams<{ id: string }>();
  const { battleInfo } = useGetBattleInfo(battleId!);
  const { title, description, language, category, topics, referenceData } = battleInfo ?? {};
  const { width, isResizing, setIsResizing } = useResize({
    initialWidth: 400
  });

  const [isWideLayout, setIsWideLayout] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const hasReferenceData = !!referenceData;

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

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (!asideRef.current) return;

      if (!asideRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <BattleInfoSection
            title={title ?? ''}
            description={description ?? ''}
            language={language ?? 'javascript'}
            category={category ?? 'ALGORITHM'}
          />
        );
      case 'timeline':
        return <SidebarTimelineSection isWide={isWideLayout} topics={topics ?? []} />;
      case 'reference':
        return referenceData ? <ReferenceSection referenceData={referenceData} /> : null;
      default:
        return null;
    }
  };

  return (
    <aside
      data-tutorial="sidebar-panel"
      ref={asideRef}
      style={{ width: `${width}px` }}
      className={`fixed top-0 left-0 h-full sidebar-width bg-[#0a0a1a] border-r border-[#1A1A2E] transform transition-transform duration-300 ease-in-out shadow-2xl ${
        raiseZIndex ? 'z-[101]' : 'z-100'
      } ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isResizing ? 'select-none' : ''}`}
    >
      <SidebarHeader
        activeTab={activeTab}
        onTabChange={onActiveTabChange}
        onClose={onClose}
        hasReferenceData={hasReferenceData}
      />
      <div className="flex justify-between">
        <div className="flex-1 h-[calc(100vh-65px)] overflow-y-auto overflow-x-hidden">{renderContent()}</div>
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
