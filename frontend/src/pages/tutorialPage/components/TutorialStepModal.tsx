import type { TutorialStep } from '@/features/battle/hooks/useTutorial';
import { useSpotlight } from '@/features/battle/hooks/useSpotlight';
import type { SpotlightPosition } from '@/features/battle/hooks/useSpotlight';
import SpotlightOverlay from './SpotlightOverlay';
import DiscussionInput from '@/pages/battlePage/components/discussion/DiscussionInput';
import BattleProgressBoard from '@/pages/battlePage/components/progressBoard/ProgressBoard';
import { TUTORIAL_STEPS, TOTAL_STEPS } from './const/tutorialSteps';
import Icon from '@/commons/components/Icon';
import Button from '@/commons/components/Button';

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
  if (currentStep === 'sidebarPanel') {
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  }
  return getModalPosition(spotlight);
};

export default function TutorialStepModal({ isOpen, currentStep, onNext, onPrev }: TutorialStepModalProps) {
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

  const { title, description, stepNumber, tasks, tip } = stepContent;
  const isLastStep = stepNumber === TOTAL_STEPS;

  const renderMockComponents = () => (
    <>
      {currentStep === 'progressBoard' && (
        <div className="fixed top-0 left-0 right-0 z-[99] flex justify-center pointer-events-none">
          <BattleProgressBoard />
        </div>
      )}

      {currentStep === 'discussionInput' && (
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-[6] px-4 pb-4">
          <div data-tutorial="discussion-input" className="discussion-input-width">
            <DiscussionInput />
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="fixed inset-0 z-[100]">
      <SpotlightOverlay spotlight={spotlight} onBackdropClick={() => {}} />

      {renderMockComponents()}

      <div
        className="absolute pointer-events-auto transition-all duration-300"
        style={getModalStyle(currentStep, spotlight)}
      >
        <div className="relative max-w-md rounded-2xl bg-[#1E2432] border-2 border-[#FF6900] shadow-2xl p-6">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF6900] to-[#FB2C36] flex items-center justify-center">
              <Icon name="question" className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center mb-2">
            <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
            <span className="text-xs font-medium text-[#FF6900]">
              {stepNumber} / {TOTAL_STEPS}
            </span>
          </div>

          <p className="text-center text-sm text-[#99A1AF] leading-relaxed mb-5 px-2">{description}</p>

          {tasks && tasks.length > 0 && (
            <div className="mb-5 rounded-xl bg-[#131826] border border-[#2D3648] px-4 py-3 text-left">
              <p className="text-xs font-semibold text-[#FF6900] mb-2">지금 해볼 것</p>
              <ul className="space-y-1 text-xs text-[#C5CBD6]">
                {tasks.map((task) => (
                  <li key={task} className="flex gap-2">
                    <span className="text-[#00C950]">•</span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tip && (
            <div className="mb-5 rounded-xl bg-[#1A2233] border border-[#2D3648] px-4 py-3 text-left text-xs text-[#B6BDC9]">
              <span className="text-[#8B5CF6] font-semibold mr-2">TIP</span>
              {tip}
            </div>
          )}

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
            <Button
              onClick={onPrev}
              disabled={stepNumber === 1}
              variant="secondary"
              className="flex-1 h-11 rounded-lg bg-[#2D3648] hover:bg-[#3A4255] text-sm font-medium"
            >
              <span>←</span>
              <span>이전</span>
            </Button>
            <Button
              onClick={onNext}
              className="flex-1 h-11 rounded-lg bg-gradient-to-r from-[#FF6900] to-[#FB2C36] hover:from-[#FF7A1A] hover:to-[#FC3D47] text-sm font-bold shadow-lg shadow-orange-500/30"
            >
              <span>{isLastStep ? '완료' : '다음'}</span>
              <span>→</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
