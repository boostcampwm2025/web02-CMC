import { AuthService } from './auth.service'

describe('AuthService', () => {
  let service: AuthService

  beforeEach(() => {
    service = new AuthService()
  })

  describe('createGuest', () => {
    it('닉네임으로 Guest를 생성한다', () => {
      const nickname = 'testUser'
      const guest = service.createGuest(nickname)

      expect(guest).toBeDefined()
      expect(guest.nickname).toBe(nickname)
      expect(guest.id).toBeDefined()
      expect(guest.createdAt).toBeDefined()
      expect(typeof guest.id).toBe('string')
      expect(typeof guest.createdAt).toBe('number')
    })

    it('각 Guest마다 고유한 clientId를 생성한다', () => {
      const guest1 = service.createGuest('user1')
      const guest2 = service.createGuest('user2')

      expect(guest1.id).not.toBe(guest2.id)
    })
  })
})
