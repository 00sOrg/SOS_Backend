import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from 'src/modules/members/services/members.service';
import { Member } from 'src/modules/members/entities/member.entity';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { MembersRepository } from 'src/modules/members/repository/members.repository';
import { S3Service } from 'src/external/s3/s3.service';
import * as bcrypt from 'bcryptjs';
import { MembersDetailRepository } from 'src/modules/members/repository/membersDetail.repository';

describe('MembersService', () => {
  let service: MembersService;
  let membersRepository: MembersRepository;
  let membersDetailRepository: MembersDetailRepository;
  let s3Service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        S3Service,
        {
          provide: MembersRepository,
          useValue: {
            save: jest.fn(),
            update: jest.fn(),
            findByEmail: jest.fn(),
            findByNickname: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: MembersDetailRepository,
          useValue: {
            update: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            upload: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    membersRepository = module.get<MembersRepository>(MembersRepository);
    membersDetailRepository = module.get<MembersDetailRepository>(
      MembersDetailRepository,
    );
    s3Service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateMember', () => {
    it('should throw an error if member is not found', async () => {
      jest.spyOn(membersRepository, 'findById').mockResolvedValue(null);

      await expect(
        service.updateMember(1, { nickname: 'newNickname' }),
      ).rejects.toThrow(new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND));
    });

    it('should throw an error if nickname is already taken by another member', async () => {
      const existingMember: Member = { id: 2 } as Member;
      const member: Member = { id: 1 } as Member;

      jest.spyOn(membersRepository, 'findById').mockResolvedValue(member);
      jest
        .spyOn(membersRepository, 'findByNickname')
        .mockResolvedValue(existingMember);

      await expect(
        service.updateMember(1, { nickname: 'newNickname' }),
      ).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.NICKNAME_ALREADY_TAKEN),
      );
    });

    it('should hash the password if provided', async () => {
      const member: Member = { id: 1 } as Member;

      jest.spyOn(membersRepository, 'findById').mockResolvedValue(member);
      jest.spyOn(membersRepository, 'findByNickname').mockResolvedValue(null);
      const hashSpy = jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(async () => 'hashedPassword');

      await service.updateMember(1, { password: 'newPassword' });

      expect(hashSpy).toHaveBeenCalledWith('newPassword', 10);
      expect(membersRepository.update).toHaveBeenCalledWith(1, {
        password: 'hashedPassword',
      });
    });

    it('should upload a profile picture if media is provided', async () => {
      const member: Member = { id: 1 } as Member;
      const mockFile = { originalname: 'profile.jpg' } as Express.Multer.File;
      const mockUrl = 'https://mock.url/profile-picture.jpg';

      jest.spyOn(membersRepository, 'findById').mockResolvedValue(member);
      jest.spyOn(membersRepository, 'findByNickname').mockResolvedValue(null);
      jest.spyOn(s3Service, 'upload').mockResolvedValue(mockUrl);

      await service.updateMember(1, { nickname: 'newNickname' }, mockFile);

      expect(s3Service.upload).toHaveBeenCalledWith(mockFile);
      expect(membersDetailRepository.update).toHaveBeenCalledWith(1, {
        profilePicture: mockUrl,
      });
    });

    it('should update Member and MemberDetail entities without errors', async () => {
      const member: Member = { id: 1 } as Member;

      jest.spyOn(membersRepository, 'findById').mockResolvedValue(member);
      jest.spyOn(membersRepository, 'findByNickname').mockResolvedValue(null);

      await service.updateMember(1, {
        nickname: 'newNickname',
        sex: 'F',
        birthDate: new Date('1990-01-01'),
      });

      expect(membersRepository.update).toHaveBeenCalledWith(1, {
        nickname: 'newNickname',
      });

      expect(membersDetailRepository.update).toHaveBeenCalledWith(1, {
        sex: 'F',
        birthDate: new Date('1990-01-01'),
      });
    });
  });
});
