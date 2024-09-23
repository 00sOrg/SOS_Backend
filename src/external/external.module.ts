import { Module } from '@nestjs/common';
import { S3Service } from './s3/s3.service';
import { NaverService } from './naver/naver.service';
import { HttpModule } from '@nestjs/axios';
import { firebaseConfig } from '../config/config.firebase';
import { ConfigService } from '@nestjs/config';
import { FcmService } from './firebase/fcm.service';
import { FcmEventsHandler } from './firebase/fcm-events.handler';

@Module({
  imports: [HttpModule],
  providers: [
    NaverService,
    S3Service,
    FcmService,
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: () => {
        return firebaseConfig();
      },
      inject: [ConfigService],
    },
    FcmEventsHandler,
  ],
  exports: [NaverService, S3Service, FcmService],
})
export class ExternalModule {}
