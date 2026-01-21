import type { BattleDiscussion } from '@cmc/types';
import type { BattleDefense } from '@/commons/types/battle';
import type { TimelineItem } from '../types/teamSelect';

/**
 * 백엔드의 BattleDiscussion/BattleDefense를 TimelineItem으로 변환
 * selectedAt 타임스탬프를 사용하여 실제 선택된 순서대로 정렬
 */
export function convertToTimelineItems(attacks: BattleDiscussion[], defenses: BattleDefense[]): TimelineItem[] {
  const items: TimelineItem[] = [];

  // Attacks 변환
  attacks.forEach((attack) => {
    items.push({
      id: attack.discussionId,
      type: 'ATTACK',
      team: 'A',
      author: attack.author.nickname,
      content: attack.content,
      upvotes: attack.upvotes,
      timestamp: attack.selectedAt || 0 // SELECTED로 변경된 실제 시간 사용
    });
  });

  // Defenses 변환
  defenses.forEach((defense) => {
    items.push({
      id: defense.discussionId,
      type: 'DEFENSE',
      team: 'B',
      author: defense.author.nickname,
      content: defense.content,
      upvotes: defense.upvotes,
      timestamp: defense.selectedAt || 0, // SELECTED로 변경된 실제 시간 사용
      attackId: defense.attackId // 어떤 이의제기에 대한 반론인지
    });
  });

  // selectedAt 타임스탬프 기준으로 정렬 (오래된 순 = 배틀 진행 순서)
  return items.sort((a, b) => a.timestamp - b.timestamp);
}
