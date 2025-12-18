export const BATTLE_PHASE = {
  // WAITING_FOR_START: {
  //   name: 'WAITING_FOR_START',
  //   time: 0,
  // },
  OPINION_SHARE: {
    name: 'OPINION_SHARE',
    time: 2 * 1000, // 1분
  },
  TEAM_A_ATTACK: {
    name: 'TEAM_A_ATTACK',
    time: 120 * 1000, // 2분
  },
  TEAM_B_ATTACK: {
    name: 'TEAM_B_ATTACK',
    time: 120 * 1000, // 2분
  },
  TEAM_SWITCH: {
    name: 'TEAM_SWITCH',
    time: 2 * 1000, // 10초
  },
} as const

export const BATTLE_TURN = {
  A_ATTACK: { name: 'A_ATTACK', time: 2 * 1000 },
  B_ATTACK: { name: 'B_ATTACK', time: 2 * 1000 },
  A_DEFENSE: { name: 'A_DEFENSE', time: 2 * 1000 },
  B_DEFENSE: { name: 'B_DEFENSE', time: 2 * 1000 },
} as const

export const BATTLE_STATUS = {
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
