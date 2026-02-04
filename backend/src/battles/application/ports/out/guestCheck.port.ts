export interface GuestCheckPort {
  //닉네임 중복 체크
  isNicknameExists(nickname: string): Promise<boolean>
}
