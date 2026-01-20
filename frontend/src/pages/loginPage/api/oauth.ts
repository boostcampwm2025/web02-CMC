export async function loginWithGitHub(): Promise<void> {
  window.location.href = '/api/auth/github';
}

export async function loginWithKakao(): Promise<void> {
  window.location.href = '/api/auth/kakao';
}
