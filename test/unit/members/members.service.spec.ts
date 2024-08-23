import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from 'src/modules/members/services/members.service';
import { FavoritesRepository } from 'src/modules/members/repository/favorites.repository';
import { Member } from 'src/modules/members/entities/member.entity';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { MembersRepository } from 'src/modules/members/repository/members.repository';
import { CreateMemberDto } from 'src/modules/auth/dto/create-member.dto';

describe('MembersService', () => {
  let service: MembersService;
  let membersRepository: MembersRepository;
  let favoritesRepository: FavoritesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: MembersRepository,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findByNickname: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: FavoritesRepository,
          useValue: {
            findFavorite: jest.fn(),
            saveFavorite: jest.fn(),
            removeFavorite: jest.fn(),
            findAllFavoritesForMember: jest.fn(),
            updateFavorite: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    membersRepository = module.get<MembersRepository>(MembersRepository);
    favoritesRepository = module.get<FavoritesRepository>(FavoritesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new member', async () => {
      const createMemberDto: CreateMemberDto = {
        email: 'test@example.com',
        password: 'test1234',
        name: 'Test',
        nickname: 'Tester',
        phoneNumber: '01012345678',
        toMember: function (): Member {
          return {} as Member; // Simplified for the test case
        },
      };

      const member: Member = createMemberDto.toMember();

      jest.spyOn(membersRepository, 'create').mockResolvedValue(member);

      const result = await service.create(createMemberDto);

      expect(result).toBe(member);
      expect(membersRepository.create).toHaveBeenCalledWith(member);
    });
  });

  describe('findByEmail', () => {
    it('should return a member when email exists', async () => {
      const member: Member = {} as Member;
      jest.spyOn(membersRepository, 'findByEmail').mockResolvedValue(member);

      const result = await service.findByEmail('test@example.com');

      expect(result).toBe(member);
      expect(membersRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw an exception when email does not exist', async () => {
      jest.spyOn(membersRepository, 'findByEmail').mockResolvedValue(null);

      await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND),
      );
    });
  });

  describe('findByNickname', () => {
    it('should return a member when nickname exists', async () => {
      const member: Member = {} as Member;
      jest.spyOn(membersRepository, 'findByNickname').mockResolvedValue(member);

      const result = await service.findByNickname('Tester');

      expect(result).toBe(member);
      expect(membersRepository.findByNickname).toHaveBeenCalledWith('Tester');
    });

    it('should throw an exception when nickname does not exist', async () => {
      jest.spyOn(membersRepository, 'findByNickname').mockResolvedValue(null);

      await expect(service.findByNickname('Nonexistent')).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND),
      );
    });
  });
});