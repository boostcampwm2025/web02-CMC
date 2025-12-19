import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: process.env.FRONTEND_URL
      ? [process.env.FRONTEND_URL]
      : ['http://localhost:5173', 'http://localhost', 'http://127.0.0.1:5173', 'http://127.0.0.1'],
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )
  await app.listen(process.env.PORT ?? 3000)
}
void bootstrap()
