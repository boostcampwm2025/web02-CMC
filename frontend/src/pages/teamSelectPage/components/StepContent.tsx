import type { BattleInfo, Team } from '@/commons/types/battle';
import type { Step } from '../types/teamSelect';
import Step1BattleInfo from './steps/Step1BattleInfo';
import Step2CodeCompare from './steps/Step2CodeCompare';
import Step3ReferenceData from './steps/Step3ReferenceData';
import Step4Timeline from './steps/Step4Timeline';
import Step5TeamSelect from './steps/Step5TeamSelect';
import StepArrows from './StepArrows';

interface StepContentProps {
  currentStep: Step;
  battleInfo: BattleInfo;
  selectedTeam: Team | null;
  onSelectTeam: (team: Team) => void;
  totalSteps: number;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function StepContent({
  currentStep,
  battleInfo,
  selectedTeam,
  onSelectTeam,
  totalSteps,
  canGoNext,
  onPrev,
  onNext
}: StepContentProps) {
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BattleInfo battleInfo={battleInfo} />;
      case 2:
        return <Step2CodeCompare battleInfo={battleInfo} />;
      case 3:
        if (battleInfo.referenceData) {
          return <Step3ReferenceData referenceData={battleInfo.referenceData} />;
        }
        return <Step4Timeline battleInfo={battleInfo} />;
      case 4:
        if (battleInfo.referenceData) {
          return <Step4Timeline battleInfo={battleInfo} />;
        }
        return <Step5TeamSelect onSelect={onSelectTeam} selectedTeam={selectedTeam ?? undefined} />;
      case 5:
        return <Step5TeamSelect onSelect={onSelectTeam} selectedTeam={selectedTeam ?? undefined} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative mb-8">
      <div className="flex items-center justify-center relative">
        <div className="w-full max-w-6xl relative">
          {renderStep()}
          <StepArrows
            currentStep={currentStep}
            totalSteps={totalSteps}
            canGoNext={canGoNext}
            onPrev={onPrev}
            onNext={onNext}
          />
        </div>
      </div>
    </div>
  );
}
