export interface BattleResultMock {
  battleId: string
  title: string
  description: string
  status: 'OPEN' | 'CLOSED'
  language: string
  category: string
  playTime: number
  createdAt: string
  finishedAt: string

  codeA: string
  codeB: string

  result: {
    winner: 'A' | 'B' | 'DRAW'
    teamA: { votes: number; percentage: number }
    teamB: { votes: number; percentage: number }
    neutral: { votes: number; percentage: number }
  }

  metrics: {
    totalParticipants: number
    totalViews: number
    strategiesCount: number
  }

  voteTimeline: Array<{
    turn: number
    teamAVotes: number
    teamBVotes: number
    neutralVotes: number
    timestamp: string
  }>

  timeline: Array<{
    id: string
    type: 'ATTACK' | 'DEFENSE'
    author: { id: string; nickname: string }
    team: 'A' | 'B'
    content: string
    turn: number
    upvotes: number
    createdAt: string
  }>

  mvp: {
    userId: string
    nickname: string
    team: 'A' | 'B'
    totalVotes: number
  }
}

export const mockBattleResults: Record<string, BattleResultMock> = {
  'battle-1': {
    battleId: 'battle-1',
    title: '배열 정렬 최적화 배틀',
    description: '퀵소트 vs 머지소트, 어떤 정렬 알고리즘이 더 효율적일까?',
    status: 'CLOSED',
    language: 'javascript',
    category: '성능',
    playTime: 30,
    createdAt: '2025-12-15T10:00:00Z',
    finishedAt: '2025-12-15T10:30:00Z',

    codeA: `function quickSort(arr) {
  if (arr.length <= 1) return arr
  const pivot = arr[Math.floor(arr.length / 2)]
  const left = arr.filter(x => x < pivot)
  const middle = arr.filter(x => x === pivot)
  const right = arr.filter(x => x > pivot)
  return [...quickSort(left), ...middle, ...quickSort(right)]
}`,

    codeB: `function mergeSort(arr) {
  if (arr.length <= 1) return arr
  const mid = Math.floor(arr.length / 2)
  const left = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid))
  return merge(left, right)
}

function merge(left, right) {
  const result = []
  let i = 0, j = 0
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++])
    else result.push(right[j++])
  }
  return [...result, ...left.slice(i), ...right.slice(j)]
}`,

    result: {
      winner: 'A',
      teamA: { votes: 44, percentage: 44 },
      teamB: { votes: 40, percentage: 40 },
      neutral: { votes: 16, percentage: 16 },
    },

    metrics: {
      totalParticipants: 100,
      totalViews: 1247,
      strategiesCount: 12,
    },

    voteTimeline: [
      { turn: 1, teamAVotes: 10, teamBVotes: 8, neutralVotes: 2, timestamp: '2025-12-15T10:10:00Z' },
      { turn: 2, teamAVotes: 25, teamBVotes: 18, neutralVotes: 7, timestamp: '2025-12-15T10:20:00Z' },
      { turn: 3, teamAVotes: 44, teamBVotes: 40, neutralVotes: 16, timestamp: '2025-12-15T10:30:00Z' },
    ],

    timeline: [
      {
        id: 'attack-1',
        type: 'ATTACK',
        author: { id: 'user-1', nickname: 'CodeMaster' },
        team: 'A',
        content: '퀵소트는 평균 O(n log n)으로 대부분의 경우 더 빠릅니다!',
        turn: 1,
        upvotes: 15,
        createdAt: '2025-12-15T10:05:00Z',
      },
      {
        id: 'defense-1',
        type: 'DEFENSE',
        author: { id: 'user-2', nickname: 'AlgoExpert' },
        team: 'B',
        content: '하지만 최악의 경우 O(n²)이 될 수 있어요. 머지소트는 항상 O(n log n)을 보장합니다.',
        turn: 1,
        upvotes: 12,
        createdAt: '2025-12-15T10:06:00Z',
      },
      {
        id: 'attack-2',
        type: 'ATTACK',
        author: { id: 'user-1', nickname: 'CodeMaster' },
        team: 'A',
        content: '실제 데이터에서는 퀵소트가 캐시 효율성이 더 좋습니다.',
        turn: 2,
        upvotes: 10,
        createdAt: '2025-12-15T10:15:00Z',
      },
      {
        id: 'defense-2',
        type: 'DEFENSE',
        author: { id: 'user-3', nickname: 'PerformanceGuru' },
        team: 'B',
        content: '머지소트는 안정 정렬이라 순서가 중요한 경우 필수입니다.',
        turn: 2,
        upvotes: 8,
        createdAt: '2025-12-15T10:16:00Z',
      },
    ],

    mvp: {
      userId: 'user-1',
      nickname: 'CodeMaster',
      team: 'A',
      totalVotes: 25,
    },
  },

  'battle-2': {
    battleId: 'battle-2',
    title: 'React 상태 관리 배틀',
    description: 'useState vs useReducer, 복잡한 상태 관리에 더 적합한 것은?',
    status: 'CLOSED',
    language: 'typescript',
    category: '가독성',
    playTime: 30,
    createdAt: '2025-12-14T14:00:00Z',
    finishedAt: '2025-12-14T14:30:00Z',

    codeA: `const [user, setUser] = useState({
  name: '',
  age: 0,
  email: ''
})

const updateName = (name: string) => setUser({ ...user, name })
const updateAge = (age: number) => setUser({ ...user, age })
const updateEmail = (email: string) => setUser({ ...user, email })`,

    codeB: `type Action =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_AGE'; payload: number }
  | { type: 'SET_EMAIL'; payload: string }

const userReducer = (state: User, action: Action) => {
  switch (action.type) {
    case 'SET_NAME': return { ...state, name: action.payload }
    case 'SET_AGE': return { ...state, age: action.payload }
    case 'SET_EMAIL': return { ...state, email: action.payload }
    default: return state
  }
}

const [user, dispatch] = useReducer(userReducer, initialUser)`,

    result: {
      winner: 'B',
      teamA: { votes: 38, percentage: 38 },
      teamB: { votes: 52, percentage: 52 },
      neutral: { votes: 10, percentage: 10 },
    },

    metrics: {
      totalParticipants: 100,
      totalViews: 892,
      strategiesCount: 15,
    },

    voteTimeline: [
      { turn: 1, teamAVotes: 12, teamBVotes: 15, neutralVotes: 3, timestamp: '2025-12-14T14:10:00Z' },
      { turn: 2, teamAVotes: 25, teamBVotes: 35, neutralVotes: 8, timestamp: '2025-12-14T14:20:00Z' },
      { turn: 3, teamAVotes: 38, teamBVotes: 52, neutralVotes: 10, timestamp: '2025-12-14T14:30:00Z' },
    ],

    timeline: [
      {
        id: 'attack-3',
        type: 'ATTACK',
        author: { id: 'user-4', nickname: 'AlgoWizard' },
        team: 'B',
        content: 'useReducer는 타입 안전성이 뛰어나고 상태 변경 로직이 명확합니다.',
        turn: 1,
        upvotes: 18,
        createdAt: '2025-12-14T14:05:00Z',
      },
      {
        id: 'defense-3',
        type: 'DEFENSE',
        author: { id: 'user-5', nickname: 'ReactNinja' },
        team: 'A',
        content: 'useState가 더 간단하고 직관적이에요. 모든 경우에 useReducer가 필요한 건 아닙니다.',
        turn: 1,
        upvotes: 10,
        createdAt: '2025-12-14T14:06:00Z',
      },
      {
        id: 'attack-4',
        type: 'ATTACK',
        author: { id: 'user-4', nickname: 'AlgoWizard' },
        team: 'B',
        content: '복잡한 상태 로직에서는 useReducer가 테스트하기 훨씬 쉽습니다.',
        turn: 2,
        upvotes: 13,
        createdAt: '2025-12-14T14:15:00Z',
      },
      {
        id: 'defense-4',
        type: 'DEFENSE',
        author: { id: 'user-6', nickname: 'HookMaster' },
        team: 'A',
        content: '하지만 보일러플레이트 코드가 너무 많아집니다.',
        turn: 2,
        upvotes: 7,
        createdAt: '2025-12-14T14:16:00Z',
      },
    ],

    mvp: {
      userId: 'user-4',
      nickname: 'AlgoWizard',
      team: 'B',
      totalVotes: 31,
    },
  },

  'battle-3': {
    battleId: 'battle-3',
    title: 'CSS 레이아웃 배틀',
    description: 'Flexbox vs Grid, 현대적인 레이아웃에 더 적합한 것은?',
    status: 'CLOSED',
    language: 'css',
    category: '스타일',
    playTime: 30,
    createdAt: '2025-12-13T16:00:00Z',
    finishedAt: '2025-12-13T16:30:00Z',

    codeA: `.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.item {
  flex: 1 1 300px;
}`,

    codeB: `.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  align-items: center;
}`,

    result: {
      winner: 'DRAW',
      teamA: { votes: 45, percentage: 45 },
      teamB: { votes: 45, percentage: 45 },
      neutral: { votes: 10, percentage: 10 },
    },

    metrics: {
      totalParticipants: 100,
      totalViews: 523,
      strategiesCount: 8,
    },

    voteTimeline: [
      { turn: 1, teamAVotes: 15, teamBVotes: 14, neutralVotes: 3, timestamp: '2025-12-13T16:10:00Z' },
      { turn: 2, teamAVotes: 30, teamBVotes: 31, neutralVotes: 7, timestamp: '2025-12-13T16:20:00Z' },
      { turn: 3, teamAVotes: 45, teamBVotes: 45, neutralVotes: 10, timestamp: '2025-12-13T16:30:00Z' },
    ],

    timeline: [
      {
        id: 'attack-5',
        type: 'ATTACK',
        author: { id: 'user-7', nickname: 'RefactorKing' },
        team: 'A',
        content: 'Flexbox는 1차원 레이아웃에 최적화되어 있고 브라우저 지원도 안정적입니다.',
        turn: 1,
        upvotes: 11,
        createdAt: '2025-12-13T16:05:00Z',
      },
      {
        id: 'defense-5',
        type: 'DEFENSE',
        author: { id: 'user-8', nickname: 'CSSGuru' },
        team: 'B',
        content: 'Grid는 2차원 레이아웃을 한번에 처리할 수 있어서 더 강력합니다.',
        turn: 1,
        upvotes: 9,
        createdAt: '2025-12-13T16:06:00Z',
      },
      {
        id: 'attack-6',
        type: 'ATTACK',
        author: { id: 'user-7', nickname: 'RefactorKing' },
        team: 'A',
        content: 'auto-fit과 minmax는 Grid에서도 가능하지만 Flexbox가 더 직관적입니다.',
        turn: 2,
        upvotes: 7,
        createdAt: '2025-12-13T16:15:00Z',
      },
      {
        id: 'defense-6',
        type: 'DEFENSE',
        author: { id: 'user-9', nickname: 'LayoutMaster' },
        team: 'B',
        content: 'Grid의 grid-template-areas는 시맨틱한 레이아웃 정의가 가능합니다.',
        turn: 2,
        upvotes: 6,
        createdAt: '2025-12-13T16:16:00Z',
      },
    ],

    mvp: {
      userId: 'user-7',
      nickname: 'RefactorKing',
      team: 'A',
      totalVotes: 18,
    },
  },

  'battle-open-1': {
    battleId: 'battle-open-1',
    title: '진행 중인 배틀',
    description: '아직 진행 중인 배틀입니다.',
    status: 'OPEN',
    language: 'javascript',
    category: '성능',
    playTime: 30,
    createdAt: '2025-12-16T10:00:00Z',
    finishedAt: '',

    codeA: 'console.log("Team A")',
    codeB: 'console.log("Team B")',

    result: {
      winner: 'DRAW',
      teamA: { votes: 0, percentage: 0 },
      teamB: { votes: 0, percentage: 0 },
      neutral: { votes: 0, percentage: 0 },
    },

    metrics: {
      totalParticipants: 0,
      totalViews: 0,
      strategiesCount: 0,
    },

    voteTimeline: [],
    timeline: [],

    mvp: {
      userId: '',
      nickname: '',
      team: 'A',
      totalVotes: 0,
    },
  },
}
