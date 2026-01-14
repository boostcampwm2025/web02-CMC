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
  FIVE_MIN: { name: 'FIVE_MIN', time: 5, rounds: 1 },
  TEN_MIN: { name: 'TEN_MIN', time: 10, rounds: 2 },
  THIRTY_MIN: { name: 'THIRTY_MIN', time: 30, rounds: 6 },
} as const

export const BATTLE_CHAT_SCOPE = {
  ALL: 'ALL',
  TEAM: 'TEAM',
} as const
