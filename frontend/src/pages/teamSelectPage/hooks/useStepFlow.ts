import { useState } from 'react';
import type { Step } from '../types/teamSelect';

interface UseStepFlowReturn {
  currentStep: Step;
  goToNext: () => void;
  goToPrev: () => void;
  canGoNext: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function useStepFlow(): UseStepFlowReturn {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const goToNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const goToPrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  return {
    currentStep,
    goToNext,
    goToPrev,
    canGoNext: currentStep < 4,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === 4
  };
}
