import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from 'src/modules/members/services/favorites.service';
import { MembersRepository } from 'src/modules/members/repository/members.repository';
import { FavoritesRepository } from 'src/modules/members/repository/favorites.repository';
import { Favorite, Member } from 'src/modules/members/entities';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { NaverService } from 'src/external/naver/naver.service';
import { Region } from 'src/external/naver/dto/region.dto';

describe('FavoritesService', () => {
  let favoritesService: FavoritesService;
  let membersRepository: MembersRepository;
  let favoritesRepository: FavoritesRepository;
  let naverService: NaverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: MembersRepository,
          useValue: {
            findByNickname: jest.fn(),
            findById: jest.fn(),
            findByIds: jest.fn(),
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
        {
          provide: NaverService,
          useValue: {
            getAddressFromCoordinate: jest.fn(),
          },
        },
      ],
    }).compile();

    favoritesService = module.get<FavoritesService>(FavoritesService);
    membersRepository = module.get<MembersRepository>(MembersRepository);
    favoritesRepository = module.get<FavoritesRepository>(FavoritesRepository);
    naverService = module.get<NaverService>(NaverService);
  });

  describe('addFavorite', () => {
    it('should add a new favorite if it does not already exist', async () => {
      const memberId = 1;
      const nickname = 'favoritedUser';
      const favoritedMember: Member = { id: 2, nickname } as Member;
      const member: Member = { id: memberId } as Member;

      jest
        .spyOn(membersRepository, 'findByNickname')
        .mockResolvedValue(favoritedMember);
      jest.spyOn(membersRepository, 'findById').mockResolvedValue(member);
      jest.spyOn(favoritesRepository, 'findFavorite').mockResolvedValue(null);
      jest
        .spyOn(favoritesRepository, 'saveFavorite')
        .mockResolvedValue({} as Favorite);

      await favoritesService.addFavorite(memberId, nickname);

      expect(membersRepository.findByNickname).toHaveBeenCalledWith(nickname);
      expect(favoritesRepository.findFavorite).toHaveBeenCalledWith(
        memberId,
        favoritedMember.id,
      );
      expect(favoritesRepository.saveFavorite).toHaveBeenCalled();
    });

    it('should throw an error if the favorited member is not found', async () => {
      jest.spyOn(membersRepository, 'findByNickname').mockResolvedValue(null);
      await expect(
        favoritesService.addFavorite(1, 'nonexistentUser'),
      ).rejects.toThrow(new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND));
    });

    it('should throw an error if the favorite already exists and is accepted', async () => {
      const favoritedMember: Member = { id: 2 } as Member;
      const existingFavorite: Favorite = { isAccepted: true } as Favorite;

      jest
        .spyOn(membersRepository, 'findByNickname')
        .mockResolvedValue(favoritedMember);
      jest
        .spyOn(favoritesRepository, 'findFavorite')
        .mockResolvedValue(existingFavorite);

      await expect(
        favoritesService.addFavorite(1, 'favoritedUser'),
      ).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.FAVORITE_ALREADY_EXISTS),
      );
    });

    it('should throw an error if the favorite request is already sent', async () => {
      const favoritedMember: Member = { id: 2 } as Member;
      const existingFavorite: Favorite = { isAccepted: false } as Favorite;

      jest
        .spyOn(membersRepository, 'findByNickname')
        .mockResolvedValue(favoritedMember);
      jest
        .spyOn(favoritesRepository, 'findFavorite')
        .mockResolvedValue(existingFavorite);

      await expect(
        favoritesService.addFavorite(1, 'favoritedUser'),
      ).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.FAVORITE_REQUEST_ALREADY_SENT),
      );
    });
  });

  describe('acceptFavoriteRequest', () => {
    it('should accept the favorite request if it exists and is not already accepted', async () => {
      const memberId = 1;
      const requestMemberId = 2;
      const existingFavorite: Favorite = {
        id: 1,
        member: { id: memberId } as Member,
        favoritedMember: { id: requestMemberId } as Member,
        isAccepted: false,
      } as Favorite;

      jest
        .spyOn(favoritesRepository, 'findFavorite')
        .mockResolvedValue(existingFavorite);
      jest
        .spyOn(favoritesRepository, 'updateFavorite')
        .mockResolvedValue(undefined);

      await favoritesService.acceptFavoriteRequest(memberId, requestMemberId);

      expect(favoritesRepository.findFavorite).toHaveBeenCalledWith(
        requestMemberId,
        memberId,
      );
      expect(favoritesRepository.updateFavorite).toHaveBeenCalledWith(
        requestMemberId,
        memberId,
        expect.objectContaining({
          isAccepted: true,
        }),
      );
    });

    it('should throw an error if the favorite request is not found', async () => {
      const memberId = 1;
      const requestMemberId = 2;

      jest.spyOn(favoritesRepository, 'findFavorite').mockResolvedValue(null);

      await expect(
        favoritesService.acceptFavoriteRequest(memberId, requestMemberId),
      ).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.FAVORITE_REQUEST_NOT_FOUND),
      );

      expect(favoritesRepository.findFavorite).toHaveBeenCalledWith(
        requestMemberId,
        memberId,
      );
    });

    it('should throw an error if the favorite request is already accepted', async () => {
      const memberId = 1;
      const requestMemberId = 2;
      const existingFavorite: Favorite = {
        id: 1,
        member: { id: memberId } as Member,
        favoritedMember: { id: requestMemberId } as Member,
        isAccepted: true,
      } as Favorite;

      jest
        .spyOn(favoritesRepository, 'findFavorite')
        .mockResolvedValue(existingFavorite);

      await expect(
        favoritesService.acceptFavoriteRequest(memberId, requestMemberId),
      ).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.FAVORITE_ALREADY_EXISTS),
      );

      expect(favoritesRepository.findFavorite).toHaveBeenCalledWith(
        requestMemberId,
        memberId,
      );
    });
  });

  describe('rejectFavoriteRequest', () => {
    it('should remove the favorite if it exists', async () => {
      const favorite: Favorite = {} as Favorite;

      jest
        .spyOn(favoritesRepository, 'findFavorite')
        .mockResolvedValue(favorite);
      jest.spyOn(favoritesRepository, 'removeFavorite').mockResolvedValue();

      await favoritesService.rejectFavoriteRequest(1, 2);

      expect(favoritesRepository.findFavorite).toHaveBeenCalledWith(2, 1);
      expect(favoritesRepository.removeFavorite).toHaveBeenCalledWith(favorite);
    });

    it('should throw an error if the favorite request is not found', async () => {
      jest.spyOn(favoritesRepository, 'findFavorite').mockResolvedValue(null);

      await expect(
        favoritesService.rejectFavoriteRequest(1, 2),
      ).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.FAVORITE_REQUEST_NOT_FOUND),
      );
    });
  });

  describe('getFavoritesForMember', () => {
    it('should return an empty list if no favorites are found', async () => {
      jest
        .spyOn(favoritesRepository, 'findAllFavoritesForMember')
        .mockResolvedValue([]);

      const result = await favoritesService.getFavoritesForMember(1);

      expect(result.favorites).toEqual([]);
      expect(
        favoritesRepository.findAllFavoritesForMember,
      ).toHaveBeenCalledWith(1);
    });

    it('should return a list of favorites with location data', async () => {
      const favorites: Favorite[] = [
        {
          favoritedMember: {
            id: 2,
            latitude: 37.5665,
            longitude: 126.978,
          } as Member,
          member: { id: 1 } as Member,
          isAccepted: true,
          nickname: 'Test1',
        } as Favorite,
        {
          favoritedMember: {
            id: 3,
            latitude: 35.1796,
            longitude: 129.0756,
          } as Member,
          member: { id: 1 } as Member,
          isAccepted: true,
          nickname: 'Test2',
        } as Favorite,
      ];

      const regions: Region[] = [
        new Region('Seoul', 'Jongno-gu', 'Jongno'),
        new Region('Busan', 'Jung-gu', 'Nampo-dong'),
      ];

      jest
        .spyOn(favoritesRepository, 'findAllFavoritesForMember')
        .mockResolvedValue(favorites);

      jest
        .spyOn(naverService, 'getAddressFromCoordinate')
        .mockResolvedValueOnce(regions[0])
        .mockResolvedValueOnce(regions[1]);

      const result = await favoritesService.getFavoritesForMember(1);

      expect(result.favorites.length).toBe(2);
      expect(result.favorites[0].lastLocation).toEqual(
        'Seoul Jongno-gu Jongno',
      );
      expect(result.favorites[1].lastLocation).toEqual(
        'Busan Jung-gu Nampo-dong',
      );
      expect(
        favoritesRepository.findAllFavoritesForMember,
      ).toHaveBeenCalledWith(1);
      expect(naverService.getAddressFromCoordinate).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateFavorite', () => {
    it('should update the favorite nickname if the favorite exists', async () => {
      const memberId = 1;
      const favoritedMemberId = 2;
      const newNickname = 'NewNickname';
      const existingFavorite: Favorite = {
        id: 1,
        member: { id: memberId } as Member,
        favoritedMember: { id: favoritedMemberId } as Member,
        nickname: 'OldNickname',
      } as Favorite;

      jest
        .spyOn(favoritesRepository, 'findFavorite')
        .mockResolvedValue(existingFavorite);
      jest
        .spyOn(favoritesRepository, 'updateFavorite')
        .mockResolvedValue(undefined);

      await favoritesService.updateFavorite(
        memberId,
        favoritedMemberId,
        newNickname,
      );

      expect(favoritesRepository.findFavorite).toHaveBeenCalledWith(
        memberId,
        favoritedMemberId,
      );
      expect(favoritesRepository.updateFavorite).toHaveBeenCalledWith(
        memberId,
        favoritedMemberId,
        expect.objectContaining({
          nickname: newNickname,
        }),
      );
    });

    it('should throw an error if the favorite is not found', async () => {
      const memberId = 1;
      const favoritedMemberId = 2;
      const newNickname = 'NewNickname';

      jest.spyOn(favoritesRepository, 'findFavorite').mockResolvedValue(null);

      await expect(
        favoritesService.updateFavorite(
          memberId,
          favoritedMemberId,
          newNickname,
        ),
      ).rejects.toThrow(new ExceptionHandler(ErrorStatus.FAVORITE_NOT_FOUND));

      expect(favoritesRepository.findFavorite).toHaveBeenCalledWith(
        memberId,
        favoritedMemberId,
      );
    });
  });
});
