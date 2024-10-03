import { Test, TestingModule } from '@nestjs/testing';
import { LocationService } from 'src/modules/members/services/location.service';
import { MembersRepository } from 'src/modules/members/repository/members.repository';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { MemberBuilder } from '../../../src/modules/members/entities/builder/member.builder';

describe('LocationService', () => {
  let locationService: LocationService;
  let membersRepository: MembersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: MembersRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    locationService = module.get<LocationService>(LocationService);
    membersRepository = module.get<MembersRepository>(MembersRepository);
  });

  describe('updateLocation', () => {
    it('should update the member location', async () => {
      const member = new MemberBuilder().id(1).build();

      jest.spyOn(membersRepository, 'findById').mockResolvedValue(member);
      jest.spyOn(membersRepository, 'update').mockResolvedValue(undefined);

      const latitude = 40.7128;
      const longitude = -74.006;

      await locationService.updateLocation(member.id, latitude, longitude);

      expect(membersRepository.findById).toHaveBeenCalledWith(member.id);
      expect(membersRepository.update).toHaveBeenCalledWith(member.id, member);
    });

    it('should throw MEMBER_NOT_FOUND if the member does not exist', async () => {
      jest.spyOn(membersRepository, 'findById').mockResolvedValue(null);
      const latitude = 40.7128;
      const longitude = -74.006;

      await expect(
        locationService.updateLocation(1, latitude, longitude),
      ).rejects.toThrow(new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND));
      expect(membersRepository.findById).toHaveBeenCalledWith(1);
    });
  });
});
