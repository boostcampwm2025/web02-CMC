import { useBattleStore, selectTeamCounts } from '@/pages/battlePage/stores/battleStore';

export default function ParticipantRatioBar() {
  const { teamACount, teamBCount, none } = useBattleStore(selectTeamCounts);

  const total = teamACount + teamBCount + none || 1;
  const teamAProgress = (teamACount / total) * 100;
  const neutralProgress = (none / total) * 100;
  const teamBProgress = (teamBCount / total) * 100;

  return (
    <div className="flex h-3">
      <div className="bg-blue-500 transition-all duration-500 ease-in-out" style={{ width: `${teamAProgress}%` }}></div>
      {none > 0 && (
        <div
          className="bg-gray-600 transition-all duration-500 ease-in-out"
          style={{ width: `${neutralProgress}%` }}
        ></div>
      )}
      <div className="bg-red-500 transition-all duration-500 ease-in-out" style={{ width: `${teamBProgress}%` }}></div>
    </div>
  );
}
