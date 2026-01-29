import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Team } from '@/commons/types/battle';
import { useStepFlow } from '@/pages/teamSelectPage/hooks/useStepFlow';
import StepIndicator from '@/pages/teamSelectPage/components/StepIndicator';
import StepNavigation from '@/pages/teamSelectPage/components/StepNavigation';
import Step1BattleInfo from '@/pages/teamSelectPage/components/steps/Step1BattleInfo';
import Step2CodeCompare from '@/pages/teamSelectPage/components/steps/Step2CodeCompare';
import Step3ReferenceData from '@/pages/teamSelectPage/components/steps/Step3ReferenceData';
import Step4Timeline from '@/pages/teamSelectPage/components/steps/Step4Timeline';
import Step5TeamSelect from '@/pages/teamSelectPage/components/steps/Step5TeamSelect';
import { useBattleStore } from '@/pages/battlePage/stores/battleStore';
import { TUTORIAL_BATTLE_ID, TUTORIAL_BATTLE_INFO } from '@/pages/tutorial/data/tutorialBattle';

export default function TutorialTeamSelectPage() {
  const navigate = useNavigate();
  const battleInfo = TUTORIAL_BATTLE_INFO;
  const hasReferenceData = !!battleInfo.referenceData;
  const totalSteps = hasReferenceData ? 5 : 4;
  const { currentStep, goToNext, goToPrev, canGoNext } = useStepFlow({ totalSteps });
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [introStep, setIntroStep] = useState<0 | 1>(0);
  const [showIntro, setShowIntro] = useState(true);

  const attacks = battleInfo.timelines.attacks.map((attack) => ({ ...attack, type: 'ATTACK' as const }));
  const defenses = battleInfo.timelines.defenses.map((defense) => ({ ...defense, type: 'DEFENSE' as const }));

  const handleSubmit = () => {
    if (!selectedTeam) return;
    useBattleStore.getState().initializeBattle({
      userId: 'tutorial-user',
      battleId: TUTORIAL_BATTLE_ID
    });
    useBattleStore.getState().setSelectedTeam(selectedTeam);
    navigate('/tutorial/battle', { state: { selectedTeam } });
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
      {showIntro && (
        <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-orange-500/40 bg-[#121726] shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-300">튜토리얼</span>
              <span className="text-[0.625rem] text-gray-400">{introStep + 1} / 2</span>
            </div>
            {introStep === 0 && (
              <>
                <h2 className="text-xl font-bold mb-3">튜토리얼에 오신 것을 환영합니다!</h2>
                <p className="text-sm text-[#C5CBD6] leading-relaxed">
                  실제 배틀에 들어가기 전에, 진영 선택 흐름을 차근차근 체험해볼게요.
                </p>
              </>
            )}
            {introStep === 1 && (
              <>
                <h2 className="text-xl font-bold mb-3">진영 선택 튜토리얼</h2>
                <ul className="text-sm text-[#C5CBD6] space-y-2">
                  <li>1) 상황 요약에서 ‘if 한 줄 vs 블록’ 주제를 확인합니다.</li>
                  <li>2) 참고 자료에서 핵심 개념과 팀별 관점을 확인합니다.</li>
                  <li>3) 쟁점과 타임라인으로 핵심 주장들을 살펴봅니다.</li>
                  <li>4) 마지막 단계에서 A/B/중립을 선택하고 배틀로 이동합니다.</li>
                </ul>
              </>
            )}
            <div className="mt-6">
              {introStep === 0 && (
                <button
                  type="button"
                  onClick={() => setIntroStep(1)}
                  className="w-full h-11 rounded-lg text-sm font-semibold transition-colors bg-gradient-to-r from-[#FF6900] to-[#FB2C36] text-white"
                >
                  다음
                </button>
              )}
              {introStep === 1 && (
                <button
                  type="button"
                  onClick={() => setShowIntro(false)}
                  className="w-full h-11 rounded-lg text-sm font-semibold transition-colors bg-gradient-to-r from-[#FF6900] to-[#FB2C36] text-white"
                >
                  시작하기
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-lg bg-[#2D2D3F] hover:bg-[#3D3D4F] text-white transition-colors"
          >
            ← 돌아가기
          </button>
          <h1 className="text-3xl font-bold text-white">튜토리얼 참가하기</h1>
          <div className="w-24" />
        </div>

        <p className="text-center text-[#99A1AF] mb-8">튜토리얼 배틀 정보를 확인하고 진영을 선택하세요</p>

        <StepIndicator currentStep={currentStep} hasReferenceData={hasReferenceData} />

        <div className="relative mb-8">
          <div className="flex items-center justify-center relative">
            <div className="w-full max-w-6xl relative">
              {renderStep()}

              {currentStep > 1 && (
                <button
                  onClick={goToPrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 w-12 h-12 rounded-full bg-[#2D2D3F] hover:bg-[#3D3D4F] text-white flex items-center justify-center transition-colors z-10"
                  aria-label="이전 단계"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

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

        <StepNavigation
          currentStep={currentStep}
          onPrev={goToPrev}
          onNext={goToNext}
          onSubmit={handleSubmit}
          canGoNext={currentStep === totalSteps ? selectedTeam !== null : canGoNext}
          isSubmitting={false}
          totalSteps={totalSteps}
        />
      </div>
    </main>
  );
}
