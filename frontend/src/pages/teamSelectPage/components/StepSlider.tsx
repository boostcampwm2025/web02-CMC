import type { StepConfig } from '../types/step';
import StepArrows from './StepArrows';

interface StepSliderProps {
  steps: StepConfig[];
  currentStep: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function StepSlider({ steps, currentStep, onPrev, onNext }: StepSliderProps) {
  return (
    <div className="relative mb-8">
      <div className="flex items-center justify-center relative">
        <div className="w-full max-w-6xl relative">
          {steps[currentStep - 1].content}
          <StepArrows
            currentStep={currentStep}
            totalSteps={steps.length}
            canGoNext={currentStep < steps.length}
            onPrev={onPrev}
            onNext={onNext}
          />
        </div>
      </div>
    </div>
  );
}
