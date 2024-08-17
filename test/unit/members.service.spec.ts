import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from 'src/modules/members/members.service';
import { FavoritesRepository } from 'src/modules/members/repository/favorites.repository';
import { Member } from 'src/modules/members/entities/member.entity';
import { Favorite } from 'src/modules/members/entities';
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

  describe('addFavorite', () => {
    it('should add a favorite when valid', async () => {
      const memberId = 1;
      const favoritedMember: Member = { id: 2 } as Member;

      jest.spyOn(membersRepository, 'findByNickname').mockResolvedValue(favoritedMember);
      jest.spyOn(favoritesRepository, 'findFavorite').mockResolvedValue(null);
      jest.spyOn(membersRepository, 'findById').mockResolvedValue({ id: memberId } as Member);
      jest.spyOn(favoritesRepository, 'saveFavorite').mockResolvedValue({} as Favorite);

      const result = await service.addFavorite(memberId, 'Tester');

      expect(result).toBeDefined();
      expect(favoritesRepository.saveFavorite).toHaveBeenCalled();
    });

    it('should throw an exception if favorite request already exists', async () => {
      const memberId = 1;
      const favoritedMember: Member = { id: 2 } as Member;
      const existingFavorite: Favorite = { isAccepted: false } as Favorite;

      jest.spyOn(membersRepository, 'findByNickname').mockResolvedValue(favoritedMember);
      jest.spyOn(favoritesRepository, 'findFavorite').mockResolvedValue(existingFavorite);

      await expect(service.addFavorite(memberId, 'Tester')).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.FAVORITE_REQUEST_ALREADY_SENT),
      );
    });
  });

  describe('acceptFavoriteRequest', () => {
    it('should accept a favorite request', async () => {
      const memberId = 1;
      const requestMemberId = 2;
      const favorite: Favorite = { isAccepted: false } as Favorite;

      jest.spyOn(favoritesRepository, 'findFavorite').mockResolvedValue(favorite);
      jest.spyOn(favoritesRepository, 'updateFavorite').mockResolvedValue();

      await service.acceptFavoriteRequest(memberId, requestMemberId);

      expect(favorite.isAccepted).toBe(true);
      expect(favoritesRepository.updateFavorite).toHaveBeenCalled();
    });

    it('should throw an exception if the favorite request does not exist', async () => {
      const memberId = 1;
      const requestMemberId = 2;

      jest.spyOn(favoritesRepository, 'findFavorite').mockResolvedValue(null);

      await expect(service.acceptFavoriteRequest(memberId, requestMemberId)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.FAVORITE_REQUEST_NOT_FOUND),
      );
    });
  });

  describe('rejectFavoriteRequest', () => {
    it('should remove a favorite request', async () => {
      const memberId = 1;
      const requestMemberId = 2;
      const favorite: Favorite = {} as Favorite;

      jest.spyOn(favoritesRepository, 'findFavorite').mockResolvedValue(favorite);
      jest.spyOn(favoritesRepository, 'removeFavorite').mockResolvedValue();

      await service.rejectFavoriteRequest(memberId, requestMemberId);

      expect(favoritesRepository.removeFavorite).toHaveBeenCalledWith(favorite);
    });

    it('should throw an exception if the favorite request does not exist', async () => {
      const memberId = 1;
      const requestMemberId = 2;

      jest.spyOn(favoritesRepository, 'findFavorite').mockResolvedValue(null);

      await expect(service.rejectFavoriteRequest(memberId, requestMemberId)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.FAVORITE_REQUEST_NOT_FOUND),
      );
    });
  });

  describe('getFavoritesForMember', () => {
    it('should return a list of favorites for a member', async () => {
      const memberId = 1;
      const favorites: Favorite[] = [{ id: 1 }, { id: 2 }] as Favorite[];

      jest.spyOn(favoritesRepository, 'findAllFavoritesForMember').mockResolvedValue(favorites);

      const result = await service.getFavoritesForMember(memberId);

      expect(result).toBe(favorites);
      expect(favoritesRepository.findAllFavoritesForMember).toHaveBeenCalledWith(memberId);
    });
  });
});