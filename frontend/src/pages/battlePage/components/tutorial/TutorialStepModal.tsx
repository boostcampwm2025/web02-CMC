import type { TutorialStep } from '../../hooks/useTutorial';
import { useSpotlight } from '../../hooks/useSpotlight';
import type { SpotlightPosition } from '../../hooks/useSpotlight';
import SpotlightOverlay from './SpotlightOverlay';
import TutorialVoteExample from './TutorialVoteExample';
import TutorialDiscussionInput from './TutorialDiscussionInput';
import TutorialProgressBoard from './TutorialProgressBoard';
import { TUTORIAL_STEPS, TOTAL_STEPS } from './const/tutorialSteps';
import QuestionIcon from '@/assets/icon/question.svg?react';

const MODAL_WIDTH = 448;
const MODAL_GAP = 32;
const MODAL_MIN_TOP = 80;
const MODAL_ESTIMATED_HEIGHT = 400;
const DISCUSSION_INPUT_MODAL_BOTTOM = '10rem';

interface TutorialStepModalProps {
  isOpen: boolean;
  currentStep: TutorialStep;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
}

const getModalPosition = (spotlight: SpotlightPosition | null) => {
  if (!spotlight) {
    return { bottom: '5rem', left: '50%', transform: 'translateX(-50%)' };
  }

  const { top, left, width, height } = spotlight;
  const rightSpace = window.innerWidth - (left + width);
  const leftSpace = left;
  const bottomSpace = window.innerHeight - (top + height);
  const topSpace = top;

  // 오른쪽에 충분한 공간이 있는 경우
  if (rightSpace >= MODAL_WIDTH + MODAL_GAP * 2) {
    return {
      top: `${Math.max(MODAL_MIN_TOP, top)}px`,
      left: `${left + width + MODAL_GAP}px`
    };
  }

  // 왼쪽에 충분한 공간이 있는 경우
  if (leftSpace >= MODAL_WIDTH + MODAL_GAP * 2) {
    return {
      top: `${Math.max(MODAL_MIN_TOP, top)}px`,
      left: `${left - MODAL_WIDTH - MODAL_GAP}px`
    };
  }

  // 하단에 충분한 공간이 있는 경우
  if (bottomSpace >= MODAL_ESTIMATED_HEIGHT + MODAL_GAP * 2) {
    return {
      top: `${top + height + MODAL_GAP}px`,
      left: '50%',
      transform: 'translateX(-50%)'
    };
  }

  // 상단에 충분한 공간이 있는 경우
  if (topSpace >= MODAL_ESTIMATED_HEIGHT + MODAL_GAP) {
    return {
      bottom: `${window.innerHeight - top + MODAL_GAP}px`,
      left: '50%',
      transform: 'translateX(-50%)'
    };
  }

  // 기본: 중앙 하단
  return { bottom: '5rem', left: '50%', transform: 'translateX(-50%)' };
};

const getModalStyle = (currentStep: TutorialStep, spotlight: SpotlightPosition | null) => {
  if (currentStep === 'discussionInput') {
    return { bottom: DISCUSSION_INPUT_MODAL_BOTTOM, left: '50%', transform: 'translateX(-50%)' };
  }
  return getModalPosition(spotlight);
};

export default function TutorialStepModal({
  isOpen,
  currentStep,
  onNext,
  onPrev,
  onSkip,
  onClose
}: TutorialStepModalProps) {
  const stepContent = TUTORIAL_STEPS[currentStep];
  const defaultSpotlight = useSpotlight({
    selector: stepContent?.highlightElement,
    enabled: isOpen && currentStep !== 'welcome' && currentStep !== 'completed'
  });

  const spotlight =
    currentStep === 'sidebarPanel' && defaultSpotlight
      ? { ...defaultSpotlight, top: 0, height: window.innerHeight }
      : defaultSpotlight;

  if (!isOpen || currentStep === 'welcome' || currentStep === 'completed') return null;
  if (!stepContent) return null;

  const { title, description, stepNumber } = stepContent;
  const isLastStep = stepNumber === TOTAL_STEPS;

  const renderMockComponents = () => (
    <>
      {currentStep === 'progressBoard' && (
        <div className="fixed top-0 left-0 right-0 z-[99] flex justify-center pointer-events-none">
          <TutorialProgressBoard />
        </div>
      )}

      {currentStep === 'vote' && (
        <div data-tutorial="vote" className="absolute right-[9.688rem] top-[12.813rem] z-[99]">
          <TutorialVoteExample />
        </div>
      )}

      {currentStep === 'discussionInput' && (
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-[6] px-4 pb-4">
          <div data-tutorial="discussion-input" className="discussion-input-width">
            <TutorialDiscussionInput />
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="fixed inset-0 z-[100]">
      <SpotlightOverlay spotlight={spotlight} onBackdropClick={onSkip} />

      {renderMockComponents()}

      <div
        className="absolute pointer-events-auto transition-all duration-300"
        style={getModalStyle(currentStep, spotlight)}
      >
        <div className="relative max-w-md rounded-2xl bg-[#1E2432] border-2 border-[#FF6900] shadow-2xl p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#99A1AF] hover:text-white transition-colors"
          >
            ✕
          </button>

          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF6900] to-[#FB2C36] flex items-center justify-center">
              <QuestionIcon className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center mb-2">
            <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
            <span className="text-xs font-medium text-[#FF6900]">
              {stepNumber} / {TOTAL_STEPS}
            </span>
          </div>

          <p className="text-center text-sm text-[#99A1AF] leading-relaxed mb-6 px-2">{description}</p>

          <div className="flex justify-center gap-2 mb-6">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  i < stepNumber - 1
                    ? 'bg-[#00C950]'
                    : i === stepNumber - 1
                      ? 'w-8 bg-gradient-to-r from-[#FF6900] to-[#FB2C36]'
                      : 'bg-[#3A4255]'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onPrev}
              disabled={stepNumber === 1}
              className="px-4 h-11 rounded-lg bg-[#2D3648] hover:bg-[#3A4255] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors flex items-center gap-1"
            >
              <span>←</span>
              <span>이전</span>
            </button>
            <button
              onClick={onSkip}
              className="flex-1 h-11 rounded-lg bg-[#2D3648] hover:bg-[#3A4255] text-white text-sm font-medium transition-colors"
            >
              건너뛰기
            </button>
            <button
              onClick={onNext}
              className="px-6 h-11 rounded-lg bg-gradient-to-r from-[#FF6900] to-[#FB2C36] hover:from-[#FF7A1A] hover:to-[#FC3D47] text-white text-sm font-bold transition-all shadow-lg shadow-orange-500/30 flex items-center gap-1"
            >
              <span>{isLastStep ? '완료' : '다음'}</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
