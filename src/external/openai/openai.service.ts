import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;
  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async extractKeywords(content: string): Promise<string | null> {
    const prompt = this.generatePrompt(content);
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    return response.choices[0].message.content;
  }

  private generatePrompt(context: string): string {
    return `Extract up to four keywords from the following text. The keywords must adhere to the following rules:
  - Only extract words that are explicitly mentioned in the text.
  - Focus on key events, actions, or significant concepts (e.g., '화재', '붕괴').
  - Prioritize proper nouns (e.g., names, places) and significant events.
  - Only one location or place name should be extracted. If multiple locations are mentioned, prioritize the most significant one.
  - Avoid extracting keywords like '친구', '사람', unless they play a critical role in the text.
  - DO NOT MAKE THE KEYWORDS. ONLY EXTRACT FROM THE FOLLWING TEXT
  - When extracting keywords, the KEYWORDS should be on specific facts or actions mentioned in the text. ONLY THE FACTS AND THE ACTIONS
  - IF THERE IS NO KEYWORDS, THEN RETURN NONE
  - Return the keywords in the following format:
    1. <keyword>
    2. <keyword>
    3. <keyword>
    4. <keyword> (or fewer if less than four).

  Text: ${context}`;
  }
}
