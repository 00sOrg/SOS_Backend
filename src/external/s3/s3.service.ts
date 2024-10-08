import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('BUCKET_REGION');
    const accessKeyId = this.configService.get<string>('BUCKET_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('BUCKET_SECRET_KEY');
    if (!region || !accessKeyId || !secretAccessKey) {
      throw new ExceptionHandler(ErrorStatus.S3_CONFIG_ERROR);
    }
    this.s3Client = new S3Client({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
  }

  async upload(file: Express.Multer.File): Promise<string> {
    const key = uuidv4() + '_' + file.originalname;
    const data = {
      Bucket: this.configService.get<string>('BUCKET_NAME'),
      Body: file.buffer,
      Key: key,
    };

    try {
      const command = new PutObjectCommand(data);
      await this.s3Client.send(command);
    } catch (error) {
      throw new ExceptionHandler(ErrorStatus.S3_UPLOAD_FAILURE);
    }

    const bucketName = this.configService.get<string>('BUCKET_NAME');
    const region = this.configService.get<string>('BUCKET_REGION');
    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  }

  async delete(key: string): Promise<void> {
    const data = {
      Bucket: this.configService.get<string>('BUCKET_NAME'),
      Key: key,
    };

    try {
      const command = new DeleteObjectCommand(data);
      await this.s3Client.send(command);
    } catch (error) {
      throw new ExceptionHandler(ErrorStatus.S3_DELETE_FAILURE);
    }
  }
}
