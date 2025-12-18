import { useState } from 'react';
import EyeIcon from '@/assets/icon/eye.svg?react';
import Sheild from '@/assets/icon/shield.svg?react';
import Scale from '@/assets/icon/scale.svg?react';
import CodeTooltip from './CodeTooltip';

interface TeamButtonProps {
  team: 'A' | 'B' | 'NONE';
  language?: string;
  code?: string;
  description?: string;
  onSelect?: (team: 'A' | 'B' | 'NONE') => void;
}

const TEAM_STYLES = {
  A: {
    button: 'border-[#2B7FFF]',
    icon: 'bg-[#155DFC]',
    title: 'text-[#51A2FF]',
    codeBlock: 'border-[#2B7FFF] bg-[#1C398E]',
    codeText: 'text-[#BEDBFF]'
  },
  B: {
    button: 'border-[#FB2C36]',
    icon: 'bg-[#E7000B]',
    title: 'text-[#FF5A5F]',
    codeBlock: 'border-[#FB2C36] bg-[#82181A]',
    codeText: 'text-[#FFC9C9]'
  },
  NONE: {
    button: 'border-[#FF6900]',
    icon: 'bg-[#F54900]',
    title: 'text-[#FF8533]',
    codeBlock: 'border-[#FF6900] bg-[#CA3500]',
    codeText: 'text-[#FFB86A]'
  }
};

const TEAM_CONTENT = {
  A: {
    label: 'A팀',
    title: '구현 A지지',
    description: `구현 A가 더 우수하다고 생각한다면\n 이 진영을 선택하세요.`
  },
  B: {
    label: 'B팀',
    title: '구현 B지지',
    description: `구현 B가 더 우수하다고 생각한다면\n 이 진영을 선택하세요.`
  },
  NONE: {
    label: '중립',
    title: '공정한 관찰자',
    message: '양측의 의견을 들으며\n객관적으로 판단하고\n최종에 투표합니다',
    description: '아직 결정하지 못했다면 중립으로 시작하세요'
  }
};

export default function TeamButton({ team, language, code, description, onSelect }: TeamButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const styles = TEAM_STYLES[team];
  const content = TEAM_CONTENT[team];
  const Icon = team === 'NONE' ? Scale : Sheild;

  return (
    <div
      className="relative"
      onMouseEnter={() => team !== 'NONE' && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => onSelect?.(team)}
        className={`border-[0.1px] rounded-lg bg-[#1E1E2F] min-h-[437px] w-[18rem] ${styles.button} transition-transform duration-300 hover:scale-110`}
      >
        <Icon className={`rounded-full w-[96px] h-[96px] px-6 py-6 mx-auto ${styles.icon}`} />
        <p className="my-4">{content.label}</p>
        <p className={`text-[16px] my-4 ${styles.title}`}>{content.title}</p>
        {team === 'NONE' ? (
          <div className={`border-[1px] rounded-md w-[85%] mx-auto text-left px-4 py-2 ${styles.codeBlock}`}>
            <p className={`text-[12px] ${styles.codeText} my-2 whitespace-pre-line text-center`}>
              {'message' in content && content.message}
            </p>
          </div>
        ) : (
          <div className={`relative border-[1px] rounded-md w-[85%] mx-auto text-left px-4 py-2 ${styles.codeBlock}`}>
            <div className="flex justify-between">
              <p className="text-[8px] text-[#8EC5FF]">{language}</p>
              <EyeIcon className="text-blue-400" />
            </div>
            <p className={`text-[12px] ${styles.codeText} my-2 line-clamp-3`}>{code}</p>
          </div>
        )}
        <p className="mx-5 text-[12px] text-[#99A1AF] mt-4">
          {description || ('description' in content ? content.description : '')}
        </p>
      </button>

      {isHovered && team !== 'NONE' && language && code && (
        <CodeTooltip
          team={team as 'A' | 'B'}
          language={language}
          code={code}
          titleColor={styles.title}
          borderColor={styles.button}
        />
      )}
    </div>
  );
}
