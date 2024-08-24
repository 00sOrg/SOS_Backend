import { Test, TestingModule } from '@nestjs/testing';
import { LocationService } from 'src/modules/members/services/location.service';
import { MembersRepository } from 'src/modules/members/repository/members.repository';
import { Member } from 'src/modules/members/entities/member.entity';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { MemberLocationDto } from 'src/modules/members/dto/member-location.dto';

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
      const member: Member = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test',
        nickname: 'Tester',
        phoneNumber: '01012345678',
        latitude: 37.7749,
        longitude: -122.4194,
      } as Member;

      jest.spyOn(membersRepository, 'findById').mockResolvedValue(member);
      jest.spyOn(membersRepository, 'update').mockResolvedValue(undefined);

      const latitude = 40.7128;
      const longitude = -74.0060;

      const memberLocationDto: MemberLocationDto = { latitude, longitude };

      await locationService.updateLocation(member.id, memberLocationDto.latitude, memberLocationDto.longitude);

      expect(membersRepository.findById).toHaveBeenCalledWith(member.id);
      expect(membersRepository.update).toHaveBeenCalledWith(member.id, { latitude, longitude });
    });

    it('should throw MEMBER_NOT_FOUND if the member does not exist', async () => {
      jest.spyOn(membersRepository, 'findById').mockResolvedValue(null);

      const latitude = 40.7128;
      const longitude = -74.0060;
      const memberLocationDto: MemberLocationDto = { latitude, longitude };

      await expect(locationService.updateLocation(1, memberLocationDto.latitude, memberLocationDto.longitude)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND),
      );
      expect(membersRepository.findById).toHaveBeenCalledWith(1);
    });
  });
});