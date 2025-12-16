import EyeIcon from '@public/icon/eye.svg?react';
import Sheild from '@public/icon/shield.svg?react';
import Scale from '@public/icon/scale.svg?react';

interface TeamButtonProps {
  team: 'A' | 'B' | 'NONE';
  title: string;
  language: string;
  code: string;
  description: string;
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

export default function TeamButton({ team, title, language, code, description }: TeamButtonProps) {
  const styles = TEAM_STYLES[team];
  const Icon = team === 'NONE' ? Scale : Sheild;
  const teamLabel = team === 'NONE' ? '중립' : `${team}팀`;

  return (
    <button className={`border-[2px] rounded-md bg-[#1E1E2F] min-h-[437px] w-[18rem] ${styles.button}`}>
      <Icon className={`rounded-full w-[96px] h-[96px] px-6 py-6 mx-auto ${styles.icon}`} />
      <p className="my-4">{teamLabel}</p>
      <p className={`text-[16px] my-4 ${styles.title}`}>{title}</p>
      <div className={`border-[1px] rounded-md w-[85%] mx-auto text-left px-4 py-2 ${styles.codeBlock}`}>
        <div className="flex justify-between">
          <p className="text-[8px] text-[#8EC5FF]">{language}</p>
          <EyeIcon className="text-blue-400" />
        </div>
        <p className="text-[12px] text-[#BEDBFF] my-2 line-clamp-3">{code}</p>
      </div>
      <p className="mx-5 text-[12px] text-[#99A1AF] mt-4">{description}</p>
    </button>
  );
}
