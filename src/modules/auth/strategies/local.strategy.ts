import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ValidateMemberDto } from '../dto/validate-member.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(validateMemberDto: ValidateMemberDto): Promise<any> {
    return this.authService.validateMember(validateMemberDto);
  }
}