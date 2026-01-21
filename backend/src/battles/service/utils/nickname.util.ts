export function generateNickname(): string {
  const prefixes = ['왕', '짱', '덜', '좀', '찐', '핵']
  const adjectives = ['심심한', '귀여운', '멋진', '예민한', '까칠한', '용감한', '소심한', '즐거운', '잘생긴', '청순한', '힙한', '시크한']
  const nouns = ['레오', '대니', '리키', '리거', '스티브', '크롱', '호눅스', '보검']

  const usePrefix = Math.random() < 0.3
  const prefix = usePrefix ? pick(prefixes) : ''
  const nickname = `${prefix} ${pick(adjectives)} ${pick(nouns)}`

  if (nickname.length > 8) return `${pick(adjectives)} ${pick(nouns)}`
  return nickname
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
