import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Keyword } from '../entities/keyword.entity';
@Injectable()
export class KeywordRepository {
  private keywordRepository: Repository<Keyword>;
  constructor(private readonly dataSource: DataSource) {
    this.keywordRepository = this.dataSource.getRepository(Keyword);
  }

  async createKeywords(keywords: Keyword[]): Promise<void> {
    await this.keywordRepository.save(keywords);
  }
}
