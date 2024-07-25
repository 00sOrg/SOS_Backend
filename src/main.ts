import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createDatabase } from './config/config.typeorm';

async function bootstrap() {
  // 만약 데이터베이스 없으면 생성해주는 코드 (필요없으면 뺴도 됨)
  await createDatabase();

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
