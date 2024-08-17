import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { MembersRepository } from './repository/members.repository';
import { FavoritesRepository } from './repository/favorites.repository';
import { Member } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Member])],
  providers: [MembersService, MembersRepository, FavoritesRepository],
  controllers: [MembersController],
  exports: [MembersService, MembersRepository, FavoritesRepository],
})
export class MembersModule {}
