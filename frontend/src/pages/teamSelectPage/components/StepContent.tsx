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
  hasReferenceData: boolean;
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
  hasReferenceData,
  selectedTeam,
  onSelectTeam,
  totalSteps,
  canGoNext,
  onPrev,
  onNext
}: StepContentProps) {
  const attacks = battleInfo.timelines.attacks.map((attack) => ({ ...attack, type: 'ATTACK' as const }));
  const defenses = battleInfo.timelines.defenses.map((defense) => ({ ...defense, type: 'DEFENSE' as const }));
  const timelines = [...attacks, ...defenses];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BattleInfo
            title={battleInfo.title}
            description={battleInfo.description}
            category={battleInfo.category}
            language={battleInfo.language}
            currentRound={battleInfo.currentRound}
            totalRounds={battleInfo.totalRounds}
            topics={battleInfo.topics}
            totalParticipants={battleInfo.participantCount}
            currentPhase={battleInfo.currentPhase}
            phaseCount={battleInfo.phaseCount}
          />
        );
      case 2:
        return <Step2CodeCompare aCode={battleInfo.aCode} bCode={battleInfo.bCode} language={battleInfo.language} />;
      case 3:
        if (hasReferenceData && battleInfo.referenceData) {
          return <Step3ReferenceData referenceData={battleInfo.referenceData} />;
        }
        return (
          <Step4Timeline
            timelines={timelines}
            topics={battleInfo.topics}
            currentRound={battleInfo.currentRound}
            totalRounds={battleInfo.totalRounds}
          />
        );
      case 4:
        if (hasReferenceData) {
          return (
            <Step4Timeline
              timelines={timelines}
              topics={battleInfo.topics}
              currentRound={battleInfo.currentRound}
              totalRounds={battleInfo.totalRounds}
            />
          );
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
