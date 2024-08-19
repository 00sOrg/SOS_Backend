import { HttpException } from '@nestjs/common';
import { BaseCode } from '../../api/base.api';

export class ExceptionHandler extends HttpException {
  private readonly baseCode: BaseCode;

  constructor(baseCode: BaseCode) {
    super(baseCode.message, baseCode.statusCode);
    this.baseCode = baseCode;
  }

  getErrorReason(): BaseCode {
    return this.baseCode;
  }
}
