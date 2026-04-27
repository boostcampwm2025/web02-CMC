import type { Server } from 'socket.io'
import { BattleBroadcasterAdapter } from './battleBroadcaster.adapter'
import type { BattlePhaseResponseDto, BattleRoundResponseDto } from '../../../dto/battleTurnResponse.dto'
import type { BattleUserUpdateResponseDto } from '../../../dto/battleUserUpdateResponse.dto'
import type { BattleTeamUpdateAllResponseDto } from '../../../dto/battleTeamUpdateAllResponse.dto'
import type { BattleClosedResponseDto } from '../../../dto/battleClosedResponse.dto'
import type { DiscussionVoteResultDto } from '../../../dto/discussionVoteResult.dto'

describe('BattleBroadcasterAdapter', () => {
  let adapter: BattleBroadcasterAdapter
  let mockServer: { to: jest.Mock; in: jest.Mock }
  let mockRoom: { emit: jest.Mock; disconnectSockets: jest.Mock }

  beforeEach(() => {
    mockRoom = {
      emit: jest.fn(),
      disconnectSockets: jest.fn(),
    }
    mockServer = {
      to: jest.fn().mockReturnValue(mockRoom),
      in: jest.fn().mockReturnValue(mockRoom),
    }
    adapter = new BattleBroadcasterAdapter()
    adapter.setServer(mockServer as unknown as Server)
  })

  describe('서버 미설정 시', () => {
    it('서버 없이 emit하면 에러가 발생한다', () => {
      const noServerAdapter = new BattleBroadcasterAdapter()
      const dto = { battleId: 'b1' } as BattlePhaseResponseDto
      expect(() => noServerAdapter.emitPhaseUpdated(dto)).toThrow('Socket server not initialized')
    })
  })

  describe('emitPhaseUpdated', () => {
    it('battle room에 phase:updated 이벤트를 전송한다', () => {
      const dto = { battleId: 'battle-1' } as BattlePhaseResponseDto
      const listener = jest.fn()
      adapter.on('battle:phase:updated', listener)

      adapter.emitPhaseUpdated(dto)

      expect(mockServer.to).toHaveBeenCalledWith('battle:battle-1:room:all')
      expect(mockRoom.emit).toHaveBeenCalledWith('battle:phase:updated', dto)
      expect(listener).toHaveBeenCalledWith(dto)
    })
  })

  describe('emitRoundUpdated', () => {
    it('battle room에 round:updated 이벤트를 전송한다', () => {
      const dto = { battleId: 'battle-1' } as BattleRoundResponseDto
      adapter.emitRoundUpdated(dto)
      expect(mockServer.to).toHaveBeenCalledWith('battle:battle-1:room:all')
      expect(mockRoom.emit).toHaveBeenCalledWith('battle:round:updated', dto)
    })
  })

  describe('emitUserUpdated', () => {
    it('battle room에 user:updated 이벤트를 전송한다', () => {
      const dto = { battleId: 'battle-1' } as BattleUserUpdateResponseDto
      adapter.emitUserUpdated(dto)
      expect(mockServer.to).toHaveBeenCalledWith('battle:battle-1:room:all')
      expect(mockRoom.emit).toHaveBeenCalledWith('battle:user:updated', dto)
    })
  })

  describe('emitTeamUpdated', () => {
    it('battle room에 team:updated 이벤트를 전송한다', () => {
      const dto = { battleId: 'battle-1' } as BattleTeamUpdateAllResponseDto
      adapter.emitTeamUpdated(dto)
      expect(mockServer.to).toHaveBeenCalledWith('battle:battle-1:room:all')
      expect(mockRoom.emit).toHaveBeenCalledWith('battle:team:updated', dto)
    })
  })

  describe('emitBattleClosed', () => {
    it('battle room에 closed 이벤트를 전송하고 소켓을 끊는다', () => {
      const dto = { battleId: 'battle-1' } as BattleClosedResponseDto
      adapter.emitBattleClosed(dto)

      expect(mockServer.to).toHaveBeenCalledWith('battle:battle-1:room:all')
      expect(mockRoom.emit).toHaveBeenCalledWith('battle:closed', dto)
      expect(mockServer.in).toHaveBeenCalledWith('battle:battle-1:room:all')
      expect(mockServer.in).toHaveBeenCalledWith('battle:battle-1:room:A')
      expect(mockServer.in).toHaveBeenCalledWith('battle:battle-1:room:B')
      expect(mockRoom.disconnectSockets).toHaveBeenCalledTimes(3)
    })
  })

  describe('emitPhaseSkipped', () => {
    it('battle room에 phase:skipped 이벤트를 전송한다', () => {
      const listener = jest.fn()
      adapter.on('battle:phase:skipped', listener)

      adapter.emitPhaseSkipped('battle-1')

      expect(mockServer.to).toHaveBeenCalledWith('battle:battle-1:room:all')
      expect(mockRoom.emit).toHaveBeenCalledWith('battle:phase:skipped')
      expect(listener).toHaveBeenCalledWith({ battleId: 'battle-1' })
    })
  })

  describe('emitAttacked', () => {
    it('battle room에 attacked 이벤트를 전송한다', () => {
      const dto = { battleId: 'battle-1' } as DiscussionVoteResultDto
      adapter.emitAttacked(dto)
      expect(mockServer.to).toHaveBeenCalledWith('battle:battle-1:room:all')
      expect(mockRoom.emit).toHaveBeenCalledWith('battle:attacked', dto)
    })
  })

  describe('emitDefensed', () => {
    it('battle room에 defensed 이벤트를 전송한다', () => {
      const dto = { battleId: 'battle-1' } as DiscussionVoteResultDto
      adapter.emitDefensed(dto)
      expect(mockServer.to).toHaveBeenCalledWith('battle:battle-1:room:all')
      expect(mockRoom.emit).toHaveBeenCalledWith('battle:defensed', dto)
    })
  })
})
