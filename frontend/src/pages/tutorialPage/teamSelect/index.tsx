import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/commons/components/Button';
import type { Team } from '@/commons/types/battle';
import { useStepFlow } from '@/pages/teamSelectPage/hooks/useStepFlow';
import StepIndicator from '@/pages/teamSelectPage/components/StepIndicator';
import StepNavigation from '@/pages/teamSelectPage/components/StepNavigation';
import StepSlider from '@/pages/teamSelectPage/components/StepSlider';
import BattleInfo from '@/pages/teamSelectPage/components/steps/BattleInfo';
import CodeCompare from '@/pages/teamSelectPage/components/steps/CodeCompare';
import ReferenceData from '@/pages/teamSelectPage/components/steps/ReferenceData';
import Timeline from '@/pages/teamSelectPage/components/steps/Timeline';
import TeamSelect from '@/pages/teamSelectPage/components/steps/TeamSelect';
import { useBattleStore } from '@/features/battle/stores/battleStore';
import { TUTORIAL_BATTLE_ID, TUTORIAL_BATTLE_INFO } from '@/pages/tutorialPage/const/tutorialBattle';
import TutorialIntroModal from './components/TutorialIntroModal';

export default function TutorialTeamSelectPage() {
  const navigate = useNavigate();
  const battleInfo = TUTORIAL_BATTLE_INFO;
  const hasReferenceData = !!battleInfo.referenceData;
  const totalSteps = hasReferenceData ? 5 : 4;
  const { currentStep, goToNext, goToPrev, isLastStep } = useStepFlow({ totalSteps });
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [introStep, setIntroStep] = useState<0 | 1>(0);
  const [showIntro, setShowIntro] = useState(true);

  const handleSubmit = () => {
    if (!selectedTeam) return;
    useBattleStore.getState().initializeBattle({
      userId: 'tutorial-user',
      battleId: TUTORIAL_BATTLE_ID
    });
    useBattleStore.getState().setSelectedTeam(selectedTeam);
    navigate('/tutorial/battle', { state: { selectedTeam } });
  };

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

        <StepIndicator steps={steps} currentStep={currentStep} />

        <StepSlider steps={steps} currentStep={currentStep} onPrev={goToPrev} onNext={goToNext} />

        <StepNavigation
          steps={steps}
          currentStep={currentStep}
          onSubmit={handleSubmit}
          canGoNext={canGoNext}
          isSubmitting={false}
        />
      </div>
    </main>
  );
}
