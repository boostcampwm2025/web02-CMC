import { useParams } from 'react-router-dom';
import type { Team } from '@/commons/types/battle';
import { useTeamVoteResult } from '../../hooks/useTeamVoteResult';
import { usePhaseSkip } from '../../hooks/usePhaseSkip';
import { useGetBattleInfo } from '@/commons/hooks/useGetBattleInfo';
import TeamChangeModal from './TeamChangeModal';
import ConnectionErrorModal from './ConnectionErrorModal';
import DiscussionModal from '../effects/DiscussionModal';
import SkipModal from '../effects/SkipModal';
import TeamVoteResultModal from '../effects/TeamVoteResultModal';
import RoundUpdateModal from '../effects/RoundUpdateModal';

interface EffectModal {
  isOpen: boolean;
  team: Team;
  content: string;
  type: 'attack' | 'defense';
}

interface RoundModal {
  isPending: boolean;
  round: number;
  topic: string;
}

interface BattleModalsProps {
  effectModal: EffectModal;
  onHideEffect: () => void;
  roundModal: RoundModal;
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
