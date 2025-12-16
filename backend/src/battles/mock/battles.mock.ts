import { Battle } from '../types/battles.types'
import { BATTLE_LANGUAGE, BATTLE_TYPE, BATTLE_CATEGORY, BATTLE_PLAYTIME } from '../const/battles.const'

export const MOCK_BATTLES: Battle[] = [
  {
    id: 1,
    authorId: 'user-1',
    title: 'Array deduplication',
    description: 'Remove duplicates from array',

    aCode: '...',
    bCode: '...',

    language: BATTLE_LANGUAGE.TS,
    type: BATTLE_TYPE.PUBLIC,
    category: BATTLE_CATEGORY.ALGORITHM,
    playTime: BATTLE_PLAYTIME.TEN_MIN,

    isPublic: true,

    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 10),
  },
  {
    id: 2,
    authorId: 'user-2',
    title: 'Promise vs async/await',
    description: 'Which is better?',

    aCode: '...',
    bCode: '...',

    language: BATTLE_LANGUAGE.TS,
    type: BATTLE_TYPE.PRIVATE,
    category: BATTLE_CATEGORY.IMPLEMENT,
    playTime: BATTLE_PLAYTIME.THIRTY_MIN,

    isPublic: false,
    password: '123456!',

    createdAt: new Date(Date.now() - 1000 * 60 * 60),
    expiresAt: new Date(Date.now() - 1000 * 60 * 30),
  },
]
