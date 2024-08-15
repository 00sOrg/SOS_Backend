import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeOrmConfig from './config/config.typeorm';
import { EventsModule } from './modules/events/events.module';
import { AuthModule } from './modules/auth/auth.module';
import { MembersModule } from './modules/members/members.module';
import { ExternalModule } from './external/external.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    EventsModule,
    AuthModule,
    MembersModule,
    ExternalModule,
  ],
})
export class AppModule {}
