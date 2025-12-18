import TimerIcon from '@/assets/icon/timer.svg?react';
import { getTurnInfo } from '../../utils/getTurnInfo';

interface StatusCardProps {
  turn: string | null;
  timer: string;
}

export default function StatusCard({ turn, timer }: StatusCardProps) {
  const { title, description } = getTurnInfo(turn);
  return (
    <div className="bg-gradient-to-br from-[#3D2A28] to-[#2D1F2B] border-2 border-[#FF8A00] rounded-lg px-4 py-2 min-w-[320px] min-h-[145px]">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#FF8A00] rounded-full" />
          <span className="text-[#FF8A00] text-[12px] font-medium">지금 해야 할 일</span>
        </div>
        <div className="flex items-center gap-1 text-[#FF8A00]">
          <TimerIcon className="w-[16px] h-[16px]" />
          <span className="text-[18px] font-bold">{timer}</span>
        </div>
      </div>
      <h3 className="text-white text-[16px] font-bold mb-1 flex items-center gap-2">
        {title}
        <span className="text-[16px]">💬</span>
      </h3>
      <p className="text-[#99A1AF] text-[12px] text-left">{description}</p>
    </div>
  );
}
