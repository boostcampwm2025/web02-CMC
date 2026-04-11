import Button from '@/commons/components/Button';
import Icon from '@/commons/components/Icon';

interface StepArrowsProps {
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function StepArrows({ currentStep, totalSteps, canGoNext, onPrev, onNext }: StepArrowsProps) {
  return (
    <>
      {currentStep > 1 && (
        <Button
          onClick={onPrev}
          variant="secondary"
          aria-label="이전 단계"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 w-12 h-12 p-0 rounded-full z-10"
        >
          <Icon name="chevronLeft" className="w-6 h-6" />
        </Button>
      )}
      {currentStep < totalSteps && (
        <Button
          onClick={onNext}
          disabled={!canGoNext}
          variant={canGoNext ? 'primary' : 'secondary'}
          aria-label="다음 단계"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 w-12 h-12 p-0 rounded-full z-10"
        >
          <Icon name="chevronRight" className="w-6 h-6" />
        </Button>
      )}
    </>
  );
}
