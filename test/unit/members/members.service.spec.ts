import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from 'src/modules/members/services/members.service';
import { Member } from 'src/modules/members/entities/member.entity';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { MembersRepository } from 'src/modules/members/repository/members.repository';
import { S3Service } from 'src/external/s3/s3.service';
import * as bcrypt from 'bcryptjs';
import { MembersDetailRepository } from 'src/modules/members/repository/membersDetail.repository';
import { MemberBuilder } from '../../../src/modules/members/entities/builder/member.builder';
import { NaverService } from '../../../src/external/naver/naver.service';
import { SearchMemberDto } from '../../../src/modules/members/dto/search-member.dto';
import { MemberDetailBuilder } from '../../../src/modules/members/entities/builder/memberDetail.builder';
import { GetMemberInfoDto } from '../../../src/modules/members/dto/get-memberInfo.dto';
import { GetMemberDetailInfoDto } from '../../../src/modules/members/dto/get-memberDetail-info.dto';

describe('MembersService', () => {
  let service: MembersService;
  let membersRepository: MembersRepository;
  let membersDetailRepository: MembersDetailRepository;
  let s3Service: S3Service;
  let naverService: NaverService;

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
            findByMemberId: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            upload: jest.fn(),
          },
        },
        {
          provide: NaverService,
          useValue: {
            getAddressFromCoordinate: jest.fn(),
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
    naverService = module.get<NaverService>(NaverService);
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
  describe('findMemberAndAddressByNickname', () => {
    let nickname: string;
    let member: Member;
    let address: string;
    let searchMemberDto: SearchMemberDto;
    beforeEach(() => {
      nickname = 'test';
      address = 'test';
      const memberDetail = new MemberDetailBuilder()
        .id(1)
        .profilePicture('profile')
        .build();
      member = new MemberBuilder()
        .id(1)
        .nickname('test')
        .logitude(0)
        .logitude(0)
        .memberDetail(memberDetail)
        .build();
      searchMemberDto = SearchMemberDto.of(member, address);
    });
    it('should return SearchMemberDto successfully', async () => {
      jest.spyOn(membersRepository, 'findByNickname').mockResolvedValue(member);
      jest
        .spyOn(naverService, 'getAddressFromCoordinate')
        .mockResolvedValue(address);
      const result = await service.findMemberAndAddressByNickname(nickname);

      expect(result).toEqual(searchMemberDto);
      expect(membersRepository.findByNickname).toHaveBeenCalledWith(nickname);
      expect(naverService.getAddressFromCoordinate).toHaveBeenCalledWith(
        member.latitude,
        member.longitude,
      );
    });
    it('should throw MEBEr_NOT_FOUND if member does not exist', async () => {
      jest.spyOn(membersRepository, 'findByNickname').mockResolvedValue(null);
      await expect(
        service.findMemberAndAddressByNickname(nickname),
      ).rejects.toThrow(new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND));
    });
  });

  describe('findMemberById', () => {
    let member: Member;
    beforeEach(() => {
      const memberDetail = new MemberDetailBuilder()
        .id(1)
        .profilePicture('profile1')
        .build();
      member = new MemberBuilder()
        .id(1)
        .memberDetail(memberDetail)
        .nickname('nickname')
        .logitude(0)
        .latitude(0)
        .build();
    });
    it('should return memberInfo successfully', async () => {
      jest.spyOn(membersRepository, 'findById').mockResolvedValue(member);
      const result = await service.findMemberById(1);
      expect(result).toBeInstanceOf(GetMemberInfoDto);
      expect(membersRepository.findById).toHaveBeenCalledTimes(1);
      expect(membersRepository.findById).toHaveBeenCalledWith(member.id);
    });
    it('should throw MEMBER_NOT_FOUND if member does not exist', async () => {
      jest.spyOn(membersRepository, 'findById').mockResolvedValue(null);
      await expect(service.findMemberById(1)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND),
      );
    });
  });

  describe('findMemberDetailById', () => {
    it('should return the member detail info successfully', async () => {
      const member = new MemberBuilder().name('test').build();
      const memberDetail = new MemberDetailBuilder()
        .id(1)
        .member(member)
        .profilePicture('profile')
        .build();
      jest
        .spyOn(membersDetailRepository, 'findByMemberId')
        .mockResolvedValue(memberDetail);
      const result = await service.findMemberDetailById(1);
      expect(result).toBeInstanceOf(GetMemberDetailInfoDto);
      expect(membersDetailRepository.findByMemberId).toHaveBeenCalledTimes(1);
      expect(membersDetailRepository.findByMemberId).toHaveBeenCalledWith(1);
    });
    it('should throw MEMBER_DETAIL_NOT_FOUND if member detail does not exist', async () => {
      jest
        .spyOn(membersDetailRepository, 'findByMemberId')
        .mockResolvedValue(null);
      await expect(service.findMemberDetailById(1)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.MEMBER_DETAIL_NOT_FOUND),
      );
    });
  });
});
