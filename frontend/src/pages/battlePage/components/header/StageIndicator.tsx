import BattleIcon from '@/assets/icon/battle.svg?react';

export default function StageIndicator() {
  return (
    <div className="flex items-center gap-6 min-w-[200px]">
      <div className="w-[56px] h-[56px] bg-gradient-to-br from-[#FF6900] to-[#FB2C36] rounded-xl flex items-center justify-center">
        <BattleIcon className="w-[24px] h-[24px] text-white" />
      </div>
      <div className="text-left">
        <p className="text-[14px] text-[#99A1AF]">공격페이즈</p>
        <p className="text-[20px]">A팀 이의 제기중</p>
      </div>
    </div>
  );
}
