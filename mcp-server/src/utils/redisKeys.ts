export const TIMERS_KEY = 'battle:timers';

export const getCoreKey = (battleId: string) => `battle:core:${battleId}`;
export const getAttacksKey = (battleId: string) => `battle:attacks:${battleId}`;
export const getDefensesKey = (battleId: string) => `battle:defenses:${battleId}`;
export const getChatsAllKey = (battleId: string) => `battle:chats:all:${battleId}`;
export const getChatsAKey = (battleId: string) => `battle:chats:a:${battleId}`;
export const getChatsBKey = (battleId: string) => `battle:chats:b:${battleId}`;
export const getDiscussionKey = (battleId: string, discussionId: string) => `battle:${battleId}:discussion:${discussionId}`;
export const getDiscussionIdsKey = (battleId: string, type: 'attack' | 'defense', team: string) => `battle:${battleId}:discussions:${type}:${team}`;
export const getDiscussionIdsIndexKey = (battleId: string) => `battle:${battleId}:discussion:ids`;
export const getDiscussionVotesKey = (battleId: string, discussionId: string) => `battle:${battleId}:discussion:${discussionId}:votes`;
export const getUserCurrentVoteKey = (battleId: string, userId: string) => `battle:${battleId}:user:${userId}:vote`;
