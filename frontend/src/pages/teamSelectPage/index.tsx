import { useState } from 'react';
import { selectIsLoggingIn, selectIsOAuth, selectUser, useAuthStore } from '@/commons/stores/authStore';
import { useNavigate, useParams } from 'react-router-dom';
import { useStepFlow } from './hooks/useStepFlow';
import { useGetBattleInfo } from '@/commons/hooks/useGetBattleInfo';
import { useBattleStore } from '@/pages/battlePage/stores/battleStore';
import StepIndicator from './components/StepIndicator';
import StepNavigation from './components/StepNavigation';
import TeamSelectHeader from './components/TeamSelectHeader';
import StepContent from './components/StepContent';
import type { Team } from '@/commons/types/battle';

export default function TeamSelectPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { battleInfo } = useGetBattleInfo(id!);
  const hasReferenceData = !!battleInfo?.referenceData;
  const totalSteps = hasReferenceData ? 5 : 4;
  const { currentStep, goToNext, goToPrev, canGoNext } = useStepFlow({ totalSteps });
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const loginGuest = useAuthStore((s) => s.loginGuest);
  const isLoggingIn = useAuthStore(selectIsLoggingIn);
  const user = useAuthStore(selectUser);
  const isOAuth = useAuthStore(selectIsOAuth);

  if (!battleInfo) {
    return null;
  }

  const handleSubmit = async () => {
    if (selectedTeam && id) {
      // OAuth 사용자는 바로 배틀 페이지로 이동
      if (user && isOAuth) {
        useBattleStore.getState().initializeBattle({
          userId: user.id,
          battleId: id
        });
        useBattleStore.getState().setSelectedTeam(selectedTeam);
        navigate(`/battle/${id}`, { state: { selectedTeam } });
        return;
      }

      // 비회원이거나 로그인 안 된 경우 서버에서 랜덤 닉네임 생성 후 로그인
      try {
        const guestUser = await loginGuest(id, selectedTeam !== 'NONE' ? selectedTeam : undefined);

        useBattleStore.getState().initializeBattle({
          userId: guestUser.id,
          battleId: id
        });

        useBattleStore.getState().setSelectedTeam(selectedTeam);
        navigate(`/battle/${id}`, { state: { selectedTeam } });
      } catch (e) {
        alert(e instanceof Error ? e.message : '로그인에 실패했습니다.');
      }
    }
  };

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
