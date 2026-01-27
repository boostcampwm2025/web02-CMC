import { BookOpen, ExternalLink, Sparkles, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { BattleReferenceData, ReferenceLink } from '@/commons/types/battle';

interface ReferenceDataProps {
  referenceData: BattleReferenceData;
}

interface TeamReferencesProps {
  team: 'A' | 'B';
  perspective: string;
  references: ReferenceLink[];
  isExpanded: boolean;
  onToggle: () => void;
}

const TEAM_COLOR_CLASSES = {
  A: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    gradient: 'from-blue-600 to-blue-500',
    hover: 'hover:border-blue-500/50'
  },
  B: {
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    gradient: 'from-orange-600 to-orange-500',
    hover: 'hover:border-orange-500/50'
  }
};

function TeamReferences({ team, perspective, references, isExpanded, onToggle }: TeamReferencesProps) {
  const colors = TEAM_COLOR_CLASSES[team];

  return (
    <div className="space-y-4">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between gap-3 p-4 rounded-lg border-2 ${colors.border} ${colors.bg} ${colors.hover} transition-all`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}
          >
            <span className="text-white font-bold text-lg">{team}</span>
          </div>
          <div className="text-left">
            <h3 className="text-white font-semibold text-lg">구현 {team} 관점</h3>
            <p className="text-gray-400 text-xs">{references.length}개의 참고 자료</p>
          </div>
        </div>
        <div className={`${colors.text} transition-transform duration-200 ${isExpanded ? 'rotate-0' : 'rotate-180'}`}>
          <ChevronUp className="w-6 h-6" />
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* 관점 설명 */}
          <div className={`${colors.bg} ${colors.border} border rounded-lg p-3`}>
            <div className="flex items-start gap-2">
              <Sparkles className={`w-4 h-4 ${colors.text} flex-shrink-0 mt-0.5`} />
              <p className="text-gray-300 text-sm">{perspective}</p>
            </div>
          </div>

          {/* 참고 자료 목록 */}
          {references.map((ref, index) => (
            <div
              key={index}
              className={`bg-[#0a0a1a]/50 border-2 ${colors.border} ${colors.hover} rounded-xl p-4 transition-all hover:shadow-lg group`}
            >
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${colors.text} font-semibold text-sm hover:underline inline-flex items-center gap-1.5 mb-3`}
              >
                {ref.title}
                <ExternalLink className="w-4 h-4 opacity-60 flex-shrink-0" />
              </a>

              <p className="text-gray-300 text-sm leading-relaxed">{ref.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReferenceData({ referenceData }: ReferenceDataProps) {
  const [expandedConcepts, setExpandedConcepts] = useState(false);
  const [expandedTeamA, setExpandedTeamA] = useState(false);
  const [expandedTeamB, setExpandedTeamB] = useState(false);

  const { commonConcepts, teamA, teamB } = referenceData;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-6xl mx-auto px-4">
      <div className="text-center mb-4">
        <BookOpen className="w-10 h-10 xl:w-12 xl:h-12 text-orange-500 mx-auto mb-2" />
        <h2 className="text-xl xl:text-2xl font-bold text-white mb-1">참고 자료</h2>
        <p className="text-sm xl:text-base text-gray-400">AI가 선별한 배틀 관련 참고 자료를 확인하세요</p>
      </div>

      <div className="w-full bg-[#0d0d1a]/50 rounded-lg border border-[#1a1a2e] p-4 xl:p-6 space-y-6">
        {/* 공통 개념 섹션 - 토글 형식 */}
        <div className="space-y-4">
          <button
            onClick={() => setExpandedConcepts(!expandedConcepts)}
            className="w-full flex items-center justify-between gap-3 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/30 hover:border-yellow-500/50 rounded-xl transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold text-lg">핵심 개념</h3>
                <p className="text-gray-400 text-xs">{commonConcepts.terms.length}개의 핵심 용어</p>
              </div>
            </div>
            <div
              className={`text-yellow-400 transition-transform duration-200 ${expandedConcepts ? 'rotate-0' : 'rotate-180'}`}
            >
              <ChevronUp className="w-6 h-6" />
            </div>
          </button>

          {expandedConcepts && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {/* 요약 */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-gray-300 text-sm">{commonConcepts.summary}</p>
              </div>

              {/* 용어 목록 */}
              {commonConcepts.terms.length > 0 && (
                <div className="space-y-2">
                  {commonConcepts.terms.map((term, index) => (
                    <div
                      key={index}
                      className="bg-[#0a0a1a]/50 border-2 border-yellow-500/30 hover:border-yellow-500/50 rounded-xl p-4 transition-all"
                    >
                      <h4 className="text-yellow-400 font-semibold text-sm mb-2">{term.term}</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{term.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* A/B 참고 자료 */}
        <div className="grid grid-cols-1 gap-6">
          <TeamReferences
            team="A"
            perspective={teamA.perspective}
            references={teamA.references}
            isExpanded={expandedTeamA}
            onToggle={() => setExpandedTeamA(!expandedTeamA)}
          />
          <TeamReferences
            team="B"
            perspective={teamB.perspective}
            references={teamB.references}
            isExpanded={expandedTeamB}
            onToggle={() => setExpandedTeamB(!expandedTeamB)}
          />
        </div>

        {/* 안내 메시지 */}
        <div className="bg-[#0a0a1a]/50 border-2 border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs text-center">
            참고 자료는 AI가 자동으로 선별한 것으로, 배틀 주제와 코드 내용을 분석하여 제공됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
