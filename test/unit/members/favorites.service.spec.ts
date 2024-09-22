import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from 'src/modules/members/services/favorites.service';
import { MembersRepository } from 'src/modules/members/repository/members.repository';
import { FavoritesRepository } from 'src/modules/members/repository/favorites.repository';
import { Favorite, Member } from 'src/modules/members/entities';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { NaverService } from 'src/external/naver/naver.service';
import { MemberBuilder } from '../../../src/modules/members/entities/builder/member.builder';
import { FavoriteBuilder } from '../../../src/modules/members/entities/builder/favorite.builder';
import { NotificationService } from '../../../src/modules/alarm/services/notification.service';

describe('FavoritesService', () => {
  let favoritesService: FavoritesService;
  let membersRepository: MembersRepository;
  let favoritesRepository: FavoritesRepository;
  let naverService: NaverService;
  let notificationService: NotificationService;

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
            deleteById: jest.fn(),
          },
        },
        {
          provide: NaverService,
          useValue: {
            getAddressFromCoordinate: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            createNotification: jest.fn(),
            deleteFavoriteNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    favoritesService = module.get<FavoritesService>(FavoritesService);
    membersRepository = module.get<MembersRepository>(MembersRepository);
    favoritesRepository = module.get<FavoritesRepository>(FavoritesRepository);
    naverService = module.get<NaverService>(NaverService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  describe('addFavorite', () => {
    let targetMember: Member;
    let member: Member;
    let favorite: Favorite;

    beforeEach(() => {
      targetMember = new MemberBuilder().id(2).nickname('member2').build();
      member = new MemberBuilder().id(1).build();
      favorite = new FavoriteBuilder()
        .id(1)
        .member(member)
        .favoritedMember(targetMember)
        .nickname(targetMember.nickname)
        .build();
    });

    it('should add a new favorite if it does not already exist', async () => {
      const nickname = 'member2';
      const newFavorite = new FavoriteBuilder()
        .member(member)
        .favoritedMember(targetMember)
        .nickname(targetMember.nickname)
        .build();
      jest
        .spyOn(membersRepository, 'findByNickname')
        .mockResolvedValue(targetMember);
      jest.spyOn(membersRepository, 'findById').mockResolvedValue(member);
      jest.spyOn(favoritesRepository, 'findFavorite').mockResolvedValue(null);
      jest
        .spyOn(favoritesRepository, 'saveFavorite')
        .mockResolvedValue(favorite);

      await favoritesService.addFavorite(member, nickname);

      expect(membersRepository.findByNickname).toHaveBeenCalledWith(nickname);
      expect(favoritesRepository.findFavorite).toHaveBeenCalledWith(
        member.id,
        targetMember.id,
      );
      expect(favoritesRepository.saveFavorite).toHaveBeenCalledWith(
        newFavorite,
      );
      expect(notificationService.createNotification).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the target member does not found', async () => {
      jest.spyOn(membersRepository, 'findByNickname').mockResolvedValue(null);
      await expect(
        favoritesService.addFavorite(member, 'nonexistentUser'),
      ).rejects.toThrow(new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND));
    });

    it('should throw an error if the favorite already exists and is accepted', async () => {
      favorite.isAccepted = true;
      jest
        .spyOn(membersRepository, 'findByNickname')
        .mockResolvedValue(targetMember);
      jest
        .spyOn(favoritesRepository, 'findFavorite')
        .mockResolvedValue(favorite);

      await expect(
        favoritesService.addFavorite(member, 'favoritedUser'),
      ).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.FAVORITE_ALREADY_EXISTS),
      );
    });

    it('should throw an error if the favorite request is already sent', async () => {
      jest
        .spyOn(membersRepository, 'findByNickname')
        .mockResolvedValue(targetMember);
      jest
        .spyOn(favoritesRepository, 'findFavorite')
        .mockResolvedValue(favorite);

      await expect(
        favoritesService.addFavorite(member, 'favoritedUser'),
      ).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.FAVORITE_REQUEST_ALREADY_SENT),
      );
    });
  });

  describe('acceptFavoriteRequest', () => {
    let favorite: Favorite;
    beforeEach(() => {
      const member = new MemberBuilder().id(1).build();
      const member2 = new MemberBuilder().id(2).build();
      favorite = new FavoriteBuilder()
        .id(1)
        .member(member)
        .favoritedMember(member2)
        .build();
    });
    it('should accept the favorite request if it exists and is not already accepted', async () => {
      const memberId = 1;
      const requestMemberId = 2;

      jest
        .spyOn(favoritesRepository, 'findFavorite')
        .mockResolvedValue(favorite);
      jest
        .spyOn(favoritesRepository, 'updateFavorite')
        .mockResolvedValue(undefined);

      await favoritesService.acceptFavoriteRequest(memberId, requestMemberId);

      expect(favoritesRepository.findFavorite).toHaveBeenCalledWith(
        requestMemberId,
        memberId,
      );
      expect(favoritesRepository.updateFavorite).toHaveBeenCalledWith(favorite);
      expect(favorite.isAccepted).toBe(true);
      expect(
        notificationService.deleteFavoriteNotification,
      ).toHaveBeenCalledWith(favorite);
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
      expect(
        notificationService.deleteFavoriteNotification,
      ).toHaveBeenCalledWith(favorite);
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
    it('should return a list of favorites with location data', async () => {
      const favorites: Favorite[] = [
        {
          favoritedMember: {
            id: 2,
            latitude: 37.5665,
            longitude: 126.978,
            nickname: 'OriginalNickname1',
            memberDetail: {
              profilePicture: 'profile1.jpg',
            } as any,
          } as Member,
          member: { id: 1 } as Member,
          isAccepted: true,
          nickname: 'ModifiedNickname1',
        } as Favorite,
        {
          favoritedMember: {
            id: 3,
            latitude: 35.1796,
            longitude: 129.0756,
            nickname: 'OriginalNickname2',
            memberDetail: {
              profilePicture: 'profile2.jpg',
            } as any,
          } as Member,
          member: { id: 1 } as Member,
          isAccepted: true,
          nickname: 'ModifiedNickname2',
        } as Favorite,
      ];

      const addresses: string[] = [
        '서울특별시 강남구 역삼동',
        '경기도 용인시 기흥구 하갈동',
      ];

      jest
        .spyOn(favoritesRepository, 'findAllFavoritesForMember')
        .mockResolvedValue(favorites);

      jest
        .spyOn(naverService, 'getAddressFromCoordinate')
        .mockResolvedValueOnce(addresses[0])
        .mockResolvedValueOnce(addresses[1]);

      const result = await favoritesService.getFavoritesForMember(1);

      expect(result.favorites.length).toBe(2);

      expect(result.favorites[0].lastLocation).toEqual(addresses[0]);
      expect(result.favorites[0].profilePicture).toEqual('profile1.jpg');
      expect(result.favorites[0].modifiedNickname).toEqual('ModifiedNickname1');
      expect(result.favorites[0].nickname).toEqual('OriginalNickname1');

      expect(result.favorites[1].lastLocation).toEqual(addresses[1]);
      expect(result.favorites[1].profilePicture).toEqual('profile2.jpg');
      expect(result.favorites[1].modifiedNickname).toEqual('ModifiedNickname2');
      expect(result.favorites[1].nickname).toEqual('OriginalNickname2');

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
        expect.objectContaining({
          id: existingFavorite.id,
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

      expect(favoritesRepository.updateFavorite).not.toHaveBeenCalled();
    });
  });
  describe('deleteFavorite', () => {
    it('should delete the favoriteMember successfully', async () => {
      const memberId = 1;
      const favoriteId = 1;
      await favoritesService.deleteFavorite(memberId, favoriteId);

      expect(favoritesRepository.deleteById).toHaveBeenCalledWith(
        favoriteId,
        memberId,
      );
    });
  });
});
