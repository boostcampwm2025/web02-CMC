import type { Step } from '../types/teamSelect';

interface StepNavigationProps {
  currentStep: Step;
  onPrev: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  canGoNext: boolean;
}

const STEP_LABELS = ['상황 요약', '쟁점', '타임라인', '진영 선택'] as const;

export default function StepNavigation({ currentStep, onSubmit, canGoNext }: StepNavigationProps) {
  const isLastStep = currentStep === 4;

  return (
    <div className="flex flex-col items-center gap-6 mt-8">
      {/* 하단 단계 표시 */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${currentStep === step ? 'bg-[#FF6900] w-8' : 'bg-[#2D2D3F]'}
            `}
          />
        ))}
      </div>

      {/* 현재 단계 텍스트 */}
      <p className="text-sm text-[#99A1AF]">
        {currentStep}단계: {STEP_LABELS[currentStep - 1]}
      </p>

      {/* 마지막 단계에서만 중앙에 완료 버튼 */}
      {isLastStep && (
        <button
          onClick={onSubmit}
          disabled={!canGoNext}
          className={`
            px-8 py-3 rounded-lg font-medium transition-colors
            ${
              canGoNext
                ? 'bg-[#FF6900] hover:bg-[#FF8533] text-white'
                : 'bg-[#2D2D3F] text-[#99A1AF] cursor-not-allowed'
            }
          `}
        >
          진영 선택 완료
        </button>
      )}
    </div>
  );
}
