import DiscussionVoteItem from '../discussion/DiscussionVoteItem';
import ScaleIcon from '@/assets/icon/scale.svg?react';
import { MOCK_DISCUSSIONS } from './const/tutorialSteps';

export default function TutorialVoteExample() {
  return (
    <section className="w-[590px] bg-[#1E1E2F] rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#59168B] to-[#1C398E] p-4">
        <div className="flex items-center gap-2 mb-2">
          <ScaleIcon className="w-[20px] h-[20px]" />
          <h3 className="text-[14px] font-medium text-white">제출된 이의제기 목록</h3>
        </div>

        <div className="text-[11px] text-white flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-white"></span>
          이의제기가 실시간으로 추가되며, 바로 투표 가능합니다!
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-[#1E1E2F] to-[#59168B]">
        <div className="space-y-3">
          {MOCK_DISCUSSIONS.map((discussion) => (
            <DiscussionVoteItem
              key={discussion.id}
              user={discussion.user}
              team={discussion.team}
              content={discussion.content}
              votes={discussion.votes}
              totalVotes={discussion.totalVotes}
              hasVoted={discussion.hasVoted}
              onVote={() => {}}
            />
          ))}
        </div>
      </div>

      <div className="py-4 bg-gradient-to-r from-[#1C398E] to-[#59168B] border-t border-[#2D2D3F] flex items-center justify-center gap-2 text-[13px]">
        <span className="text-[#FFB800]">⚡</span>
        <span className="text-white font-medium">총 {MOCK_DISCUSSIONS.length}개의 이의제기</span>
        <span className="text-[#99A1AF]">/ 투표 가능</span>
      </div>
    </section>
  );
}
