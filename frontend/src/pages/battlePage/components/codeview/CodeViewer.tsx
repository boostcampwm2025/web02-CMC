import CodeViewer from '@/commons/components/CodeViewer';

interface CodeViewerProps {
  team: 'A' | 'B';
  language: string;
  code: string;
}

const TEAM_STYLES = {
  A: {
    bg: 'bg-[#1C2B4A]',
    header: 'bg-[#2B5BA6]',
    text: 'text-[#51A2FF]',
    border: 'border-[#2B7FFF]'
  },
  B: {
    bg: 'bg-[#2D1F2B]',
    header: 'bg-[#8B2A2A]',
    text: 'text-[#FF5A5F]',
    border: 'border-[#FB2C36]'
  }
} as const;

export default function BattleCodeViewer({ team, language, code }: CodeViewerProps) {
  const styles = TEAM_STYLES[team];

  return (
    <div className={`flex-1 ${styles.bg} rounded-lg overflow-hidden border-2 ${styles.border}`}>
      <div className={`${styles.header} px-4 py-2 flex justify-between items-center`}>
        <span className="text-[14px] text-white">{language}</span>
        <span className={`text-[16px] font-bold ${styles.text}`}>구현 {team}</span>
      </div>
      <CodeViewer code={code} language={language} team={team} containerClassName="w-full" />
    </div>
  );
}
