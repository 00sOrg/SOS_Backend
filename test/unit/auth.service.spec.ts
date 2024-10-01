import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/modules/auth/auth.service';
import { MembersService } from 'src/modules/members/services/members.service';
import { MembersRepository } from 'src/modules/members/repository/members.repository';
import { JwtService } from '@nestjs/jwt';
import { CreateMemberDto } from 'src/modules/auth/dto/create-member.dto';
import { Member } from 'src/modules/members/entities';
import * as bcrypt from 'bcryptjs';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { ConfigModule } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Service } from 'src/external/s3/s3.service';
import { MemberDetailBuilder } from '../../src/modules/members/entities/builder/memberDetail.builder';
import { MemberBuilder } from '../../src/modules/members/entities/builder/member.builder';

describe('AuthService', () => {
  let authService: AuthService;
  let membersService: MembersService;
  let membersRepository: MembersRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        AuthService,
        {
          provide: MembersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: MembersRepository,
          useValue: {
            findByEmail: jest.fn(),
            findByNickname: jest.fn(),
            updateDevice: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: S3Service, // S3Service를 모킹된 객체로 제공
          useValue: {
            upload: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Member),
          useClass: Repository,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    membersService = module.get<MembersService>(MembersService);
    membersRepository = module.get<MembersRepository>(MembersRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateMember', () => {
    it('should validate a member with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'test1234';
      const member = {
        id: 1,
        email,
        password: await bcrypt.hash(password, 10),
      } as Member;

      jest.spyOn(membersService, 'findByEmail').mockResolvedValue(member);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const result = await authService.validateMember(email, password);

      expect(result).toBe(member);
      expect(membersService.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should throw an error if password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const member = {
        id: 1,
        email,
        password: await bcrypt.hash('test1234', 10),
      } as Member;

      jest.spyOn(membersService, 'findByEmail').mockResolvedValue(member);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(authService.validateMember(email, password)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.INVALID_PASSWORD),
      );
    });
  });

  describe('login', () => {
    it('should return a JWT token for a valid member with profile picture', async () => {
      const deviceToken = 'test-device-token';
      const memberDetail = new MemberDetailBuilder()
        .id(1)
        .profilePicture('profile')
        .build();
      const member = new MemberBuilder()
        .id(1)
        .email('test@example.com')
        .nickname('test')
        .memberDetail(memberDetail)
        .build();
      const token = 'test-jwt-token';

      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(token);
      jest
        .spyOn(membersRepository, 'updateDevice')
        .mockResolvedValue(undefined);

      const result = await authService.login(member, deviceToken);

      expect(membersRepository.updateDevice).toHaveBeenCalledWith(
        member.id,
        deviceToken,
      );
      expect(result).toEqual({ access_token: token });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: member.id,
        email: member.email,
        name: member.name,
        nickname: member.nickname,
        profilePicture: memberDetail.profilePicture,
      });
    });
    it('should not save the device token if not provided', async () => {
      const deviceToken = undefined;
      const memberDetail = new MemberDetailBuilder()
        .id(1)
        .profilePicture('profile')
        .build();
      const member = new MemberBuilder()
        .id(1)
        .email('test@example.com')
        .nickname('test')
        .memberDetail(memberDetail)
        .build();
      const token = 'test-jwt-token';

      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(token);
      jest
        .spyOn(membersRepository, 'updateDevice')
        .mockResolvedValue(undefined);

      const result = await authService.login(member, deviceToken);

      expect(membersRepository.updateDevice).not.toHaveBeenCalled();
      expect(result).toEqual({ access_token: token });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: member.id,
        email: member.email,
        name: member.name,
        nickname: member.nickname,
        profilePicture: memberDetail.profilePicture,
      });
    });
  });

  describe('checkEmail', () => {
    it('should throw an error if email already exists', async () => {
      const email = 'test@example.com';

      jest
        .spyOn(membersRepository, 'findByEmail')
        .mockResolvedValue({} as Member);

      await expect(authService.checkEmail(email)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.EMAIL_ALREADY_TAKEN),
      );
    });

    it('should pass if email does not exist', async () => {
      const email = 'new@example.com';

      jest.spyOn(membersRepository, 'findByEmail').mockResolvedValue(null);

      await expect(authService.checkEmail(email)).resolves.not.toThrow();
    });
  });

  describe('checkNickName', () => {
    it('should throw an error if nickname already exists', async () => {
      const nickname = 'Tester';

      jest
        .spyOn(membersRepository, 'findByNickname')
        .mockResolvedValue({} as Member);

      await expect(authService.checkNickName(nickname)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.NICKNAME_ALREADY_TAKEN),
      );
    });

    it('should pass if nickname does not exist', async () => {
      const nickname = 'NewTester';

      jest.spyOn(membersRepository, 'findByNickname').mockResolvedValue(null);

      await expect(authService.checkNickName(nickname)).resolves.not.toThrow();
    });
  });

  describe('register', () => {
    it('should hash the password and create a new member', async () => {
      const createMemberDto = Object.assign(new CreateMemberDto(), {
        email: 'test@example.com',
        password: 'test1234',
        name: 'Test',
        nickname: 'Tester',
        phoneNumber: '01012345678',
        sex: 'M',
        birthDate: new Date('1990-01-01'),
      });

      // Mock the hashed password value
      const hashedPassword =
        '$2a$10$CwTycUXWue0Thq9StjUM0uJ8bNHVrEsSnj/Jg6c4pN4/Yk8rje3aK'; // 고정된 해시 값

      // Mock bcrypt.hash to return the fixed hashedPassword
      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => hashedPassword);

      const member = createMemberDto.toMember();
      member.password = hashedPassword; // 해시된 비밀번호를 Member 객체에 설정

      // Mock the membersService.create to return the member
      jest.spyOn(membersService, 'create').mockResolvedValueOnce(member);

      await authService.register(createMemberDto);

      // Validate the expectations
      expect(membersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: hashedPassword,
          name: 'Test',
          nickname: 'Tester',
          phoneNumber: '01012345678',
          memberDetail: expect.objectContaining({
            sex: 'M',
            birthDate: new Date('1990-01-01'),
          }),
        }),
      );
    });

    it('should handle profile picture upload if provided', async () => {
      const createMemberDto = Object.assign(new CreateMemberDto(), {
        email: 'test@example.com',
        password: 'test1234',
        name: 'Test',
        nickname: 'Tester',
        phoneNumber: '01012345678',
        sex: 'M',
        birthDate: new Date('1990-01-01'),
      });

      const hashedPassword =
        '$2a$10$CwTycUXWue0Thq9StjUM0uJ8bNHVrEsSnj/Jg6c4pN4/Yk8rje3aK';

      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => hashedPassword);

      const mockUrl = 'https://mock.url/profile-picture.jpg';
      const mockFile = { originalname: 'profile.jpg' } as Express.Multer.File;

      const member = createMemberDto.toMember(mockUrl);
      member.password = hashedPassword;

      jest.spyOn(membersService, 'create').mockResolvedValueOnce(member);
      jest.spyOn(authService['s3Service'], 'upload').mockResolvedValue(mockUrl);

      await authService.register(createMemberDto, mockFile);

      expect(authService['s3Service'].upload).toHaveBeenCalledWith(mockFile);
      expect(membersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: hashedPassword,
          name: 'Test',
          nickname: 'Tester',
          phoneNumber: '01012345678',
          memberDetail: expect.objectContaining({
            sex: 'M',
            birthDate: new Date('1990-01-01'),
            profilePicture: mockUrl,
          }),
        }),
      );
    });
  });
});
