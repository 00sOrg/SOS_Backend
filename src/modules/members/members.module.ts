import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersService } from './services/members.service';
import { FavoritesService } from './services/favorites.service';
import { MembersController } from './members.controller';
import { MembersRepository } from './repository/members.repository';
import { FavoritesRepository } from './repository/favorites.repository';
import { Member } from './entities';
import { LocationService } from './services/location.service';
import { ExternalModule } from 'src/external/external.module';
import { MembersDetailRepository } from './repository/membersDetail.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Member]), ExternalModule],
  providers: [
    MembersService,
    MembersRepository,
    FavoritesRepository,
    MembersDetailRepository,
    FavoritesService,
    LocationService,
  ],
  controllers: [MembersController],
  exports: [
    MembersService,
    MembersRepository,
    FavoritesRepository,
    MembersDetailRepository,
    FavoritesService,
    LocationService,
  ],
})
export class MembersModule {}
