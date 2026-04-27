import type { StepConfig } from '../types/step';
import Button from '@/commons/components/Button';

interface StepNavigationProps {
  steps: StepConfig[];
  currentStep: number;
  onSubmit?: () => void;
  canGoNext: boolean;
  isSubmitting?: boolean;
}

export default function StepNavigation({
  steps,
  currentStep,
  onSubmit,
  canGoNext,
  isSubmitting = false
}: StepNavigationProps) {
  const isLastStep = currentStep === steps.length;

  return (
    <div className="flex flex-col items-center gap-6 mt-8">
      <div className="flex items-center gap-2">
        {steps.map((_, i) => {
          const step = i + 1;
          return (
            <div
              key={step}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${currentStep === step ? 'bg-[#FF6900] w-8' : 'bg-[#2D2D3F]'}
              `}
            />
          );
        })}
      </div>

      <p className="text-sm text-[#99A1AF]">
        {currentStep}단계: {steps[currentStep - 1].label}
      </p>

      {isLastStep && (
        <Button
          onClick={onSubmit}
          disabled={!canGoNext || isSubmitting}
          variant={canGoNext && !isSubmitting ? 'primary' : 'secondary'}
          size="lg"
        >
          {isSubmitting ? '로그인 중...' : '진영 선택 완료'}
        </Button>
      )}
    </div>
  );
}
