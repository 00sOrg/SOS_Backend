import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from 'src/modules/members/services/favorites.service';
import { MembersRepository } from 'src/modules/members/repository/members.repository';
import { FavoritesRepository } from 'src/modules/members/repository/favorites.repository';
import { Favorite, Member } from 'src/modules/members/entities';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';

describe('FavoritesService', () => {
  let favoritesService: FavoritesService;
  let membersRepository: MembersRepository;
  let favoritesRepository: FavoritesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: MembersRepository,
          useValue: {
            findByNickname: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: FavoritesRepository,
          useValue: {
            findFavorite: jest.fn(),
            saveFavorite: jest.fn(),
            updateFavorite: jest.fn(),
            removeFavorite: jest.fn(),
            findAllFavoritesForMember: jest.fn(),
          },
        },
      ],
    }).compile();

    favoritesService = module.get<FavoritesService>(FavoritesService);
    membersRepository = module.get<MembersRepository>(MembersRepository);
    favoritesRepository = module.get<FavoritesRepository>(FavoritesRepository);
  });

  describe('addFavorite', () => {
    it('should add a new favorite if it does not already exist', async () => {
      const memberId = 1;
      const nickname = 'favoritedUser';
      const favoritedMember: Member = { id: 2, nickname } as Member;
      const member: Member = { id: memberId } as Member;

      jest.spyOn(membersRepository, 'findByNickname').mockResolvedValue(favoritedMember);
      jest.spyOn(membersRepository, 'findById').mockResolvedValue(member);
      jest.spyOn(favoritesRepository, 'findFavorite').mockResolvedValue(null);
      jest.spyOn(favoritesRepository, 'saveFavorite').mockResolvedValue({} as Favorite);

      const result = await favoritesService.addFavorite(memberId, nickname);

      expect(result).toBeDefined();
      expect(membersRepository.findByNickname).toHaveBeenCalledWith(nickname);
      expect(favoritesRepository.findFavorite).toHaveBeenCalledWith(memberId, favoritedMember.id);
      expect(favoritesRepository.saveFavorite).toHaveBeenCalled();
    });

    it('should throw an error if the favorited member is not found', async () => {
      jest.spyOn(membersRepository, 'findByNickname').mockResolvedValue(null);

      await expect(favoritesService.addFavorite(1, 'nonexistentUser')).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND),
      );
    });

    it('should throw an error if the favorite already exists and is accepted', async () => {
      const favoritedMember: Member = { id: 2 } as Member;
      const existingFavorite: Favorite = { isAccepted: true } as Favorite;

      jest.spyOn(membersRepository, 'findByNickname').mockResolvedValue(favoritedMember);
      jest.spyOn(favoritesRepository, 'findFavorite').mockResolvedValue(existingFavorite);

      await expect(favoritesService.addFavorite(1, 'favoritedUser')).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.FAVORITE_ALREADY_EXISTS),
      );
    });

    it('should throw an error if the favorite request is already sent', async () => {
      const favoritedMember: Member = { id: 2 } as Member;
      const existingFavorite: Favorite = { isAccepted: false } as Favorite;

      jest.spyOn(membersRepository, 'findByNickname').mockResolvedValue(favoritedMember);
      jest.spyOn(favoritesRepository, 'findFavorite').mockResolvedValue(existingFavorite);

      await expect(favoritesService.addFavorite(1, 'favoritedUser')).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.FAVORITE_REQUEST_ALREADY_SENT),
      );
    });
  });

  describe('acceptFavoriteRequest', () => {
    it('should accept a favorite request if it exists and is not already accepted', async () => {
      const favorite: Favorite = { isAccepted: false } as Favorite;

      jest.spyOn(favoritesRepository, 'findFavorite').mockResolvedValue(favorite);
      jest.spyOn(favoritesRepository, 'updateFavorite').mockResolvedValue();

      await favoritesService.acceptFavoriteRequest(1, 2);

      expect(favoritesRepository.findFavorite).toHaveBeenCalledWith(2, 1);
      expect(favorite.isAccepted).toBe(true);
      expect(favoritesRepository.updateFavorite).toHaveBeenCalledWith(2, favorite);
    });

    it('should throw an error if the favorite request is not found', async () => {
      jest.spyOn(favoritesRepository, 'findFavorite').mockResolvedValue(null);

      await expect(favoritesService.acceptFavoriteRequest(1, 2)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.FAVORITE_REQUEST_NOT_FOUND),
      );
    });

    it('should throw an error if the favorite request is already accepted', async () => {
      const favorite: Favorite = { isAccepted: true } as Favorite;

      jest.spyOn(favoritesRepository, 'findFavorite').mockResolvedValue(favorite);

      await expect(favoritesService.acceptFavoriteRequest(1, 2)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.FAVORITE_ALREADY_EXISTS),
      );
    });
  });

  describe('rejectFavoriteRequest', () => {
    it('should remove the favorite if it exists', async () => {
      const favorite: Favorite = {} as Favorite;

      jest.spyOn(favoritesRepository, 'findFavorite').mockResolvedValue(favorite);
      jest.spyOn(favoritesRepository, 'removeFavorite').mockResolvedValue();

      await favoritesService.rejectFavoriteRequest(1, 2);

      expect(favoritesRepository.findFavorite).toHaveBeenCalledWith(2, 1);
      expect(favoritesRepository.removeFavorite).toHaveBeenCalledWith(favorite);
    });

    it('should throw an error if the favorite request is not found', async () => {
      jest.spyOn(favoritesRepository, 'findFavorite').mockResolvedValue(null);

      await expect(favoritesService.rejectFavoriteRequest(1, 2)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.FAVORITE_REQUEST_NOT_FOUND),
      );
    });
  });

  describe('getFavoritesForMember', () => {
    it('should return the list of favorites for a member', async () => {
      const favorites: Favorite[] = [{}, {}] as Favorite[];

      jest.spyOn(favoritesRepository, 'findAllFavoritesForMember').mockResolvedValue(favorites);

      const result = await favoritesService.getFavoritesForMember(1);

      expect(result).toBe(favorites);
      expect(favoritesRepository.findAllFavoritesForMember).toHaveBeenCalledWith(1);
    });
  });
});