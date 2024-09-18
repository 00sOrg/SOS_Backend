import { Injectable } from '@nestjs/common';
import { DataSource, Repository, In } from 'typeorm';
import { Member } from '../entities/member.entity';

@Injectable()
export class MembersRepository {
  private memberRepository: Repository<Member>;

  constructor(private readonly dataSource: DataSource) {
    this.memberRepository = this.dataSource.getRepository(Member);
  }

  async save(member: Member): Promise<Member> {
    return this.memberRepository.save(member);
  }

  async update(memberId: number, updateData: Partial<Member>): Promise<void> {
    await this.memberRepository.update(memberId, updateData);
  }

  async findById(memberId: number): Promise<Member | null> {
    return this.memberRepository
      .createQueryBuilder('member')
      .where('member.id=:memberId', { memberId })
      .leftJoinAndSelect('member.memberDetail', 'memberDetail')
      .getOne();
  }

  async findByIds(ids: number[]): Promise<Member[] | undefined> {
    return this.memberRepository.find({
      where: {
        id: In(ids),
      },
    });
  }

  async findByEmail(email: string): Promise<Member | null> {
    return this.memberRepository
      .createQueryBuilder('member')
      .where('member.email=:email', { email })
      .getOne();
  }

  async findByNickname(nickname: string): Promise<Member | null> {
    // return this.memberRepository.findOne({
    //   where: { nickname: nickname }
    //   ,
    // });
    return this.memberRepository
      .createQueryBuilder('member')
      .where('member.nickname = :nickname', { nickname })
      .leftJoinAndSelect('member.memberDetail', 'memberDetail')
      .getOne();
  }

  async findNearby(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
  ) {
    return this.memberRepository
      .createQueryBuilder('member')
      .where('member.latitude between :minLat AND :maxLat', { minLat, maxLat })
      .andWhere('member.longitude between :minLng AND :maxLng', {
        minLng,
        maxLng,
      })
      .getMany();
  }
}
