interface CodeTooltipProps {
  team: 'A' | 'B';
  language: string;
  code: string;
  titleColor: string;
  borderColor: string;
}

const TOOLTIP_STYLES = {
  A: {
    position: 'left-[110%]',
    headerBg: 'bg-[#1C398E]'
  },
  B: {
    position: 'right-[110%]',
    headerBg: 'bg-[#82181A]'
  }
};

export default function CodeTooltip({ team, language, code, titleColor, borderColor }: CodeTooltipProps) {
  const styles = TOOLTIP_STYLES[team];

  return (
    <div
      className={`absolute top-[-120px] ${styles.position} w-[550px] h-[650px] bg-[#16162A] border-[2px] ${borderColor} rounded-lg z-50 flex flex-col shadow-2xl`}
    >
      <div
        className={`flex rounded-t-md justify-between items-center px-4 py-3 ${styles.headerBg} border-b border-[#2D2D3F]`}
      >
        <p className="text-[12px] text-[#8EC5FF]">{language}</p>
        <p className={`text-[14px] font-semibold ${titleColor}`}>구현 {team} 전체 코드</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-[#16162A] rounded-b-md">
        <pre className="text-[13px] text-[#BEDBFF] whitespace-pre-wrap break-words font-mono text-left leading-relaxed">
          {code}
        </pre>
      </div>
    </div>
  );
}
