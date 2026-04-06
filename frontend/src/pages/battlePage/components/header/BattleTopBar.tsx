import Button from '@/commons/components/Button';
import { useBattleStore, selectBattleProgress } from '../../stores/battleStore';
import SoundSettingsButton, { type BGMOption } from './SoundSettingsButton';
import BattleHeader from './index';
import InviteLinkButton from '@/pages/battleCreatePage/components/InviteLinkButton';
import { usePhaseSkip } from '../../hooks/usePhaseSkip';

interface BattleTopBarProps {
  onLeave: () => void;
  inviteCode?: string;
  bgmOptions: BGMOption[];
}

export default function BattleTopBar({ onLeave, inviteCode, bgmOptions }: BattleTopBarProps) {
  const battleProgress = useBattleStore(selectBattleProgress);
  const { isSkipEnabled, toggleSkip, totalSkips } = usePhaseSkip();

  const isActive =
    battleProgress &&
    (battleProgress.phase as string) !== 'PENDING' &&
    battleProgress.expiredAt != null &&
    battleProgress.startedAt;

  return (
    <div className={`transition-all duration-300 main-width-closed ${isActive}`}>
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
