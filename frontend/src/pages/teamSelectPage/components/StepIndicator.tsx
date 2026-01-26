import type { Step } from '../types/teamSelect';

interface StepIndicatorProps {
  currentStep: Step;
  hasReferenceData: boolean;
}

const STEP_LABELS_WITH_REF = ['상황 요약', '쟁점', '참고 자료', '타임라인', '진영 선택'] as const;
const STEP_LABELS_WITHOUT_REF = ['상황 요약', '쟁점', '타임라인', '진영 선택'] as const;

export default function StepIndicator({ currentStep, hasReferenceData }: StepIndicatorProps) {
  const stepLabels = hasReferenceData ? STEP_LABELS_WITH_REF : STEP_LABELS_WITHOUT_REF;
  const totalSteps = hasReferenceData ? 5 : 4;
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1) as Step[];

  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      {steps.map((step) => (
        <div key={step} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold
                ${currentStep === step ? 'bg-[#FF6900] text-white' : 'bg-[#2D2D3F] text-[#99A1AF]'}
                ${currentStep > step ? 'bg-[#4CAF50] text-white' : ''}
              `}
            >
              {currentStep > step ? '✓' : step}
            </div>
            <span className={`text-xs font-medium ${currentStep === step ? 'text-[#FF6900]' : 'text-[#99A1AF]'}`}>
              {stepLabels[step - 1]}
            </span>
          </div>
          {step < totalSteps && <div className="w-12 h-px bg-[#2D2D3F] mt-[-20px]" />}
        </div>
      ))}
    </div>
  );
}
