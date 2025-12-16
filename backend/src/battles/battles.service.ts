import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { JoinBattleDto } from './dto/join-battle.dto'

@Injectable()
export class BattlesService {
  constructor() {}

  joinBattle(joinBattleDto: JoinBattleDto) {
    // async joinBattle(dto: JoinBattleDto, socketId: string, userId: string) {
    const { battleId, password } = joinBattleDto

    if (!battleId) {
      throw new BadRequestException('Battle ID가 필요합니다.')
    }

    // TODO: DB에서 해당 배틀 존재 여부 검사
    // const battle = await this.prisma.battle.findUnique({
    //   where: { id: battleId },
    // })

    const battle = {
      battleId: 'battleId',
      authorId: 'user-1',
      title: '배틀 제목',
      description: '배틀 설명',
      status: 'OPEN',
      aCode: 'code-a',
      bCode: 'code-b',
      language: 'typescript',
      type: 'PRIVATE',
      password: 'password1',
      category: '성능',
      playTime: 10,
    }

    if (!battle) {
      throw new NotFoundException('존재하지 않는 배틀입니다.')
    }

    if (battle.type === 'PRIVATE' && battle.password) {
      // TODO: 비밀번호 검사
      // const isValid = await this.bcryptService.compare(password, battle.password)
      const isValid = battle.password === password
      if (!isValid) {
        throw new UnauthorizedException('잘못된 비밀번호입니다.')
      }
    }

    if (battle.status === 'CLOSED') {
      throw new BadRequestException('이미 종료된 배틀입니다.')
    }

    // TODO: Redis에 해당 배틀에 참여한 클라이언트 저장
    // await this.redisService.addParticipant(battleId, { clientId, team })

    // TODO: Redis에서 현재 배틀 진행 현황을 조회
    const battleState = this.getBattleState(battleId)

    return { battleState }
  }

  getBattleState(battleId: string) {
    // Redis에서 실시간 데이터 조회
    // const votes = await this.redisService.getVotes(battleId)
    // const attacks = await this.redisService.getAttacks(battleId)
    // const defenses = await this.redisService.getDefenses(battleId)
    // const chats = await this.redisService.getChats(battleId)

    // // DB에서 배틀 기본 정보
    // const battle = await this.prisma.battle.findUnique({
    //   where: { id: battleId },
    // })

    return {
      battleId,
      votes: [{ aTeam: 40, bTeam: 60 }],
      attacks: [
        {
          id: 'attack-1',
          attacker: 'A',
          authorId: '1',
          content: '구현 A의 Set 사용이 더 효율적입니다. O(1) 시간 복잡도를 보장합니다.',
          likes: 15,
        },
        {
          id: 'attack-2',
          attacker: 'B',
          authorId: '2',
          content: '구현 B는 filter를 사용해 가독성이 더 좋습니다.',
          likes: 10,
        },
      ],
      defenses: [
        {
          id: 'defense-1',
          attackId: 'attack-1',
          defenser: 'B',
          authorId: '3',
          content: 'Set은 순서를 보장하지 않습니다. 구현 B의 filter 방식이 더 안전합니다.',
          likes: 12,
        },
        {
          id: 'defense-2',
          attackId: 'attack-2',
          defenser: 'A',
          authorId: '4',
          content: 'filter는 O(n) 복잡도입니다. 대용량 데이터에서 Set이 압도적으로 빠릅니다.',
          likes: 18,
        },
        {
          id: 'defense-3',
          attackId: 'attack-1', // attack-1에 대한 또 다른 반박
          defenser: 'B',
          authorId: '5',
          content: 'Set의 메모리 사용량도 고려해야 합니다. 작은 배열에서는 오히려 비효율적입니다.',
          likes: 8,
        },
      ],
      chats: [
        { authorId: '1', content: 'hi' },
        { authorId: '2', content: 'hi2' },
        { authorId: '3', content: 'hi3' },
      ],
    }
  }
}
