import { useState } from 'react';
import { selectIsLogginIn, useAuthStore } from '../battlePage/stores/authStore';
import { useNavigate, useLoaderData, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { BattleJoinInfoResponse } from '@cmc/types';
import { useStepFlow } from './hooks/useStepFlow';
import StepIndicator from './components/StepIndicator';
import StepNavigation from './components/StepNavigation';
import Step1BattleInfo from './components/steps/Step1BattleInfo';
import Step2CodeCompare from './components/steps/Step2CodeCompare';
import Step3Timeline from './components/steps/Step3Timeline';
import Step4TeamSelect from './components/steps/Step4TeamSelect';
import type { BattleTeam } from '@cmc/types';
import { useBattleStore } from '@/pages/battlePage/stores/battleStore';
import GuestLoginModal from './components/GuestLoginModal';

export default function TeamSelectPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const battleInfo = useLoaderData<BattleJoinInfoResponse>();
  const { currentStep, goToNext, goToPrev, canGoNext } = useStepFlow();
  const [selectedTeam, setSelectedTeam] = useState<BattleTeam | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const loginGuest = useAuthStore((s) => s.loginGuest);
  const isLoggingIn = useAuthStore(selectIsLogginIn);

  const attacks = battleInfo.timelines.attacks.map((attack) => ({ ...attack, type: 'ATTACK' as const }));
  const defenses = battleInfo.timelines.defenses.map((defense) => ({ ...defense, type: 'DEFENSE' as const }));

  const handleSubmit = () => {
    if (selectedTeam && id) {
      // TODO 로그인 여부확인

      // 게스트 로그인 진입점
      setShowLoginModal(true);
    }
  };

  const handleLogin = async (nickname: string) => {
    if (!id || !selectedTeam) return;

    setShowLoginModal(false);

    try {
      const user = await loginGuest(id, nickname);

      useBattleStore.getState().initializeBattle({
        userId: user.id,
        battleId: id
      });

      useBattleStore.getState().setSelectedTeam(selectedTeam);
      navigate(`/battle/${id}`, { state: { selectedTeam } });
    } catch (e) {
      alert(e);
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
        return (
          <Step3Timeline
            timelines={[...attacks, ...defenses]}
            topics={battleInfo.topics}
            currentRound={battleInfo.currentRound}
            totalRounds={battleInfo.totalRounds}
          />
        );
      case 4:
        return <Step4TeamSelect onSelect={setSelectedTeam} selectedTeam={selectedTeam ?? undefined} />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a1a] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-lg bg-[#2D2D3F] hover:bg-[#3D3D4F] text-white transition-colors"
          >
            ← 돌아가기
          </button>
          <h1 className="text-3xl font-bold text-white">배틀 참가하기</h1>
          <div className="w-24" />
        </div>

        <p className="text-center text-[#99A1AF] mb-8">배틀 정보를 확인하고 진영을 선택하세요</p>

        <StepIndicator currentStep={currentStep} />

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
              {currentStep < 4 && (
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
          canGoNext={currentStep === 4 ? selectedTeam !== null : canGoNext}
        />
      </div>

      {showLoginModal && (
        <GuestLoginModal disabled={isLoggingIn} onClose={() => setShowLoginModal(false)} onLogin={handleLogin} />
      )}
    </main>
  );
}
