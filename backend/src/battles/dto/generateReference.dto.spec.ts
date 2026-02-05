import { validate } from 'class-validator'
import { GenerateReferenceRequestDto, GenerateReferenceResponseDto } from './generateReference.dto'
import { BattleReferenceData } from '../domains/models/types/ai.types'

describe('GenerateReferenceRequestDto', () => {
  const createValidDto = (): GenerateReferenceRequestDto => {
    const dto = new GenerateReferenceRequestDto()
    dto.title = 'Test Battle'
    dto.description = 'Test Description'
    dto.codeA = 'const a = 1;'
    dto.codeB = 'const b = 2;'
    dto.language = 'TS'
    dto.category = 'ALGORITHM'
    return dto
  }

  describe('유효성 검사', () => {
    it('유효한 DTO는 검증을 통과해야 한다', async () => {
      const dto = createValidDto()
      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    it('title이 없으면 검증에 실패해야 한다', async () => {
      const dto = createValidDto()
      dto.title = ''
      const errors = await validate(dto)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0].property).toBe('title')
    })

    it('description이 없으면 검증에 실패해야 한다', async () => {
      const dto = createValidDto()
      dto.description = ''
      const errors = await validate(dto)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0].property).toBe('description')
    })

    it('codeA가 없으면 검증에 실패해야 한다', async () => {
      const dto = createValidDto()
      dto.codeA = ''
      const errors = await validate(dto)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0].property).toBe('codeA')
    })

    it('codeB가 없으면 검증에 실패해야 한다', async () => {
      const dto = createValidDto()
      dto.codeB = ''
      const errors = await validate(dto)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0].property).toBe('codeB')
    })

    it('language가 없으면 검증에 실패해야 한다', async () => {
      const dto = createValidDto()
      dto.language = '' as any
      const errors = await validate(dto)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0].property).toBe('language')
    })

    it('category가 없으면 검증에 실패해야 한다', async () => {
      const dto = createValidDto()
      dto.category = '' as any
      const errors = await validate(dto)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0].property).toBe('category')
    })

    it('topics가 없어도 검증을 통과해야 한다 (optional)', async () => {
      const dto = createValidDto()
      // topics를 설정하지 않음
      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    it('topics가 문자열 배열이면 검증을 통과해야 한다', async () => {
      const dto = createValidDto()
      dto.topics = ['topic1', 'topic2']
      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    it('topics가 빈 배열이면 검증을 통과해야 한다', async () => {
      const dto = createValidDto()
      dto.topics = []
      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })
  })

  describe('언어 타입 검사', () => {
    it('TS 언어를 허용해야 한다', async () => {
      const dto = createValidDto()
      dto.language = 'TS'
      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    it('JS 언어를 허용해야 한다', async () => {
      const dto = createValidDto()
      dto.language = 'JS'
      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    it('PYTHON 언어를 허용해야 한다', async () => {
      const dto = createValidDto()
      dto.language = 'PYTHON'
      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })
  })

  describe('카테고리 타입 검사', () => {
    it('ALGORITHM 카테고리를 허용해야 한다', async () => {
      const dto = createValidDto()
      dto.category = 'ALGORITHM'
      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    it('REFACTORING 카테고리를 허용해야 한다', async () => {
      const dto = createValidDto()
      dto.category = 'REFACTORING'
      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })
  })
})

describe('GenerateReferenceResponseDto', () => {
  const mockReferenceData: BattleReferenceData = {
    commonConcepts: {
      terms: [
        { term: 'Term1', description: 'Description1' },
        { term: 'Term2', description: 'Description2' },
      ],
      summary: 'Common concepts summary',
    },
    teamA: {
      perspective: 'Team A perspective',
      references: [
        { title: 'Ref A1', url: 'https://example.com/a1', summary: 'Summary A1' },
        { title: 'Ref A2', url: 'https://example.com/a2', summary: 'Summary A2' },
      ],
    },
    teamB: {
      perspective: 'Team B perspective',
      references: [{ title: 'Ref B1', url: 'https://example.com/b1', summary: 'Summary B1' }],
    },
  }

  describe('of', () => {
    it('commonConcepts를 올바르게 매핑해야 한다', () => {
      const dto = GenerateReferenceResponseDto.of(mockReferenceData)

      expect(dto.commonConcepts).toEqual(mockReferenceData.commonConcepts)
      expect(dto.commonConcepts.terms).toHaveLength(2)
      expect(dto.commonConcepts.summary).toBe('Common concepts summary')
    })

    it('teamA 데이터를 올바르게 매핑해야 한다', () => {
      const dto = GenerateReferenceResponseDto.of(mockReferenceData)

      expect(dto.teamA).toEqual(mockReferenceData.teamA)
      expect(dto.teamA.perspective).toBe('Team A perspective')
      expect(dto.teamA.references).toHaveLength(2)
    })

    it('teamB 데이터를 올바르게 매핑해야 한다', () => {
      const dto = GenerateReferenceResponseDto.of(mockReferenceData)

      expect(dto.teamB).toEqual(mockReferenceData.teamB)
      expect(dto.teamB.perspective).toBe('Team B perspective')
      expect(dto.teamB.references).toHaveLength(1)
    })

    it('빈 terms 배열을 처리해야 한다', () => {
      const emptyTermsData: BattleReferenceData = {
        ...mockReferenceData,
        commonConcepts: {
          terms: [],
          summary: 'Empty terms',
        },
      }

      const dto = GenerateReferenceResponseDto.of(emptyTermsData)

      expect(dto.commonConcepts.terms).toHaveLength(0)
    })

    it('빈 references 배열을 처리해야 한다', () => {
      const emptyRefsData: BattleReferenceData = {
        ...mockReferenceData,
        teamA: {
          perspective: 'No refs',
          references: [],
        },
      }

      const dto = GenerateReferenceResponseDto.of(emptyRefsData)

      expect(dto.teamA.references).toHaveLength(0)
    })

    it('모든 필드가 독립적으로 설정되어야 한다', () => {
      const dto = GenerateReferenceResponseDto.of(mockReferenceData)

      // DTO가 원본 데이터와 같은 참조인지 확인
      expect(dto.commonConcepts).toBe(mockReferenceData.commonConcepts)
      expect(dto.teamA).toBe(mockReferenceData.teamA)
      expect(dto.teamB).toBe(mockReferenceData.teamB)
    })
  })
})
