import { useNavigate, useLoaderData } from 'react-router-dom';
import type { BattleInfo } from '@/commons/types/battle';
import TeamButton from './components/TeamButton';
import BattleIcon from '@/assets/icon/battle.svg?react';

export default function TeamSelectPage() {
  const navigate = useNavigate();
  const battleInfo = useLoaderData<BattleInfo>();

  return (
    <main className="text-white flex items-center justify-center min-h-screen">
      <div className="w-fit">
        <div className="flex w-fit mx-auto">
          <BattleIcon className="w-[48px] h-[48px] text-[#FF6900]" />
          <h1 className="ml-2 text-[16px] my-auto">진영을 선택해주세요</h1>
        </div>
        <div className="w-[768px] h-[113px] bg-[#1E1E2F] border-[1px] border-[#2D2D3F] rounded-lg mx-auto text-center py-6 mt-6 mb-10">
          <p className="font-bold text-[20px]">{battleInfo.title}</p>
          <p className="mt-2 text-[#99A1AF] text-[16px]">{battleInfo.description}</p>
        </div>
        <div className="w-fit mx-auto my-4 flex gap-8 text-white">
          <TeamButton team="A" language="javascript" code={battleInfo.aCode} />
          <TeamButton team="NONE" />
          <TeamButton team="B" language="javascript" code={battleInfo.bCode} />
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-[115px] h-[51px] mt-8 mx-auto border border-[#2D2D3F] bg-[#1E1E2F] rounded-lg text-[16px] text-[#D1D5DC] block"
        >
          돌아가기
        </button>
      </div>
    </main>
  );
}
