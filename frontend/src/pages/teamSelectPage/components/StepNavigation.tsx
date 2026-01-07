import type { Step } from '../types/teamSelect';

interface StepNavigationProps {
  currentStep: Step;
  onPrev: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  canGoNext: boolean;
}

export default function StepNavigation({ currentStep, onPrev, onNext, onSubmit, canGoNext }: StepNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === 4;

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      {!isFirstStep && (
        <button
          onClick={onPrev}
          className="px-6 py-3 rounded-lg bg-[#2D2D3F] hover:bg-[#3D3D4F] text-white font-medium transition-colors"
        >
          이전
        </button>
      )}

      {isLastStep ? (
        <button
          onClick={onSubmit}
          disabled={!canGoNext}
          className={`
            px-6 py-3 rounded-lg font-medium transition-colors
            ${
              canGoNext
                ? 'bg-[#FF6900] hover:bg-[#FF8533] text-white'
                : 'bg-[#2D2D3F] text-[#99A1AF] cursor-not-allowed'
            }
          `}
        >
          진영 선택 완료
        </button>
      ) : (
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`
            px-6 py-3 rounded-lg font-medium transition-colors
            ${
              canGoNext
                ? 'bg-[#FF6900] hover:bg-[#FF8533] text-white'
                : 'bg-[#2D2D3F] text-[#99A1AF] cursor-not-allowed'
            }
          `}
        >
          다음
        </button>
      )}
    </div>
  );
}
