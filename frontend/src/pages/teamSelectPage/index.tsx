import { useState } from 'react';
import { selectIsLoggingIn, useAuthStore } from '@/commons/stores/authStore';
import { useParams } from 'react-router-dom';
import { useStepFlow } from './hooks/useStepFlow';
import { useTeamSelectSubmit } from './hooks/useTeamSelectSubmit';
import { useGetBattleInfo } from '@/commons/hooks/useGetBattleInfo';
import StepIndicator from './components/StepIndicator';
import StepNavigation from './components/StepNavigation';
import TeamSelectHeader from './components/TeamSelectHeader';
import StepSlider from './components/StepSlider';
import BattleInfo from './components/steps/BattleInfo';
import CodeCompare from './components/steps/CodeCompare';
import ReferenceData from './components/steps/ReferenceData';
import Timeline from './components/steps/Timeline';
import TeamSelect from './components/steps/TeamSelect';
import type { Team } from '@/commons/types/battle';

export default function TeamSelectPage() {
  const { id } = useParams<{ id: string }>();
  const { battleInfo } = useGetBattleInfo(id!);
  const hasReferenceData = !!battleInfo?.referenceData;
  const totalSteps = hasReferenceData ? 5 : 4;
  const { currentStep, goToNext, goToPrev, isLastStep } = useStepFlow({ totalSteps });
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const isLoggingIn = useAuthStore(selectIsLoggingIn);
  const { handleSubmit } = useTeamSelectSubmit({ battleId: id!, selectedTeam });

  if (!battleInfo) return null;

  const steps = [
    { label: '상황 요약', content: <BattleInfo battleInfo={battleInfo} /> },
    { label: '쟁점', content: <CodeCompare battleInfo={battleInfo} /> },
    ...(battleInfo.referenceData
      ? [{ label: '참고 자료', content: <ReferenceData referenceData={battleInfo.referenceData} /> }]
      : []),
    { label: '타임라인', content: <Timeline battleInfo={battleInfo} /> },
    { label: '진영 선택', content: <TeamSelect onSelect={setSelectedTeam} selectedTeam={selectedTeam ?? undefined} /> }
  ];

  const canGoNext = isLastStep ? selectedTeam !== null : currentStep < steps.length;

  return (
    <main className="min-h-screen bg-[#0a0a1a] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <TeamSelectHeader inviteCode={battleInfo.inviteCode} />

        <p className="text-center text-[#99A1AF] mb-8">배틀 정보를 확인하고 진영을 선택하세요</p>

        <StepIndicator steps={steps} currentStep={currentStep} />

        <StepSlider steps={steps} currentStep={currentStep} onPrev={goToPrev} onNext={goToNext} />

        <StepNavigation
          steps={steps}
          currentStep={currentStep}
          onSubmit={handleSubmit}
          canGoNext={canGoNext}
          isSubmitting={isLoggingIn}
        />
      </div>
    </main>
  );
}
