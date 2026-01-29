import { BookOpen, Sparkles, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { BattleReferenceData } from '@/commons/types/battle';
import { TermCard, TeamReferencesAccordion } from '@/commons/components/reference';

interface ReferenceSectionProps {
  referenceData: BattleReferenceData;
}

export default function ReferenceSection({ referenceData }: ReferenceSectionProps) {
  const [expandedConcepts, setExpandedConcepts] = useState(false);
  const [expandedTeamA, setExpandedTeamA] = useState(false);
  const [expandedTeamB, setExpandedTeamB] = useState(false);

  const { commonConcepts, teamA, teamB } = referenceData;

  return (
    <section className="p-4 overflow-y-auto max-h-[calc(100vh-100px)] custom-scrollbar">
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
                    <TermCard key={index} term={term.term} description={term.description} size="sm" />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* A/B 참고 자료 */}
        <div className="space-y-4">
          <TeamReferencesAccordion
            team="A"
            perspective={teamA.perspective}
            references={teamA.references}
            isExpanded={expandedTeamA}
            onToggle={() => setExpandedTeamA(!expandedTeamA)}
            size="sm"
          />
          <TeamReferencesAccordion
            team="B"
            perspective={teamB.perspective}
            references={teamB.references}
            isExpanded={expandedTeamB}
            onToggle={() => setExpandedTeamB(!expandedTeamB)}
            size="sm"
          />
        </div>

        {/* 안내 메시지 */}
        <div className="bg-[#0a0a1a]/50 border border-gray-800 rounded-lg p-3">
          <p className="text-gray-400 text-xs text-center">
            참고 자료는 AI가 자동으로 선별한 것으로, 배틀 주제와 코드 내용을 분석하여 제공됩니다.
          </p>
        </div>
      </div>
    </section>
  );
}
