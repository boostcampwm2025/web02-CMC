export const BATTLE_PHASE = {
  WAITING_FOR_START: 'WAITING_FOR_START',
  OPINION_SHARE: 'OPINION_SHARE',
  TEAM_A_ATTACK: 'TEAM_A_ATTACK',
  TEAM_B_ATTACK: 'TEAM_B_ATTACK',
  TEAM_SWITCH: 'TEAM_SWITCH',
} as const

export const BATTLE_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
}

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
  FIVE_MIN: 5,
  TEN_MIN: 10,
  THIRTY_MIN: 30,
} as const
