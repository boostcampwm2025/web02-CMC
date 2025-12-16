import { Battle } from '../types/battles.types'
import { BATTLE_LANGUAGE, BATTLE_TYPE, BATTLE_CATEGORY, BATTLE_PLAYTIME, BATTLE_STATUS } from '../const/battles.const'

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

    status: BATTLE_STATUS.OPEN,
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

    status: BATTLE_STATUS.OPEN,
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
    expiresAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 3,
    authorId: 'user-3',
    title: 'Loop optimization',
    description: 'for vs while performance',

    aCode: '...',
    bCode: '...',

    language: BATTLE_LANGUAGE.JS,
    type: BATTLE_TYPE.PUBLIC,
    category: BATTLE_CATEGORY.REFACTORING,
    playTime: BATTLE_PLAYTIME.FIVE_MIN,

    isPublic: true,

    status: BATTLE_STATUS.CLOSED,
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
    expiresAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 4,
    authorId: 'user-4',
    title: 'Readable conditionals',
    description: 'Clean if-else patterns',

    aCode: '...',
    bCode: '...',

    language: BATTLE_LANGUAGE.TS,
    type: BATTLE_TYPE.PUBLIC,
    category: BATTLE_CATEGORY.ALGORITHM,
    playTime: BATTLE_PLAYTIME.TEN_MIN,

    isPublic: true,

    status: BATTLE_STATUS.CLOSED,
    createdAt: new Date(Date.now() - 1000 * 60 * 120),
    expiresAt: new Date(Date.now() - 1000 * 60 * 90),
  },
  {
    id: 5,
    authorId: 'user-5',
    title: 'Private refactor battle',
    description: 'Password protected battle',

    aCode: '...',
    bCode: '...',

    language: BATTLE_LANGUAGE.TS,
    type: BATTLE_TYPE.PRIVATE,
    category: BATTLE_CATEGORY.ETC,
    playTime: BATTLE_PLAYTIME.THIRTY_MIN,

    isPublic: false,
    password: 'secret!',

    status: BATTLE_STATUS.OPEN,
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
    expiresAt: new Date(Date.now() + 1000 * 60 * 20),
  },
  {
    id: 6,
    authorId: 'user-6',
    title: 'Hidden algorithm test',
    description: 'Private algorithm challenge',

    aCode: '...',
    bCode: '...',

    language: BATTLE_LANGUAGE.PYTHON,
    type: BATTLE_TYPE.PRIVATE,
    category: BATTLE_CATEGORY.ALGORITHM,
    playTime: BATTLE_PLAYTIME.FIVE_MIN,

    isPublic: false,
    password: 'hidden123',

    status: BATTLE_STATUS.CLOSED,
    createdAt: new Date(Date.now() - 1000 * 60 * 200),
    expiresAt: new Date(Date.now() - 1000 * 60 * 180),
  },
  {
    id: 7,
    authorId: 'user-7',
    title: 'Expired open battle',
    description: 'Should be treated as closed',

    aCode: '...',
    bCode: '...',

    language: BATTLE_LANGUAGE.JS,
    type: BATTLE_TYPE.PUBLIC,
    category: BATTLE_CATEGORY.REFACTORING,
    playTime: BATTLE_PLAYTIME.FIVE_MIN,

    isPublic: true,

    status: BATTLE_STATUS.OPEN,
    createdAt: new Date(Date.now() - 1000 * 60 * 40),
    expiresAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: 8,
    authorId: 'user-8',
    title: 'Functional vs OOP',
    description: 'Paradigm discussion',

    aCode: '...',
    bCode: '...',

    language: BATTLE_LANGUAGE.TS,
    type: BATTLE_TYPE.PUBLIC,
    category: BATTLE_CATEGORY.IMPLEMENT,
    playTime: BATTLE_PLAYTIME.TEN_MIN,

    isPublic: true,

    status: BATTLE_STATUS.OPEN,
    createdAt: new Date(Date.now() - 1000 * 60 * 1),
    expiresAt: new Date(Date.now() + 1000 * 60 * 9),
  },
]
