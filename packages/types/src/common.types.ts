/**
 * 배틀 페이즈
 */
export type BattlePhaseName = 'PENDING' | 'OPINION_SHARE' | 'ATTACK' | 'DEFENSE' | 'TEAM_SWITCH';

/**
 * 배틀 상태
 */
export type BattleStatus = 'PENDING' | 'OPEN' | 'CLOSED';

/**
 * 배틀 언어
 */
export type BattleLanguage = 'TS' | 'JS' | 'PYTHON';

/**
 * 배틀 타입 (공개/비공개)
 */
export type BattleType = 'PUBLIC' | 'PRIVATE';

/**
 * 배틀 카테고리
 */
export type BattleCategory = 'ALGORITHM' | 'REFACTORING' | 'IMPLEMENT' | 'ETC';

/**
 * 배틀 팀
 */
export type BattleTeam = 'A' | 'B' | 'NONE';

/**
 * 토론 타입 (공격/방어)
 */
export type BattleDiscussionType = 'ATTACK' | 'DEFENSE';

/**
 * 토론 상태
 */
export type BattleDiscussionStatus = 'PENDING' | 'SELECTED' | 'REJECTED';

/**
 * 채팅 범위
 */
export type BattleChatScope = 'ALL' | 'TEAM';

/**
 * 배틀 플레이 시간
 */
export type BattlePlayTimeName = 'FIFTEEN_MIN' | 'THIRTY_MIN';
