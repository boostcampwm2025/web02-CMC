interface CodeViewerProps {
  team: 'A' | 'B';
  language: string;
  code: string;
}

const TEAMSTYLES = {
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
};

export default function CodeViewer({ team, language, code }: CodeViewerProps) {
  const styles = TEAMSTYLES[team];
  const lines = code.split('\n');

  return (
    <div className={`flex-1 ${styles.bg} rounded-lg overflow-hidden border ${styles.border}`}>
      <div className={`${styles.header} px-4 py-2 flex justify-between items-center`}>
        <span className="text-[14px] text-white">{language}</span>
        <span className={`text-[16px] font-bold ${styles.text}`}>구현 {team}</span>
      </div>
      <div className="p-4 min-h-[380px]">
        <pre className="text-[13px] text-[#E0E0E0] font-mono leading-relaxed">
          {lines.map((line, index) => (
            <div key={index} className="flex">
              <span className="text-[#5A5A5A] w-8 text-right mr-4 select-none">{index + 1}</span>
              <span>{line}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
