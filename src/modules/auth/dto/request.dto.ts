import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './response.dto';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {}
