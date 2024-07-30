import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      console.error('사용자 인증 실패:', err || info.message);
      throw err || new UnauthorizedException(info.message);
    }

    // 사용자 세션 로깅
    console.log('사용자 인증 성공:', user.email);

    return user;
  }
}