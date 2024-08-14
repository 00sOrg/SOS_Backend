import { Module } from "@nestjs/common";
import { S3Service } from "./s3/s3.service";
import { NaverService } from "./naver/naver.service";
import { HttpModule } from "@nestjs/axios";

@Module({
    imports: [HttpModule],
    providers: [NaverService, S3Service],
    exports: [NaverService, S3Service],
})
export class ExternalModule{}
