export interface ReferenceTerm {
  term: string
  description: string
}

export interface ReferenceLink {
  title: string
  url: string
  summary: string
}

export interface TeamReference {
  perspective: string
  references: ReferenceLink[]
}

export interface BattleReferenceData {
  commonConcepts: {
    terms: ReferenceTerm[]
    summary: string
  }
  teamA: TeamReference
  teamB: TeamReference
}
