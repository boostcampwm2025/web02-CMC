/** 클라이언트 → 서버 이벤트 */
export const BATTLE_CLIENT_EVENTS = {
  JOIN: 'battle:join',
  LEAVE: 'battle:leave',
  START: 'battle:start',
  ATTACK: 'battle:attack',
  DEFENSE: 'battle:defense',
  ATTACK_VOTE: 'battle:attack:vote',
  DEFENSE_VOTE: 'battle:defense:vote',
  CHAT: 'battle:chat',
  USER_SKIP: 'battle:user:skip',
} as const

/** 서버 → 클라이언트 이벤트 */
export const BATTLE_SERVER_EVENTS = {
  JOINED: 'battle:joined',
  JOIN_ERROR: 'battle:join:error',
  LEAVED: 'battle:leaved',
  STARTED: 'battle:started',
  ATTACK_CREATED: 'battle:attack:created',
  ATTACK_ERROR: 'battle:attack:error',
  DEFENSE_CREATED: 'battle:defense:created',
  DEFENSE_ERROR: 'battle:defense:error',
  ATTACK_VOTED: 'battle:attack:voted',
  DEFENSE_VOTED: 'battle:defense:voted',
  ATTACK_VOTE_ERROR: 'battle:attack:vote:error',
  DEFENSE_VOTE_ERROR: 'battle:defense:vote:error',
  PHASE_UPDATED: 'battle:phase:updated',
  PHASE_SKIPPED: 'battle:phase:skipped',
  ROUND_UPDATED: 'battle:round:updated',
  ATTACKED: 'battle:attacked',
  DEFENSED: 'battle:defensed',
  CLOSED: 'battle:closed',
  CHATTED: 'battle:chatted',
  ALL_UPDATED: 'battle:all:updated',
  TEAM_UPDATED: 'battle:team:updated',
  USER_UPDATED: 'battle:user:updated',
  USER_SKIPPED: 'battle:user:skipped',
  CHAT_ERROR: 'battle:chat:error',
  TEAM_VOTE_ERROR: 'battle:team:vote:error',
  USER_SKIP_ERROR: 'battle:user:skip:error',
} as const

export type BattleClientEvent = (typeof BATTLE_CLIENT_EVENTS)[keyof typeof BATTLE_CLIENT_EVENTS]
export type BattleServerEvent = (typeof BATTLE_SERVER_EVENTS)[keyof typeof BATTLE_SERVER_EVENTS]
