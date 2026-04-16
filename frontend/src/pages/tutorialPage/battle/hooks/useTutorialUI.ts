import { useEffect, useRef, useState } from 'react';
import { useTutorial } from '@/features/battle/hooks/useTutorial';
import type { SidebarTab } from '@/pages/battlePage/components/sidebar/SidebarHeader';

interface UseTutorialUIOptions {
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

export function useTutorialUI({ isSidebarOpen, openSidebar, closeSidebar }: UseTutorialUIOptions) {
  const {
    isModalOpen: isTutorialOpen,
    currentStep,
    dontShowAgain,
    openTutorial,
    startTutorial,
    nextStep,
    prevStep,
    setDontShowAgain
  } = useTutorial();

  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('info');
  const sidebarOpenedForTutorial = useRef(false);

  useEffect(() => {
    openTutorial();
    setDontShowAgain(false);
  }, [openTutorial, setDontShowAgain]);

  useEffect(() => {
    if (!isTutorialOpen) return;
    if (currentStep !== 'welcome') return;
    startTutorial();
  }, [isTutorialOpen, currentStep, startTutorial]);

  useEffect(() => {
    if (!isTutorialOpen) return;
    if (currentStep === 'sidebarPanel') {
      setActiveSidebarTab('info');
      return;
    }
    setActiveSidebarTab('timeline');
  }, [currentStep, isTutorialOpen]);

  useEffect(() => {
    const shouldOpenSidebar = isTutorialOpen && currentStep === 'sidebarPanel';

    if (shouldOpenSidebar && !isSidebarOpen) {
      openSidebar();
      sidebarOpenedForTutorial.current = true;
      return;
    }

    if (!shouldOpenSidebar && sidebarOpenedForTutorial.current) {
      closeSidebar();
      sidebarOpenedForTutorial.current = false;
    }
  }, [currentStep, isSidebarOpen, isTutorialOpen, openSidebar, closeSidebar]);

  return {
    isTutorialOpen,
    currentStep,
    dontShowAgain,
    startTutorial,
    nextStep,
    prevStep,
    setDontShowAgain,
    activeSidebarTab,
    setActiveSidebarTab
  };
}
