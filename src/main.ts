import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createDatabase } from './config/config.typeorm';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { GeneralFilter } from './common/filters/filters.general';


async function bootstrap() {
  // 만약 데이터베이스 없으면 생성해주는 코드 (필요없으면 뺴도 됨)
  await createDatabase();

  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new GeneralFilter());
  await app.listen(3000);
}
bootstrap();
