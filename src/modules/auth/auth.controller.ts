import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Member } from '../members/entities';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse } from '../../common/decorators/decorators.success.response';
import { ApiFailureResponse } from '../../common/decorators/decoratos.failure.response';
import { ErrorStatus } from '../../common/api/status/error.status';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'StrongPassword123!' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiSuccessResponse({ access_token: { type: 'string' } })
  @ApiFailureResponse(
    ErrorStatus.INVALID_PASSWORD,
    ErrorStatus.MEMBER_NOT_FOUND,
  )
  async login(@Request() req: Member): Promise<object> {
    return await this.authService.login(req);
  }

  @UseInterceptors(FileInterceptor('media'))
  @Post('register')
  @ApiOperation({ summary: 'Register' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'Email address',
        },
        password: {
          type: 'string',
          format: 'password',
          description: 'Password',
        },
        name: { type: 'string', description: 'Name' },
        nickname: { type: 'string', description: 'Nickname' },
        phoneNumber: { type: 'string', description: 'Phone number' },
        sex: { type: 'string', description: 'Sex' },
        birthDate: {
          type: 'string',
          format: 'date',
          description: 'Birth date',
        },
        media: {
          type: 'string',
          format: 'binary',
          description: 'Profile picture',
        },
      },
    },
  })
  @ApiSuccessResponse()
  @ApiFailureResponse(
    ErrorStatus.EMAIL_ALREADY_TAKEN,
    ErrorStatus.NICKNAME_ALREADY_TAKEN,
    ErrorStatus.S3_UPLOAD_FAILURE,
  )
  async register(
    @Body() request: CreateMemberDto,
    @UploadedFile() media: Express.Multer.File,
  ): Promise<void> {
    await this.authService.register(request, media);
  }

  @ApiOperation({ summary: 'Check email' })
  @ApiSuccessResponse()
  @ApiFailureResponse(ErrorStatus.EMAIL_ALREADY_TAKEN)
  @Get('check-email')
  async checkEmail(@Query('email') email: string): Promise<void> {
    await this.authService.checkEmail(email);
  }

  @ApiOperation({ summary: 'Check nickname' })
  @ApiSuccessResponse()
  @ApiFailureResponse(ErrorStatus.NICKNAME_ALREADY_TAKEN)
  @Get('check-nickname')
  async checkNickname(@Query('nickname') nickname: string): Promise<void> {
    await this.authService.checkNickName(nickname);
  }
}
