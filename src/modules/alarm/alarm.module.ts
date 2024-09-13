import { Module } from '@nestjs/common';
import { AlarmController } from './alarm.controller';
import { AlarmService } from './alarm.service';
import { MembersModule } from '../members/members.module';
import { ExternalModule } from '../../external/external.module';
import { AlarmRepository } from './alarm.repository';

@Module({
  imports: [MembersModule, ExternalModule],
  controllers: [AlarmController],
  providers: [AlarmService, AlarmRepository],
})
export class AlarmModule {}
