export const BATTLE_PHASE = {
  PENDING: {
    name: 'PENDING',
    time: 0,
  },
  OPINION_SHARE: {
    name: 'OPINION_SHARE',
    time: 60 * 1000, // 1분
  },
  ATTACK: {
    name: 'ATTACK',
    time: 3 * 60 * 1000, // 3분
  },
  DEFENSE: {
    name: 'DEFENSE',
    time: 4 * 60 * 1000, // 4분
  },
  TEAM_SWITCH: {
    name: 'TEAM_SWITCH',
    time: 40 * 1000, // 40초
  },
} as const

export const BATTLE_MAX_PHASE_COUNT = 2

export const BATTLE_STATUS = {
  PENDING: 'PENDING',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const

export const BATTLE_LANGUAGE = {
  TS: 'TS',
  JS: 'JS',
  PYTHON: 'PYTHON',
} as const

export const BATTLE_TYPE = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
} as const

export const BATTLE_DISCUSSION_TYPE = {
  ATTACK: 'ATTACK',
  DEFENSE: 'DEFENSE',
} as const

export const BATTLE_TEAM = {
  A: 'A',
  B: 'B',
  NONE: 'NONE',
} as const

export const BATTLE_CATEGORY = {
  ALGORITHM: 'ALGORITHM',
  REFACTORING: 'REFACTORING',
  IMPLEMENT: 'IMPLEMENT',
  ETC: 'ETC',
} as const

export const BATTLE_PLAYTIME = {
  FIFTEEN_MIN: { name: 'FIFTEEN_MIN', time: 15, rounds: 1 },
  THIRTY_MIN: { name: 'THIRTY_MIN', time: 30, rounds: 2 },
} as const

export const BATTLE_CHAT_SCOPE = {
  ALL: 'ALL',
  TEAM: 'TEAM',
} as const

export const MVP_DISPLAY_COUNT = 3

export interface AIReferencePromptParams {
  title: string
  description: string
  language: string
  category: string
  topics: string
  codeA: string
  codeB: string
}

export const BUILD_AI_REFERENCE_PROMPT = (params: AIReferencePromptParams): string => `당신은 코드 리뷰 배틀 플랫폼의 학습 도우미입니다.
사용자가 제공한 배틀 정보를 분석하여 참여자들이 토론에 참여하기 위한 참고 자료를 생성해주세요.

## 배틀 정보
- 제목: ${params.title}
- 설명: ${params.description}
- 언어: ${params.language}
- 카테고리: ${params.category}
- 대주제: ${params.topics}

## 코드 A
\`\`\`${params.language}
${params.codeA}
\`\`\`

## 코드 B
\`\`\`${params.language}
${params.codeB}
\`\`\`

## 작성 가이드
1. 용어는 초보자도 이해할 수 있게 쉽게 설명
2. 참고자료 URL은 실제 존재하는 신뢰할 수 있는 링크 (MDN, 공식문서, Stack Overflow 등)
3. 각 팀 입장에서 유리한 논점을 찾아 참고자료 제공
4. 한국어로 작성

## 참고자료 summary 작성 규칙 (중요!)
각 참고자료의 summary는 단순한 문서 소개가 아닌, 배틀에서 바로 인용할 수 있는 구체적인 내용을 포함해야 합니다:
- 해당 문서에서 이 배틀 주제와 관련된 핵심 개념이나 원칙을 직접 인용하거나 요약
- 토론에서 사용할 수 있는 구체적인 근거나 수치 (성능, 메모리, 가독성 등)
- "이 문서에 따르면..." 형식으로 주장할 수 있는 논거 제공
- 최소 2-3문장으로 구체적으로 작성

예시:
- 나쁜 예: "자바스크립트 클래스의 기본 문법을 설명합니다."
- 좋은 예: "MDN에 따르면 클래스는 프로토타입 기반 상속의 문법적 설탕(syntactic sugar)으로, 내부적으로는 프로토타입 체인을 사용합니다. 클래스를 사용하면 constructor, 메서드 정의, 상속(extends)을 명확하게 표현할 수 있어 코드 가독성이 향상됩니다. 특히 여러 인스턴스가 메서드를 공유하므로 메모리 효율성도 좋습니다."`

import { SchemaType, type Schema } from '@google/generative-ai'

export const AI_REFERENCE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    commonConcepts: {
      type: SchemaType.OBJECT,
      properties: {
        terms: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              term: { type: SchemaType.STRING },
              description: { type: SchemaType.STRING },
            },
            required: ['term', 'description'],
          },
        },
        summary: { type: SchemaType.STRING },
      },
      required: ['terms', 'summary'],
    },
    teamA: {
      type: SchemaType.OBJECT,
      properties: {
        perspective: { type: SchemaType.STRING },
        references: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              title: { type: SchemaType.STRING },
              url: { type: SchemaType.STRING },
              summary: { type: SchemaType.STRING },
            },
            required: ['title', 'url', 'summary'],
          },
        },
      },
      required: ['perspective', 'references'],
    },
    teamB: {
      type: SchemaType.OBJECT,
      properties: {
        perspective: { type: SchemaType.STRING },
        references: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              title: { type: SchemaType.STRING },
              url: { type: SchemaType.STRING },
              summary: { type: SchemaType.STRING },
            },
            required: ['title', 'url', 'summary'],
          },
        },
      },
      required: ['perspective', 'references'],
    },
  },
  required: ['commonConcepts', 'teamA', 'teamB'],
}
