import type { StepConfig } from './StepSlider';

interface StepIndicatorProps {
  steps: StepConfig[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      {steps.map((step, i) => {
        const stepNumber = i + 1;
        return (
          <div key={stepNumber} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold
                  ${currentStep === stepNumber ? 'bg-[#FF6900] text-white' : 'bg-[#2D2D3F] text-[#99A1AF]'}
                  ${currentStep > stepNumber ? 'bg-[#4CAF50] text-white' : ''}
                `}
              >
                {currentStep > stepNumber ? '✓' : stepNumber}
              </div>
              <span
                className={`text-xs font-medium ${currentStep === stepNumber ? 'text-[#FF6900]' : 'text-[#99A1AF]'}`}
              >
                {step.label}
              </span>
            </div>
            {stepNumber < steps.length && <div className="w-12 h-px bg-[#2D2D3F] mt-[-20px]" />}
          </div>
        );
      })}
    </div>
  );
}
