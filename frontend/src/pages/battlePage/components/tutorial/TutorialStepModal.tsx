import type { TutorialStep } from '../../hooks/useTutorial';
import QuestionIcon from '@/assets/icon/question.svg?react';

interface TutorialStepModalProps {
  isOpen: boolean;
  currentStep: TutorialStep;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
}

interface StepContent {
  title: string;
  description: string;
  stepNumber: number;
  totalSteps: number;
  highlightElement?: string;
}

const TUTORIAL_STEPS: Record<TutorialStep, StepContent | null> = {
  welcome: null,
  timer: {
    title: '타이머 & 진행 상황',
    description:
      '각 페이즈의 남은 시간을 확인하세요. 시간이 5초 이하가 되면 경고음이 울립니다! 상단의 프로그레스 바로 전체 배틀 진행률을 확인할 수 있어요.',
    stepNumber: 1,
    totalSteps: 7
  },
  phaseGuide: {
    title: '현재 페이즈 안내',
    description:
      '지금 무엇을 해야 하는지 알려드립니다. 페이즈마다 할 수 있는 행동이 달라요! 이의제기 → 반론 → 진영 변경 순서로 진행됩니다.',
    stepNumber: 2,
    totalSteps: 7
  },
  teamStatus: {
    title: '팀 현황',
    description:
      'A팀, B팀, 중립의 실시간 인원수를 확인하세요. 인원이 변하면 애니메이션이 재생됩니다! 하단의 막대 그래프로 비율을 한눈에 파악할 수 있어요.',
    stepNumber: 3,
    totalSteps: 7
  },
  codeCompare: {
    title: '코드 비교',
    description:
      '두 팀의 코드를 비교하고 분석하세요. 상단 버튼으로 탭 보기와 분할 보기를 전환할 수 있어요. 코드에 마우스를 올리면 라인 번호가 표시됩니다.',
    stepNumber: 4,
    totalSteps: 7
  },
  vote: {
    title: '투표',
    description: '더 나은 코드를 선택하세요! 투표는 각 라운드마다 진행되며, 실시간으로 결과가 반영됩니다.',
    stepNumber: 5,
    totalSteps: 7
  },
  chat: {
    title: '채팅',
    description:
      '팀 채팅으로 전략을 논의하거나, 전체 채팅으로 모두와 소통하세요! 채팅창 상단의 탭을 클릭하여 전환할 수 있습니다.',
    stepNumber: 6,
    totalSteps: 7
  },
  discussionInput: {
    title: '의견 입력',
    description:
      '이의제기 페이즈에는 이의제기를, 반론 페이즈에는 반박을 작성할 수 있어요. 엔터키로 빠르게 제출할 수 있습니다!',
    stepNumber: 7,
    totalSteps: 7
  },
  completed: null
};

export default function TutorialStepModal({
  isOpen,
  currentStep,
  onNext,
  onPrev,
  onSkip,
  onClose
}: TutorialStepModalProps) {
  if (!isOpen || currentStep === 'welcome' || currentStep === 'completed') return null;

  const stepContent = TUTORIAL_STEPS[currentStep];
  if (!stepContent) return null;

  const { title, description, stepNumber, totalSteps } = stepContent;
  const isLastStep = stepNumber === totalSteps;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <div className="absolute inset-0 bg-black/70 pointer-events-auto" onClick={onSkip} />

      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="relative w-[420px] rounded-2xl bg-[#1E2432] border-2 border-[#FF6900] shadow-2xl p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#99A1AF] hover:text-white transition-colors"
          >
            ✕
          </button>

          <div className="flex justify-center mb-4">
            <div className="w-[56px] h-[56px] rounded-full bg-gradient-to-br from-[#FF6900] to-[#FB2C36] flex items-center justify-center">
              <QuestionIcon className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center mb-2">
            <h3 className="text-[22px] font-bold text-white mb-1">{title}</h3>
            <span className="text-[13px] font-medium text-[#FF6900]">
              {stepNumber} / {totalSteps}
            </span>
          </div>

          <p className="text-center text-[14px] text-[#99A1AF] leading-relaxed mb-6 px-2">{description}</p>

          <div className="flex justify-center gap-2 mb-6">
            {Array.from({ length: totalSteps }, (_, i) => (
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
              className="px-4 h-[44px] rounded-lg bg-[#2D3648] hover:bg-[#3A4255] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-medium transition-colors flex items-center gap-1"
            >
              <span>←</span>
              <span>이전</span>
            </button>

            <button
              onClick={onSkip}
              className="flex-1 h-[44px] rounded-lg bg-[#2D3648] hover:bg-[#3A4255] text-white text-[14px] font-medium transition-colors"
            >
              건너뛰기
            </button>

            <button
              onClick={onNext}
              className="px-6 h-[44px] rounded-lg bg-gradient-to-r from-[#FF6900] to-[#FB2C36] hover:from-[#FF7A1A] hover:to-[#FC3D47] text-white text-[14px] font-bold transition-all shadow-lg shadow-orange-500/30 flex items-center gap-1"
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
