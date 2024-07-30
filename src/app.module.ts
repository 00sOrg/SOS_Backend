import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeOrmConfig from './config/config.typeorm';
import { EventsModule } from './modules/events/events.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    EventsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
