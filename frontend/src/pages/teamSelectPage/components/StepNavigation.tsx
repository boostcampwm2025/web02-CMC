import type { Step } from '../types/teamSelect';

interface StepNavigationProps {
  currentStep: Step;
  onPrev: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  canGoNext: boolean;
  isSubmitting?: boolean;
  totalSteps?: number;
}

const STEP_LABELS_WITH_REF = ['상황 요약', '쟁점', '참고 자료', '타임라인', '진영 선택'] as const;
const STEP_LABELS_WITHOUT_REF = ['상황 요약', '쟁점', '타임라인', '진영 선택'] as const;

export default function StepNavigation({
  currentStep,
  onSubmit,
  canGoNext,
  isSubmitting = false,
  totalSteps = 4
}: StepNavigationProps) {
  const isLastStep = currentStep === totalSteps;
  const stepLabels = totalSteps === 5 ? STEP_LABELS_WITH_REF : STEP_LABELS_WITHOUT_REF;
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="flex flex-col items-center gap-6 mt-8">
      {/* 하단 단계 표시 */}
      <div className="flex items-center gap-2">
        {steps.map((step) => (
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
        {currentStep}단계: {stepLabels[currentStep - 1]}
      </p>

      {/* 마지막 단계에서만 중앙에 완료 버튼 */}
      {isLastStep && (
        <button
          onClick={onSubmit}
          disabled={!canGoNext || isSubmitting}
          className={`
            px-8 py-3 rounded-lg font-medium transition-colors
            ${
              canGoNext && !isSubmitting
                ? 'bg-[#FF6900] hover:bg-[#FF8533] text-white'
                : 'bg-[#2D2D3F] text-[#99A1AF] cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? '로그인 중...' : '진영 선택 완료'}
        </button>
      )}
    </div>
  );
}
