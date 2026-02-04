export interface BattlePrivacyCheckPort {
  isPrivateBattle(battleId: string): Promise<boolean>
}
