import { Injectable, OnModuleInit } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Event } from '../../modules/events/entities';
import { KeywordBuilder } from '../../modules/events/entities/builder/keyword.builder';
import { KeywordRepository } from '../../modules/events/repository/keyword.repository';

@Injectable()
export class OpenaiEventsHandler implements OnModuleInit {
  constructor(
    private readonly openaiService: OpenaiService,
    private readonly keywordRepository: KeywordRepository,
  ) {}
  onModuleInit() {
    console.log('OpenaiEventsHandler initialized');
  }

  /**
   * 키워드 추출 이벤트
   */
  @OnEvent('openai.keywords')
  async extractKeywords(payload: { content: string; event: Event }) {
    const words = await this.openaiService.extractKeywords(payload.content);
    if (words === 'None' || !words) {
      console.log(words);
      return;
    }
    const keywords = words.split('\n').map((word) => {
      const keyword = word.replace(/^\d+\.\s*/, '').trim();
      return new KeywordBuilder().keyword(keyword).event(payload.event).build();
    });
    await this.keywordRepository.createKeywords(keywords);
  }
}
