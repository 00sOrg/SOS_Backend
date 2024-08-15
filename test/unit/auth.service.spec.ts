import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { MembersService } from '../../src/modules/members/members.service';
import { AuthService } from '../../src/modules/auth/auth.service';
import { MembersRepository } from '../../src/modules/members/members.repository';
import { Member } from '../../src/modules/members/entities';
import { CreateMemberDto } from '../../src/modules/auth/dto/create-member.dto';
import * as bcrypt from 'bcryptjs';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';

describe('AuthService', () => {
  let authService: AuthService;
  let membersService: MembersService;
  let membersRepository: MembersRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: MembersService,
          useValue: {
            findOneByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: MembersRepository,
          useValue: {
            findOneByEmail: jest.fn(),
            findOneByNickname: jest.fn(),
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
    membersRepository = module.get<MembersRepository>(MembersRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateMember', () => {
    it('should validate and return a member if password is valid', async () => {
      const member = new Member();
      member.password = await bcrypt.hash('test1234', 10);

      jest.spyOn(membersService, 'findOneByEmail').mockResolvedValue(member);
      //jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.validateMember('test@example.com', 'test1234');
      expect(result).toEqual(member);
    });

    it('should throw an exception if password is invalid', async () => {
      const member = new Member();
      member.password = await bcrypt.hash('test1234', 10);

      jest.spyOn(membersService, 'findOneByEmail').mockResolvedValue(member);
      //jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(authService.validateMember('test@example.com', 'wrongpassword'))
        .rejects
        .toThrow(new ExceptionHandler(ErrorStatus.INVALID_PASSWORD));
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const member = new Member();
      member.email = 'test@example.com';
      member.id = 1;

      const token = 'test-token';
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(token);

      const result = await authService.login(member);
      expect(result).toEqual({ access_token: token });
      expect(jwtService.signAsync).toHaveBeenCalledWith({ email: member.email, sub: member.id });
    });
  });

  describe('checkEmail', () => {
    it('should throw an exception if email is already taken', async () => {
      jest.spyOn(membersRepository, 'findOneByEmail').mockResolvedValue(new Member());

      await expect(authService.checkEmail('test@example.com'))
        .rejects
        .toThrow(new ExceptionHandler(ErrorStatus.EMAIL_ALREADY_TAKEN));
    });

    it('should not throw an exception if email is available', async () => {
      jest.spyOn(membersRepository, 'findOneByEmail').mockResolvedValue(null);

      await expect(authService.checkEmail('test@example.com')).resolves.toBeUndefined();
    });
  });

  describe('checkNickName', () => {
    it('should throw an exception if nickname is already taken', async () => {
      jest.spyOn(membersRepository, 'findOneByNickname').mockResolvedValue(new Member());

      await expect(authService.checkNickName('Tester'))
        .rejects
        .toThrow(new ExceptionHandler(ErrorStatus.NICKNAME_ALREADY_TAKEN));
    });

    it('should not throw an exception if nickname is available', async () => {
      jest.spyOn(membersRepository, 'findOneByNickname').mockResolvedValue(null);

      await expect(authService.checkNickName('Tester')).resolves.toBeUndefined();
    });
  });

  describe('register', () => {
    it('should hash the password and create a new member', async () => {
      const createMemberDto: CreateMemberDto = {
        email: 'test@example.com',
        password: 'test1234',
        name: 'Test',
        nickname: 'Tester',
        phoneNumber: '01012345678',
        toMember: function (): Member {
          throw new Error('Function not implemented.');
        },
      };

      const hashedPassword = await bcrypt.hash(createMemberDto.password, 10);
      //jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);

      const createdMember = new Member();
      jest.spyOn(membersService, 'create').mockResolvedValue(createdMember);

      const result = await authService.register(createMemberDto);

      expect(result).toEqual(createdMember);
      expect(membersService.create).toHaveBeenCalledWith({
        ...createMemberDto,
        password: hashedPassword,
      });
    });
  });
});