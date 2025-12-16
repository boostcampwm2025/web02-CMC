export const BATTLE_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISHED: 'FINISHED',
} as const

export const BATTLE_PHASE = {
  WAITING_FOR_START: 'WAITING_FOR_START',
  OPINION_SHARE: 'OPINION_SHARE',
  TEAM_A_ATTACK: 'TEAM_A_ATTACK',
  TEAM_B_ATTACK: 'TEAM_B_ATTACK',
  TEAM_SWITCH: 'TEAM_SWITCH',
} as const

export enum BATTLE_LANGUAGE {
  TS = 'TS',
  JS = 'JS',
  PYTHON = 'PYTHON',
}

export const BATTLE_TYPE = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
} as const
export type BattleType = (typeof BATTLE_TYPE)[keyof typeof BATTLE_TYPE]

export const BATTLE_CATEGORY = {
  ALGORITHM: 'ALGORITHM',
  REFACTORING: 'REFACTORING',
  IMPLEMENT: 'IMPLEMENT',
  ETC: 'ETC',
} as const
export type BattleCategory = (typeof BATTLE_CATEGORY)[keyof typeof BATTLE_CATEGORY]

export const BATTLE_PLAYTIME = {
  FIVE_MIN: 5,
  TEN_MIN: 10,
  THIRTY_MIN: 30,
} as const
export type BattlePlayTime = (typeof BATTLE_PLAYTIME)[keyof typeof BATTLE_PLAYTIME]
