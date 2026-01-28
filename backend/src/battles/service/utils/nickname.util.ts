const GUEST_NICKNAME_PREFIXES = ['왕', '짱', '덜', '좀', '찐', '핵']
const GUEST_NICKNAME_ADJECTIVES = ['심심한', '귀여운', '멋진', '예민한', '까칠한', '용감한', '소심한', '즐거운', '잘생긴', '청순한', '힙한', '시크한']
const GUEST_NICKNAME_NOUNS = ['레오', '대니', '리키', '리거', '스티브', '크롱', '호눅스', '보검']

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateNickname(): string {
  const usePrefix = Math.random() < 0.3
  const prefix = usePrefix ? pick(GUEST_NICKNAME_PREFIXES) : ''
  const nickname = `${prefix} ${pick(GUEST_NICKNAME_ADJECTIVES)} ${pick(GUEST_NICKNAME_NOUNS)}`

  if (nickname.length > 8) return `${pick(GUEST_NICKNAME_ADJECTIVES)} ${pick(GUEST_NICKNAME_NOUNS)}`
  return nickname
}

// 닉네임이 비회원 닉네임 생성 패턴과 겹치는지 확인
export function isGuestNicknamePattern(nickname: string): boolean {
  // 공백이 포함되어 있으면 비회원 닉네임 패턴일 가능성 높음
  if (nickname.includes(' ')) {
    return true
  }

  // 비회원 닉네임에 사용되는 단어가 포함되어 있는지 확인
  const hasAdjective = GUEST_NICKNAME_ADJECTIVES.some(adj => nickname.includes(adj))
  const hasNoun = GUEST_NICKNAME_NOUNS.some(noun => nickname.includes(noun))

  // adjective + noun 패턴이 포함되어 있으면 비회원 닉네임으로 간주
  if (hasAdjective && hasNoun) {
    return true
  }

  return false
}

// OAuth 사용자의 초기 닉네임 패턴인지 확인
export function isInitialOAuthNickname(nickname: string): boolean {
  const trimmed = nickname.trim()
  return trimmed === '' || /^사용자 \d+$/.test(trimmed)
}
