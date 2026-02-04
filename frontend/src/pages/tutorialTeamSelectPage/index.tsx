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
import { TUTORIAL_BATTLE_ID, TUTORIAL_BATTLE_INFO } from '@/pages/tutorial/const/tutorialBattle';
import TutorialIntroModal from './components/TutorialIntroModal';

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
      <TutorialIntroModal
        isOpen={showIntro}
        step={introStep}
        onNext={() => setIntroStep(1)}
        onStart={() => setShowIntro(false)}
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/main')}
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
