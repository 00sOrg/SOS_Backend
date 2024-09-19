import { forwardRef, Module } from '@nestjs/common';
import { MembersService } from './services/members.service';
import { FavoritesService } from './services/favorites.service';
import { MembersController } from './members.controller';
import { MembersRepository } from './repository/members.repository';
import { FavoritesRepository } from './repository/favorites.repository';
import { LocationService } from './services/location.service';
import { ExternalModule } from 'src/external/external.module';
import { MembersDetailRepository } from './repository/membersDetail.repository';
import { NotificationModule } from '../alarm/notification.module';

@Module({
  imports: [
    ExternalModule,
    forwardRef(() => NotificationModule), // forwardRef로 수정
  ],
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
