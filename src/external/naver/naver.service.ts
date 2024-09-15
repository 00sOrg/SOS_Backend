import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Region } from './dto/region.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NaverService {
  private readonly GC_URL: string =
    'https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getAddressFromCoordinate(lat: number, lng: number): Promise<string> {
    const params = {
      coords: `${lng},${lat}`,
      output: 'json',
      orders: 'legalcode,admcode',
    };

    const header = {
      'X-NCP-APIGW-API-KEY-ID':
        this.configService.get<string>('NAVER_MAP_API_ID'),
      'X-NCP-APIGW-API-KEY': this.configService.get<string>(
        'NAVER_MAP_API_SECRET',
      ),
    };
    const response = await firstValueFrom(
      this.httpService.get(this.GC_URL, {
        params: params,
        headers: header,
      }),
    );
    const result = response.data.results[0];
    const city = result.region.area1.name;
    const gu = result.region.area2.name;
    const dong = result.region.area3.name;

    return `${city} ${gu} ${dong}`;
  }
}
