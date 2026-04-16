import { useParams } from 'react-router-dom';
import Button from '@/commons/components/Button';
import SoundSettingsButton, { type BGMOption } from './SoundSettingsButton';
import BattleHeader from './index';
import InviteLinkButton from '@/pages/battleCreatePage/components/InviteLinkButton';
import { usePhaseSkip } from '@/features/battle/hooks/usePhaseSkip';
import { useGetBattleInfo } from '@/commons/hooks/useGetBattleInfo';

interface BattleTopBarProps {
  onLeave: () => void;
  bgmOptions: BGMOption[];
}

export default function BattleTopBar({ onLeave, bgmOptions }: BattleTopBarProps) {
  const { id: battleId } = useParams<{ id: string }>();
  const {
    battleInfo: { inviteCode }
  } = useGetBattleInfo(battleId!);
  const { isSkipEnabled, toggleSkip, totalSkips } = usePhaseSkip();

  return (
    <div className="transition-all duration-300 main-width-closed">
      <div className="flex items-center justify-between gap-4 mt-10 mb-8">
        <Button
          variant="secondary"
          size="sm"
          onClick={onLeave}
          className="shrink-0 w-[100px] sm:w-auto sm:min-w-[100px]"
        >
          ← 돌아가기
        </Button>
        <div className="shrink-0 flex items-center gap-2">
          {inviteCode && <InviteLinkButton inviteCode={inviteCode} />}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <SoundSettingsButton bgmOptions={bgmOptions} />
        <BattleHeader isSkipEnabled={isSkipEnabled} toggleSkip={toggleSkip} totalSkips={totalSkips} />
      </div>
    </div>
  );
}
