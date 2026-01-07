import { useState } from 'react';
import { useNavigate, useLoaderData, useParams } from 'react-router-dom';
import type { BattleInfo } from '@/commons/types/battle';
import { useStepFlow } from './hooks/useStepFlow';
import StepIndicator from './components/StepIndicator';
import StepNavigation from './components/StepNavigation';
import Step1BattleInfo from './components/steps/Step1BattleInfo';
import Step2CodeCompare from './components/steps/Step2CodeCompare';
import Step3Timeline from './components/steps/Step3Timeline';
import Step4TeamSelect from './components/steps/Step4TeamSelect';
import { MOCK_TIMELINES } from './utils/mockTimeline';
import type { Team } from './types/teamSelect';

export default function TeamSelectPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const battleInfo = useLoaderData<BattleInfo>();
  const { currentStep, goToNext, goToPrev, canGoNext } = useStepFlow();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const handleSubmit = () => {
    if (selectedTeam && id) {
      navigate(`/battle/${id}`, { state: { selectedTeam } });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BattleInfo
            title={battleInfo.title}
            description={battleInfo.description}
            category="JavaScript"
            language="javascript"
            currentRound={3}
            totalRounds={5}
            totalParticipants={95}
          />
        );
      case 2:
        return <Step2CodeCompare aCode={battleInfo.aCode} bCode={battleInfo.bCode} language="javascript" />;
      case 3:
        return <Step3Timeline timelines={MOCK_TIMELINES} />;
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

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} />

        {/* Step Content */}
        <div className="mb-8">{renderStep()}</div>

        {/* Step Navigation */}
        <StepNavigation
          currentStep={currentStep}
          onPrev={goToPrev}
          onNext={goToNext}
          onSubmit={handleSubmit}
          canGoNext={currentStep === 4 ? selectedTeam !== null : canGoNext}
        />
      </div>
    </main>
  );
}
