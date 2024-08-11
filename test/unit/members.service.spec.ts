import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from 'src/modules/members/members.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from 'src/modules/members/entities/member.entity';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { MembersModule } from 'src/modules/members/members.module';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { MembersRepository } from 'src/modules/members/members.repository';

describe('MembersService', () => {
    let membersService: MembersService;
    let membersRepository: Partial<jest.Mocked<MembersRepository>>;
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MembersService,
          {
            provide: MembersRepository,
            useValue: {
              findOneByEmail: jest.fn(),  // Mocking findOneByEmail method
              findOneByNickname: jest.fn(),  // Mocking findOneByNickname method
              create: jest.fn(),  // Mocking create method
            },
          },
        ],
      }).compile();
  
      membersService = module.get<MembersService>(MembersService);
      membersRepository = module.get(MembersRepository);
    });
  
    describe('findOneByEmail', () => {
      it('should return a member when email exists', async () => {
        const email = 'test@example.com';
        const member = new Member();
        (membersRepository.findOneByEmail as jest.Mock).mockResolvedValue(member);
  
        const result = await membersService.findOneByEmail(email);
        expect(membersRepository.findOneByEmail).toHaveBeenCalledWith(email);
        expect(result).toEqual(member);
      });
  
      it('should throw an ExceptionHandler when email does not exist', async () => {
        (membersRepository.findOneByEmail as jest.Mock).mockResolvedValue(null);
  
        await expect(membersService.findOneByEmail('nonexistent@example.com')).rejects.toThrow(new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND));
      });
    });
  
    describe('findOneByNickname', () => {
      it('should return a member when nickname exists', async () => {
        const nickname = 'Tester';
        const member = new Member();
        (membersRepository.findOneByNickname as jest.Mock).mockResolvedValue(member);
  
        const result = await membersService.findOneByNickname(nickname);
        expect(membersRepository.findOneByNickname).toHaveBeenCalledWith(nickname);
        expect(result).toEqual(member);
      });
  
      it('should throw an ExceptionHandler when nickname does not exist', async () => {
        (membersRepository.findOneByNickname as jest.Mock).mockResolvedValue(null);
  
        await expect(membersService.findOneByNickname('NonexistentNickname')).rejects.toThrow(new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND));
      });
    });
  
    describe('create', () => {
      it('should create a new member successfully', async () => {
        const member = new Member();
        (membersRepository.create as jest.Mock).mockResolvedValue(member);
  
        const createMemberDto = {
          email: 'newmember@example.com',
          password: 'password',
          name: 'New Member',
          nickname: 'newbie',
        };
  
        await membersService.create(createMemberDto);
  
        expect(membersRepository.create).toHaveBeenCalledWith(expect.objectContaining(createMemberDto));
      });
    });
  });