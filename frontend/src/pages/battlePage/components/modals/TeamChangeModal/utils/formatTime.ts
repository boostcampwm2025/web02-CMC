import { getTimeAgo } from '@/commons/utils/getTimeAgo';

/**
 * 타임스탬프를 상대 시간 문자열로 변환
 * @param timestamp - Unix timestamp (ms)
 * @returns 상대 시간 문자열 (예: "3분 전", "1시간 전")
 */
export const formatTime = (timestamp?: number): string => {
  if (!timestamp) return '알 수 없음';
  return getTimeAgo(new Date(timestamp).toISOString());
};
