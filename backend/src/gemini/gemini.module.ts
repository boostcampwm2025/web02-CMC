import { Module, Global } from '@nestjs/common'
import { GeminiService } from './gemini.service'

@Global()
@Module({
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}
