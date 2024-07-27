import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ErrorStatus } from './common/api/status/error.status';
import { ExceptionHandler } from './common/filters/exception/exception.handler';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
