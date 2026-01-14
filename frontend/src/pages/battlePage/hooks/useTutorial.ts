import { useState, useCallback } from 'react';

const TUTORIAL_STORAGE_KEY = 'battlePageTutorialCompleted';

export type TutorialStep =
  | 'welcome'
  | 'phaseGuide'
  | 'timer'
  | 'teamStatus'
  | 'codeCompare'
  | 'vote'
  | 'chat'
  | 'discussionInput'
  | 'completed';

interface UseTutorialReturn {
  // 모달 상태
  isModalOpen: boolean;
  currentStep: TutorialStep;
  dontShowAgain: boolean;

  // 액션
  openTutorial: () => void;
  closeTutorial: () => void;
  startTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  setDontShowAgain: (value: boolean) => void;
}

export function useTutorial(): UseTutorialReturn {
  const [isModalOpen, setIsModalOpen] = useState(() => {
    const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    return completed !== 'true';
  });
  const [currentStep, setCurrentStep] = useState<TutorialStep>('welcome');
  const [dontShowAgain, setDontShowAgainState] = useState(false);

  // 튜토리얼 열기
  const openTutorial = useCallback(() => {
    setCurrentStep('welcome');
    setIsModalOpen(true);
  }, []);

  // 튜토리얼 닫기
  const closeTutorial = useCallback(() => {
    if (dontShowAgain) {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    }
    setIsModalOpen(false);
    setCurrentStep('welcome');
  }, [dontShowAgain]);

  // 튜토리얼 시작
  const startTutorial = useCallback(() => {
    setCurrentStep('phaseGuide');
  }, [dontShowAgain]);

  // 다음 단계로
  const nextStep = useCallback(() => {
    const steps: TutorialStep[] = [
      'welcome',
      'phaseGuide',
      'timer',
      'teamStatus',
      'codeCompare',
      'vote',
      'chat',
      'discussionInput',
      'completed'
    ];
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex < steps.length - 1) {
      const nextStepValue = steps[currentIndex + 1];
      setCurrentStep(nextStepValue);

      // 마지막 단계 완료 시
      if (nextStepValue === 'completed') {
        if (dontShowAgain) {
          localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
        }
        setTimeout(() => {
          closeTutorial();
        }, 1500);
      }
    }
  }, [currentStep, dontShowAgain, closeTutorial]);

  // 이전 단계로
  const prevStep = useCallback(() => {
    const steps: TutorialStep[] = [
      'welcome',
      'phaseGuide',
      'timer',
      'teamStatus',
      'codeCompare',
      'vote',
      'chat',
      'discussionInput',
      'completed'
    ];
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  }, [currentStep]);

  // 튜토리얼 건너뛰기
  const skipTutorial = useCallback(() => {
    if (dontShowAgain) {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    }
    closeTutorial();
  }, [dontShowAgain, closeTutorial]);

  // 다시 보지 않기 설정
  const setDontShowAgain = useCallback((value: boolean) => {
    setDontShowAgainState(value);
  }, []);

  return {
    isModalOpen,
    currentStep,
    dontShowAgain,
    openTutorial,
    closeTutorial,
    startTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    setDontShowAgain
  };
}
