import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersService } from './services/members.service';
import { MembersController } from './members.controller';
import { MembersRepository } from './repository/members.repository';
import { FavoritesRepository } from './repository/favorites.repository';
import { Member } from './entities';
import { LocationService } from './services/location.service';

@Module({
  imports: [TypeOrmModule.forFeature([Member])],
  providers: [MembersService, MembersRepository, FavoritesRepository, LocationService],
  controllers: [MembersController],
  exports: [MembersService, MembersRepository, FavoritesRepository, LocationService],
})
export class MembersModule {}