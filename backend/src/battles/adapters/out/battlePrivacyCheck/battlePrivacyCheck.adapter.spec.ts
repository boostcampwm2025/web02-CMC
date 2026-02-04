/* eslint-disable @typescript-eslint/unbound-method */
import { BattlePrivacyCheckAdapter } from './battlePrivacyCheck.adapter'
import type { PrismaService } from '../../../../prisma/prisma.service'

describe('BattlePrivacyCheckAdapter', () => {
  let adapter: BattlePrivacyCheckAdapter
  let prisma: jest.Mocked<PrismaService>

  beforeEach(() => {
    prisma = {
      battle: {
        findUnique: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>
    adapter = new BattlePrivacyCheckAdapter(prisma)
  })

  describe('isPrivateBattle', () => {
    it('비공개 배틀이면 true를 반환한다', async () => {
      ;(prisma.battle.findUnique as jest.Mock).mockResolvedValue({ isPrivate: true })
      const result = await adapter.isPrivateBattle('battle-1')
      expect(result).toBe(true)
      expect(prisma.battle.findUnique).toHaveBeenCalledWith({
        where: { id: 'battle-1' },
        select: { isPrivate: true },
      })
    })

    it('공개 배틀이면 false를 반환한다', async () => {
      ;(prisma.battle.findUnique as jest.Mock).mockResolvedValue({ isPrivate: false })
      const result = await adapter.isPrivateBattle('battle-1')
      expect(result).toBe(false)
    })

    it('배틀이 없으면 false를 반환한다', async () => {
      ;(prisma.battle.findUnique as jest.Mock).mockResolvedValue(null)
      const result = await adapter.isPrivateBattle('nonexistent')
      expect(result).toBe(false)
    })
  })
})
