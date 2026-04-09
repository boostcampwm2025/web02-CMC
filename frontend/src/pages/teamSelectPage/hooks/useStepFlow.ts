import { useState } from 'react';

interface UseStepFlowReturn {
  currentStep: number;
  goToNext: () => void;
  goToPrev: () => void;
  canGoNext: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

interface UseStepFlowOptions {
  totalSteps?: number;
}

export function useStepFlow({ totalSteps = 4 }: UseStepFlowOptions = {}): UseStepFlowReturn {
  const [currentStep, setCurrentStep] = useState(1);

  const goToNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return {
    currentStep,
    goToNext,
    goToPrev,
    canGoNext: currentStep < totalSteps,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps
  };
}
