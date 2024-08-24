import { ApiProperty } from '@nestjs/swagger';

export default class ResponseDto<T> {
  @ApiProperty()
  success!: boolean;
  @ApiProperty()
  statusCode!: number;
  @ApiProperty()
  message!: string;
  @ApiProperty()
  data!: T;
}
