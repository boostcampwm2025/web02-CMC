import { BookOpen, ExternalLink, Sparkles, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { BattleReferenceData, ReferenceLink } from '@/commons/types/battle';

interface ReferenceSectionProps {
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
    <div className="space-y-3">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between gap-2 p-3 rounded-lg border ${colors.border} ${colors.bg} ${colors.hover} transition-all`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow`}
          >
            <span className="text-white font-bold text-sm">{team}</span>
          </div>
          <div className="text-left">
            <h3 className="text-white font-semibold text-sm">구현 {team} 관점</h3>
            <p className="text-gray-400 text-xs">{references.length}개의 참고 자료</p>
          </div>
        </div>
        <div className={`${colors.text} transition-transform duration-200 ${isExpanded ? 'rotate-0' : 'rotate-180'}`}>
          <ChevronUp className="w-5 h-5" />
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-2 animate-in fade-in duration-200">
          {/* 관점 설명 */}
          <div className={`${colors.bg} ${colors.border} border rounded-lg p-2`}>
            <div className="flex items-start gap-2">
              <Sparkles className={`w-3 h-3 ${colors.text} flex-shrink-0 mt-0.5`} />
              <p className="text-gray-300 text-xs">{perspective}</p>
            </div>
          </div>

          {/* 참고 자료 목록 */}
          {references.map((ref, index) => (
            <div
              key={index}
              className={`bg-[#0a0a1a]/50 border ${colors.border} ${colors.hover} rounded-lg p-3 transition-all hover:shadow group`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className={`${colors.text} font-semibold text-xs flex-1`}>{ref.title}</h4>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${colors.text} opacity-60 hover:opacity-100 transition-opacity`}
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 text-xs hover:text-gray-400 transition-colors block mb-2 truncate"
              >
                {ref.url}
              </a>

              <p className="text-gray-300 text-xs leading-relaxed">{ref.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReferenceSection({ referenceData }: ReferenceSectionProps) {
  const [expandedConcepts, setExpandedConcepts] = useState(false);
  const [expandedTeamA, setExpandedTeamA] = useState(false);
  const [expandedTeamB, setExpandedTeamB] = useState(false);

  const { commonConcepts, teamA, teamB } = referenceData;

  return (
    <div className="p-4 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-orange-500" />
        <h2 className="text-white font-bold">AI 참고 자료</h2>
      </div>

      {/* 공통 개념 섹션 - 토글 형식 */}
      <div className="space-y-3">
        <button
          onClick={() => setExpandedConcepts(!expandedConcepts)}
          className="w-full flex items-center justify-between gap-2 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 hover:border-yellow-500/50 rounded-lg transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center shadow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-semibold text-sm">핵심 개념</h3>
              <p className="text-gray-400 text-xs">{commonConcepts.terms.length}개의 핵심 용어</p>
            </div>
          </div>
          <div
            className={`text-yellow-400 transition-transform duration-200 ${expandedConcepts ? 'rotate-0' : 'rotate-180'}`}
          >
            <ChevronUp className="w-5 h-5" />
          </div>
        </button>

        {expandedConcepts && (
          <div className="space-y-2 animate-in fade-in duration-200">
            {/* 요약 */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2">
              <p className="text-gray-300 text-xs">{commonConcepts.summary}</p>
            </div>

            {/* 용어 목록 */}
            {commonConcepts.terms.length > 0 && (
              <div className="space-y-2">
                {commonConcepts.terms.map((term, index) => (
                  <div
                    key={index}
                    className="bg-[#0a0a1a]/50 border border-yellow-500/30 hover:border-yellow-500/50 rounded-lg p-3 transition-all"
                  >
                    <h4 className="text-yellow-400 font-semibold text-xs mb-1">{term.term}</h4>
                    <p className="text-gray-300 text-xs leading-relaxed">{term.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* A/B 참고 자료 */}
      <div className="space-y-4">
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
      <div className="bg-[#0a0a1a]/50 border border-gray-800 rounded-lg p-3">
        <p className="text-gray-400 text-xs text-center">
          참고 자료는 AI가 자동으로 선별한 것으로, 배틀 주제와 코드 내용을 분석하여 제공됩니다.
        </p>
      </div>
    </div>
  );
}
