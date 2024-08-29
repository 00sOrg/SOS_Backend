import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createConnection } from 'mysql2/promise';

// .env 파일 로드
dotenv.config();

const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sos_database',
  entities: [path.join(__dirname, '/../**/*.entity{.ts,.js}')],
  // 방법1: 엔티티 자동 로드
  // autoLoadEntities: true,
  // 방법2: 엔티티 경로 설정
  //   entities: [
  //     process.env.NODE_ENV === 'production'
  //       ? path.join(__dirname, '/../**/*.entity.js')
  //       : path.join(__dirname, '/../**/*.entity.ts')
  //   ],  // 엔티티 파일 경로 (NODE_ENV 값에 따라 경로 설정 -> 개발환경에서는 ts, 프로덕션 환경에서는 js)
  synchronize: true, // 운영 환경에서는 false, 개발 환경에서는 true
  logging: true,
  charset: 'utf8mb4',

  keepConnectionAlive: true,
};

// DB 없으면 생성
export async function createDatabase() {
  const connection = await createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'sos_database'}\`;`,
  );
  await connection.end();
}

export default typeOrmConfig;
