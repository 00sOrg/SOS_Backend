import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../../src/modules/auth/auth.service';
import { MembersService } from '../../src/modules/members/members.service';
import { Member } from '../../src/modules/members/entities';
import { CreateMemberDto } from '../../src/modules/members/dto/create-member.dto';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
    let authService: AuthService;
    let membersService: MembersService;
    let jwtService: JwtService;
    let membersRepository: Repository<Member>;
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AuthService,
          MembersService,
          JwtService,
          {
            provide: getRepositoryToken(Member),
            useClass: Repository,
          },
        ],
      }).compile();
  
      authService = module.get<AuthService>(AuthService);
      membersService = module.get<MembersService>(MembersService);  // 여기서 타입 명시
      jwtService = module.get<JwtService>(JwtService);
      membersRepository = module.get<Repository<Member>>(getRepositoryToken(Member));
    });
  
    it('should be defined', () => {
      expect(authService).toBeDefined();
    });
  
    describe('register', () => {
      it('should hash the password and create a new member', async () => {
        const createMemberDto: CreateMemberDto = {
          email: 'test@example.com',
          password: 'test1234',
          name: 'Test',
          nickname: 'Tester',
        };
  
        const hashedPassword = await bcrypt.hash(createMemberDto.password, 10);
  
        jest.spyOn(bcrypt, 'hash').mockImplementation(async () => hashedPassword);

        jest.spyOn(membersService, 'create').mockResolvedValueOnce({
          ...createMemberDto,
          password: hashedPassword,
        } as Member);
  
        const result = await authService.register(createMemberDto);
  
        expect(result.password).toEqual(hashedPassword);
        expect(membersService.create).toHaveBeenCalledWith({
          ...createMemberDto,
          password: hashedPassword,
        });
      });
    });
  
    describe('login', () => {
      it('should return a JWT token for valid credentials', async () => {
        const member = {
          id: 1,
          email: 'test@example.com',
          password: 'test1234',
        };
  
        const token = 'test-jwt-token';
  
        jest.spyOn(jwtService, 'sign').mockReturnValueOnce(token);
  
        const result = await authService.login(member);
  
        expect(result).toEqual({ access_token: token });
        expect(jwtService.sign).toHaveBeenCalledWith({
          email: member.email,
          sub: member.id,
        });
      });
    });
  });