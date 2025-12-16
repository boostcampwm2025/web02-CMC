import EyeIcon from '@/assets/icon/eye.svg?react';
import Sheild from '@/assets/icon/shield.svg?react';
import Scale from '@/assets/icon/scale.svg?react';

interface TeamButtonProps {
  team: 'A' | 'B' | 'NONE';
  language?: string;
  code?: string;
  description?: string;
}

const TEAM_STYLES = {
  A: {
    button: 'border-[#2B7FFF]',
    icon: 'bg-[#155DFC]',
    title: 'text-[#51A2FF]',
    codeBlock: 'border-[#2B7FFF] bg-[#1C398E]'
  },
  B: {
    button: 'border-[#FB2C36]',
    icon: 'bg-[#E7000B]',
    title: 'text-[#FF5A5F]',
    codeBlock: 'border-[#FB2C36] bg-[#82181A]'
  },
  NONE: {
    button: 'border-[#FF6900]',
    icon: 'bg-[#F54900]',
    title: 'text-[#FF8533]',
    codeBlock: 'border-[#FF6900] bg-[#CA3500]'
  }
};

export default function TeamButton({ team, language, code, description }: TeamButtonProps) {
  const styles = TEAM_STYLES[team];
  const Icon = team === 'NONE' ? Scale : Sheild;
  const teamLabel = team === 'NONE' ? '중립' : `${team}팀`;
  const title = team === 'NONE' ? '공정한 관찰자' : `구현 ${team}지지`;

  return (
    <button className={`border-[0.1px] rounded-md bg-[#1E1E2F] min-h-[437px] w-[18rem] ${styles.button}`}>
      <Icon className={`rounded-full w-[96px] h-[96px] px-6 py-6 mx-auto ${styles.icon}`} />
      <p className="my-4">{teamLabel}</p>
      <p className={`text-[16px] my-4 ${styles.title}`}>{title}</p>
      {team === 'NONE' ? (
        <div className={`border-[1px] rounded-md w-[85%] mx-auto text-left px-4 py-2 ${styles.codeBlock}`}>
          <p className="text-[12px] text-[#BEDBFF] my-2 whitespace-pre-line text-center">
            양측의 의견을 들으며{'\n'}객관적으로 판단하고{'\n'}최종에 투표합니다
          </p>
        </div>
      ) : (
        <div className={`border-[1px] rounded-md w-[85%] mx-auto text-left px-4 py-2 ${styles.codeBlock}`}>
          <div className="flex justify-between">
            <p className="text-[8px] text-[#8EC5FF]">{language}</p>
            <EyeIcon className="text-blue-400" />
          </div>
          <p className="text-[12px] text-[#BEDBFF] my-2 line-clamp-3">{code}</p>
        </div>
      )}
      <p className="mx-5 text-[12px] text-[#99A1AF] mt-4">
        {description || (team === 'NONE' ? '아직 결정하지 못했다면 중립으로 시작하세요' : '')}
      </p>
    </button>
  );
}
