import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { AuthService } from 'src/modules/auth/auth.service';
import { MembersService } from 'src/modules/members/members.service';
import { Member } from 'src/modules/members/entities/member.entity';
import { CreateMemberDto } from 'src/modules/auth/dto/create-member.dto';
import { ValidateMemberDto } from 'src/modules/auth/dto/validate-member.dto';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';

describe('AuthService', () => {
  let authService: AuthService;
  let membersService: MembersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: MembersService,
          useValue: {
            findOneByEmail: jest.fn(),
            findOneByNickname: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    membersService = module.get<MembersService>(MembersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateMember', () => {
    it('should validate and return the member for valid credentials', async () => {
      const validateMemberDto: ValidateMemberDto = {
        email: 'test@example.com',
        password: 'test1234',
      };

      const member: Member = {
        email: 'test@example.com',
        password: await bcrypt.hash('test1234', 10), // Hashed password
        name: 'Test',
        nickname: 'Tester',
      } as Member;

      jest.spyOn(membersService, 'findOneByEmail').mockResolvedValueOnce(member);
      // /jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

      const result = await authService.validateMember(validateMemberDto);
      expect(result).toEqual(member);
    });

    it('should throw an exception for invalid credentials', async () => {
      const validateMemberDto: ValidateMemberDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const member: Member = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('test1234', 10),
        name: 'Test',
        nickname: 'Tester',
      } as Member;

      jest.spyOn(membersService, 'findOneByEmail').mockResolvedValueOnce(member);
      //jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

      await expect(authService.validateMember(validateMemberDto)).rejects.toThrow(ExceptionHandler);
    });
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

      const createdMember: Member = {
        email: createMemberDto.email,
        password: hashedPassword,
        name: createMemberDto.name,
        nickname: createMemberDto.nickname,
      } as Member;

      //jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce(hashedPassword);
      jest.spyOn(membersService, 'create').mockResolvedValueOnce(createdMember);

      const result = await authService.register(createMemberDto);

      expect(result).toEqual(createdMember);
      expect(membersService.create).toHaveBeenCalledWith({
        ...createMemberDto,
        password: hashedPassword,
      });
    });
  });

  describe('login', () => {
    it('should return a JWT token for valid credentials', async () => {
      const member: Member = {
        email: 'test@example.com',
        password: 'test1234',
        name: 'Test',
        nickname: 'Tester',
      } as Member;

      const token = 'test-jwt-token';

      jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce(token);

      const result = await authService.login(member);

      expect(result).toEqual({ access_token: token });
      expect(await jwtService.signAsync).toHaveBeenCalledWith({
        email: member.email,
        sub: member.id,
      });
    });
  });
});