import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/commons/components/Icon';
import Button from '@/commons/components/Button';
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
import { TUTORIAL_BATTLE_ID, TUTORIAL_BATTLE_INFO } from '@/pages/tutorialPage/const/tutorialBattle';
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
          <Button variant="secondary" size="sm" onClick={() => navigate('/main')}>
            ← 돌아가기
          </Button>
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
                <Button
                  onClick={goToPrev}
                  variant="secondary"
                  aria-label="이전 단계"
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 w-12 h-12 p-0 rounded-full z-10"
                >
                  <Icon name="chevronLeft" className="w-6 h-6" />
                </Button>
              )}

              {currentStep < totalSteps && (
                <Button
                  onClick={goToNext}
                  disabled={!canGoNext}
                  variant={canGoNext ? 'primary' : 'secondary'}
                  aria-label="다음 단계"
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 w-12 h-12 p-0 rounded-full z-10"
                >
                  <Icon name="chevronRight" className="w-6 h-6" />
                </Button>
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
