import { BadRequestException, Body, Controller, Post } from '@nestjs/common'
import { BattlesService } from './battles.service'
import type { CreateBattleRequest } from './types'

@Controller('battles')
export class BattlesController {
  constructor(private readonly battlesService: BattlesService) {}

  @Post()
  createBattle(@Body() body: CreateBattleRequest): { battleId: string } {
    const errors = this.validateCreateBattleRequest(body)

    if (errors.length) {
      throw new BadRequestException({
        message: 'Invalid battle creation payload',
        errors,
      })
    }

    const battle = this.battlesService.create(body)

    return { battleId: battle.id }
  }

  private validateCreateBattleRequest(body: CreateBattleRequest): string[] {
    const errors: string[] = []
    const { authorId, title, description, aCode, bCode, language, type, category, playTime, password } = body

    if (typeof authorId !== 'string' || authorId.trim().length === 0) {
      errors.push('authorId is required')
    }

    if (typeof title !== 'string' || title.trim().length === 0) {
      errors.push('title is required')
    }

    if (typeof description !== 'string' || description.trim().length === 0) {
      errors.push('description is required')
    }

    if (typeof aCode !== 'string' || aCode.trim().length === 0) {
      errors.push('aCode is required')
    }

    if (typeof bCode !== 'string' || bCode.trim().length === 0) {
      errors.push('bCode is required')
    }

    if (typeof language !== 'string' || language.trim().length === 0) {
      errors.push('language is required')
    }

    if (typeof type !== 'string' || type.trim().length === 0) {
      errors.push('type is required')
    }

    if (typeof category !== 'string' || category.trim().length === 0) {
      errors.push('category is required')
    }

    if (typeof playTime !== 'number' || Number.isNaN(playTime) || playTime <= 0) {
      errors.push('playTime must be a positive number')
    }

    if (password !== undefined && typeof password !== 'string') {
      errors.push('password, if provided, must be a string')
    }

    return errors
  }
}
