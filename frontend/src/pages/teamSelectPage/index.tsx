import { useState, useEffect } from 'react';
import { useNavigate, useLoaderData, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { BattleInfo } from '@/commons/types/battle';
import { useStepFlow } from './hooks/useStepFlow';
import StepIndicator from './components/StepIndicator';
import StepNavigation from './components/StepNavigation';
import Step1BattleInfo from './components/steps/Step1BattleInfo';
import Step2CodeCompare from './components/steps/Step2CodeCompare';
import Step3Timeline from './components/steps/Step3Timeline';
import Step4TeamSelect from './components/steps/Step4TeamSelect';
import { convertToTimelineItems } from './utils/convertTimeline';
import type { Team } from '@/commons/types/battle';
import {
  useBattleStore,
  selectTimelines,
  selectTeamCounts,
  selectBattleProgress
} from '@/pages/battlePage/stores/battleStore';
import { useBattleSocket } from '@/pages/battlePage/hooks/useBattleSocket';

export default function TeamSelectPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const battleInfo = useLoaderData<BattleInfo>();
  const { currentStep, goToNext, goToPrev, canGoNext } = useStepFlow();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // WebSocket을 통해 실시간 타임라인과 참여자 수 가져오기
  const timelines = useBattleStore(selectTimelines);
  const teamCounts = useBattleStore(selectTeamCounts);
  const battleProgress = useBattleStore(selectBattleProgress);

  // 배틀 스토어 초기화 (NONE 팀으로 연결)
  useEffect(() => {
    if (!id) return;

    let userId = sessionStorage.getItem('testUserId');
    if (!userId) {
      userId = `user-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('testUserId', userId);
    }

    useBattleStore.getState().initializeBattle({
      userId,
      battleId: id
    });

    // 진영 선택 전이므로 NONE으로 설정
    useBattleStore.getState().setSelectedTeam('NONE');
  }, [id]);

  // WebSocket 연결
  useBattleSocket();

  // 백엔드 timeline 데이터를 TimelineItem으로 변환 (실시간 데이터 사용)
  // 백엔드에서 이미 SELECTED 상태만 필터링되어 전송됨
  const attacks = timelines?.attacks || battleInfo.timelines.attacks;
  const defenses = timelines?.defenses || battleInfo.timelines.defenses;
  const timelineItems = convertToTimelineItems(attacks, defenses);

  // 실시간 참여자 수 계산
  const totalParticipants = (teamCounts?.teamACount || 0) + (teamCounts?.teamBCount || 0);

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
            category={battleInfo.category}
            language={battleInfo.language}
            currentRound={battleInfo.currentRound}
            totalRounds={battleInfo.totalRounds}
            totalParticipants={totalParticipants || battleInfo.participantCount}
            currentPhase={battleProgress?.phase}
          />
        );
      case 2:
        return <Step2CodeCompare aCode={battleInfo.aCode} bCode={battleInfo.bCode} language={battleInfo.language} />;
      case 3:
        return <Step3Timeline timelines={timelineItems} />;
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

        {/* Step Content with Side Navigation */}
        <div className="relative mb-8">
          <div className="flex items-center justify-center gap-8">
            {/* 이전 버튼 - 첫 단계가 아닐 때만 표시 */}
            {currentStep > 1 ? (
              <button
                onClick={goToPrev}
                className="w-12 h-12 rounded-full bg-[#2D2D3F] hover:bg-[#3D3D4F] text-white flex items-center justify-center transition-colors flex-shrink-0"
                aria-label="이전 단계"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            ) : (
              <div className="w-12 h-12 flex-shrink-0" aria-hidden="true" />
            )}

            {/* Step Content */}
            <div className="flex-1 max-w-6xl">{renderStep()}</div>

            {/* 다음 버튼 - 마지막 단계가 아닐 때만 표시 */}
            {currentStep < 4 ? (
              <button
                onClick={goToNext}
                disabled={!canGoNext}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-colors flex-shrink-0
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
            ) : (
              <div className="w-12 h-12 flex-shrink-0" aria-hidden="true" />
            )}
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
    </main>
  );
}
