import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { MembersRepository } from './members.repository';
import { Member } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Member])],
  providers: [MembersService, MembersRepository],
  controllers: [MembersController],
  exports: [MembersService, MembersRepository],
})
export class MembersModule {}

