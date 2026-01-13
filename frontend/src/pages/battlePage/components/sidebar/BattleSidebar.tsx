import { useState } from 'react';
import ClockIcon from '@/assets/icon/clock.svg?react';
import MessageIcon from '@/assets/icon/message.svg?react';
import CloseIcon from '@/assets/icon/close.svg?react';
import TimelineSection from '../timeline/TimelineSection';
import { useResize } from '../../hooks/useResize';

interface BattleSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  language: string;
  category: string;
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
      {/* 헤더 */}
      <div>
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex gap-6 flex-1">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-2 px-2 py-2 text-[15px] font-bold transition-colors ${
                activeTab === 'info' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <MessageIcon className="w-5 h-5" />
              문제 설명
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
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

      {/* 컨텐츠 영역 */}
      <div className="flex justify-between">
        <div className="flex-1 h-[calc(100vh-65px)] overflow-y-auto overflow-x-hidden">
          {activeTab === 'info' ? (
            <div className="p-6 space-y-8">
              {/* 제목 */}
              <div className="text-left">
                <p className="text-orange-500  font-semibold  mb-3">제목</p>
                <h3 className=" text-xl   leading-relaxed">{title}</h3>
              </div>

              {/* 설명 */}
              <div className="text-left">
                <p className="text-orange-500  font-semibold  mb-3">설명</p>
                <p className="leading-relaxed">{description}</p>
              </div>

              <div className="flex gap-4">
                {/* 언어 */}
                <div className="bg-[#1E1E2F] rounded-lg px-4 py-3 shadow w-1/2 flex flex-col  gap-2 items-start">
                  <h3 className="text-gray-400  text-sm">언어</h3>
                  <p className="text-white text-[14px] font-semibold">{language}</p>
                </div>
                {/* 카테고리 */}
                <div className="bg-[#1E1E2F] rounded-lg px-4 py-3 shadow w-1/2 flex flex-col  gap-2 items-start">
                  <h3 className="text-gray-400  text-sm">카테고리</h3>
                  <p className="text-white text-[14px] font-semibold">{category}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 py-2">
              <div className="w-full [&_section]:w-full [&_section]:mt-0">
                <TimelineSection />
              </div>
            </div>
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
