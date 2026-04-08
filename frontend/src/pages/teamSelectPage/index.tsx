import { useState } from 'react';
import { selectIsLoggingIn, useAuthStore } from '@/commons/stores/authStore';
import { useParams } from 'react-router-dom';
import { useStepFlow } from './hooks/useStepFlow';
import { useTeamSelectSubmit } from './hooks/useTeamSelectSubmit';
import { useGetBattleInfo } from '@/commons/hooks/useGetBattleInfo';
import StepIndicator from './components/StepIndicator';
import StepNavigation from './components/StepNavigation';
import TeamSelectHeader from './components/TeamSelectHeader';
import StepContent from './components/StepContent';
import type { Team } from '@/commons/types/battle';

export default function TeamSelectPage() {
  const { id } = useParams<{ id: string }>();
  const { battleInfo } = useGetBattleInfo(id!);
  const hasReferenceData = !!battleInfo?.referenceData;
  const totalSteps = hasReferenceData ? 5 : 4;
  const { currentStep, goToNext, goToPrev, canGoNext } = useStepFlow({ totalSteps });
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const isLoggingIn = useAuthStore(selectIsLoggingIn);
  const { handleSubmit } = useTeamSelectSubmit({ battleId: id!, selectedTeam });

  if (!battleInfo) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#0a0a1a] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <TeamSelectHeader inviteCode={battleInfo.inviteCode} />

        <p className="text-center text-[#99A1AF] mb-8">배틀 정보를 확인하고 진영을 선택하세요</p>

        <StepIndicator currentStep={currentStep} hasReferenceData={hasReferenceData} />

        <StepContent
          currentStep={currentStep}
          battleInfo={battleInfo}
          hasReferenceData={hasReferenceData}
          selectedTeam={selectedTeam}
          onSelectTeam={setSelectedTeam}
          totalSteps={totalSteps}
          canGoNext={canGoNext}
          onPrev={goToPrev}
          onNext={goToNext}
        />

        <StepNavigation
          currentStep={currentStep}
          onPrev={goToPrev}
          onNext={goToNext}
          onSubmit={handleSubmit}
          canGoNext={currentStep === totalSteps ? selectedTeam !== null : canGoNext}
          isSubmitting={isLoggingIn}
          totalSteps={totalSteps}
        />
      </div>
    </main>
  );
}
