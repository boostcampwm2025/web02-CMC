/**
 * 타임스탬프를 상대 시간 문자열로 변환
 * @param timestamp - Unix timestamp (ms)
 * @returns 상대 시간 문자열 (예: "3분 전", "1시간 전")
 */
export const formatTime = (timestamp?: number): string => {
  if (!timestamp) return '알 수 없음';

  const now = new Date().getTime();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  return `${Math.floor(minutes / 60)}시간 전`;
};
