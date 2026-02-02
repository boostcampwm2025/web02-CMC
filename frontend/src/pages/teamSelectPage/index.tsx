import { useState } from 'react';
import { selectIsLoggingIn, selectIsOAuth, selectUser, useAuthStore } from '@/commons/stores/authStore';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStepFlow } from './hooks/useStepFlow';
import StepIndicator from './components/StepIndicator';
import StepNavigation from './components/StepNavigation';
import Step1BattleInfo from './components/steps/Step1BattleInfo';
import Step2CodeCompare from './components/steps/Step2CodeCompare';
import Step3ReferenceData from './components/steps/Step3ReferenceData';
import Step4Timeline from './components/steps/Step4Timeline';
import Step5TeamSelect from './components/steps/Step5TeamSelect';
import type { Team } from '@/commons/types/battle';
import { useBattleStore } from '@/pages/battlePage/stores/battleStore';
import InviteLinkButton from '@/pages/battleCreatePage/components/InviteLinkButton';
import { useGetBattleInfo } from '@/commons/hooks/useGetBattleInfo';

export default function TeamSelectPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { battleInfo: battleInfoData, isLoading } = useGetBattleInfo(id!);
  const hasReferenceData = !!battleInfoData?.referenceData;
  const totalSteps = hasReferenceData ? 5 : 4;
  const { currentStep, goToNext, goToPrev, canGoNext } = useStepFlow({ totalSteps });
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const loginGuest = useAuthStore((s) => s.loginGuest);
  const isLoggingIn = useAuthStore(selectIsLoggingIn);
  const user = useAuthStore(selectUser);
  const isOAuth = useAuthStore(selectIsOAuth);

  // Early return after all hooks
  if (isLoading || !battleInfoData) {
    return (
      <main className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-white">로딩 중...</div>
      </main>
    );
  }

  const battleInfo = battleInfoData;

  const attacks = battleInfo.timelines.attacks.map((attack) => ({ ...attack, type: 'ATTACK' as const }));
  const defenses = battleInfo.timelines.defenses.map((defense) => ({ ...defense, type: 'DEFENSE' as const }));

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
        const guestUser = await loginGuest(id);

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
            timelines={[...attacks, ...defenses]}
            topics={battleInfo.topics}
            currentRound={battleInfo.currentRound}
            totalRounds={battleInfo.totalRounds}
          />
        );
      case 4:
        if (hasReferenceData) {
          return (
            <Step4Timeline
              timelines={[...attacks, ...defenses]}
              topics={battleInfo.topics}
              currentRound={battleInfo.currentRound}
              totalRounds={battleInfo.totalRounds}
            />
          );
        }
        return <Step5TeamSelect onSelect={setSelectedTeam} selectedTeam={selectedTeam ?? undefined} />;
      case 5:
        return <Step5TeamSelect onSelect={setSelectedTeam} selectedTeam={selectedTeam ?? undefined} />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a1a] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative mb-8">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => navigate('/main')}
              className="px-4 py-2 rounded-lg bg-[#2D2D3F] hover:bg-[#3D3D4F] text-white transition-colors shrink-0 text-sm w-[100px] sm:w-auto sm:min-w-[100px]"
            >
              ← 돌아가기
            </button>
            <h1 className="text-3xl font-bold text-white absolute left-1/2 -translate-x-1/2 pointer-events-none">
              배틀 참가하기
            </h1>
            <div className="shrink-0">
              {battleInfo.inviteCode && <InviteLinkButton inviteCode={battleInfo.inviteCode} />}
            </div>
          </div>
        </div>

        <p className="text-center text-[#99A1AF] mb-8">배틀 정보를 확인하고 진영을 선택하세요</p>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} hasReferenceData={hasReferenceData} />

        {/* Step Content with Side Navigation */}
        <div className="relative mb-8">
          {/* 이전 버튼 - 화면 왼쪽 중앙 고정 */}

          {/* Step Content */}
          <div className="flex items-center justify-center relative">
            <div className="w-full max-w-6xl relative">
              {renderStep()}

              {/* 이전 버튼 - 콘텐츠 왼쪽 */}
              {currentStep > 1 && (
                <button
                  onClick={goToPrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 w-12 h-12 rounded-full bg-[#2D2D3F] hover:bg-[#3D3D4F] text-white flex items-center justify-center transition-colors z-10"
                  aria-label="이전 단계"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* 다음 버튼 - 콘텐츠 오른쪽 */}
              {currentStep < totalSteps && (
                <button
                  onClick={goToNext}
                  disabled={!canGoNext}
                  className={`
                    absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 w-12 h-12 rounded-full flex items-center justify-center transition-colors z-10
                    ${
                      canGoNext
                        ? 'bg-[#FF6900] hover:bg-[#FF8533] text-white'
                        : 'bg-[#2D2D3F] text-[#99A1AF] cursor-not-allowed'
                    }
                  `}
                  aria-label="다음 단계"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Step Navigation (하단 인디케이터) */}
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
