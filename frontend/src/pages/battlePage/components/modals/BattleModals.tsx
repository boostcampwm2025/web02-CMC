import { useParams } from 'react-router-dom';
import { useTeamVoteResult } from '@/features/battle/hooks/useTeamVoteResult';
import { usePhaseSkip } from '@/features/battle/hooks/usePhaseSkip';
import { useGetBattleInfo } from '@/commons/hooks/useGetBattleInfo';
import type { EffectModalState } from '../../hooks/useEffectModal';
import type { RoundUpdateState } from '../../hooks/useRoundUpdateModal';
import TeamChangeModal from '@/features/battle/components/modals/TeamChangeModal';
import ConnectionErrorModal from './ConnectionErrorModal';
import DiscussionModal from '@/features/battle/components/effects/DiscussionModal';
import SkipModal from '../effects/SkipModal';
import TeamVoteResultModal from '@/features/battle/components/effects/TeamVoteResultModal';
import RoundUpdateModal from '../effects/RoundUpdateModal';

interface BattleModalsProps {
  effectModal: EffectModalState;
  onHideEffect: () => void;
  roundModal: RoundUpdateState;
  onHideRoundEffect: () => void;
  handleTeamChange: (team: 'A' | 'B' | 'NONE') => void;
  isTeamChangeModalOpen: boolean;
  onCloseTeamChangeModal: () => void;
}

export default function BattleModals({
  effectModal,
  onHideEffect,
  roundModal,
  onHideRoundEffect,
  handleTeamChange,
  isTeamChangeModalOpen,
  onCloseTeamChangeModal
}: BattleModalsProps) {
  const { id: battleId } = useParams<{ id: string }>();
  const { battleInfo: { topics: battleTopics } = {} } = useGetBattleInfo(battleId!);
  const { voteResult, isModalOpen: isVoteResultModalOpen, closeModal: closeVoteResultModal } = useTeamVoteResult();
  const { isModalOpen: isPhaseSkipModalOpen, closeModal: closeSkipModal } = usePhaseSkip();

  return (
    <>
      <TeamChangeModal
        isOpen={isTeamChangeModalOpen}
        topics={battleTopics ?? []}
        handleTeamChange={handleTeamChange}
        onClose={onCloseTeamChangeModal}
      />

      {!isPhaseSkipModalOpen && effectModal.isOpen && effectModal.team !== 'NONE' && (
        <DiscussionModal
          isOpen={effectModal.isOpen}
          team={effectModal.team}
          content={effectModal.content}
          type={effectModal.type}
          onClose={onHideEffect}
        />
      )}

      {isPhaseSkipModalOpen && <SkipModal isOpen={true} onClose={closeSkipModal} />}

      {isVoteResultModalOpen && voteResult && (
        <TeamVoteResultModal
          isOpen={isVoteResultModalOpen}
          round={voteResult.round}
          teamACount={voteResult.after.teamA}
          teamBCount={voteResult.after.teamB}
          teamABefore={voteResult.before.teamA}
          teamBBefore={voteResult.before.teamB}
          teamAPercentage={(voteResult.after.teamA / (voteResult.after.teamA + voteResult.after.teamB)) * 100}
          teamBPercentage={(voteResult.after.teamB / (voteResult.after.teamA + voteResult.after.teamB)) * 100}
          leadingTeam={voteResult.dominantTeam === 'NONE' ? null : voteResult.dominantTeam}
          onClose={closeVoteResultModal}
        />
      )}

      {roundModal.isPending && !isVoteResultModalOpen && (
        <RoundUpdateModal isOpen={true} round={roundModal.round} topic={roundModal.topic} onClose={onHideRoundEffect} />
      )}

      <ConnectionErrorModal />
    </>
  );
}
