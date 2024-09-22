import { Keyword } from '../keyword.entity';
import { Event } from '../event.entity';

export class KeywordBuilder {
  _keyword: Keyword;

  constructor() {
    this._keyword = new Keyword();
  }

  id(id: number): this {
    this._keyword.id = id;
    return this;
  }

  event(event: Event): this {
    this._keyword.event = event;
    return this;
  }

  keyword(keyword: string): this {
    this._keyword.keyword = keyword;
    return this;
  }

  build(): Keyword {
    return this._keyword;
  }
}
