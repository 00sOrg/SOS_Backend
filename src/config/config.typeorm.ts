import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createConnection } from 'mysql2/promise';

// .env 파일 로드
dotenv.config();

const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',  
  port: parseInt(process.env.DB_PORT, 10) || 3306, 
  username: process.env.DB_USER || 'root',  
  password: process.env.DB_PASSWORD || '',  
  database: process.env.DB_NAME || 'sos_database', 
  entities: [
    path.join(__dirname, '/../**/*.entity{.ts,.js}')
  ],
//   entities: [
//     process.env.NODE_ENV === 'production'
//       ? path.join(__dirname, '/../**/*.entity.js')
//       : path.join(__dirname, '/../**/*.entity.ts')
//   ],  // 엔티티 파일 경로 (NODE_ENV 값에 따라 경로 설정 -> 개발환경에서는 ts, 프로덕션 환경에서는 js)
  synchronize: true,  // 애플리케이션 실행 시 데이터베이스 스키마를 동기화 (운영 환경에서는 false로 설정)
  logging: true, 
  charset: 'utf8mb4',  
};

// DB 없으면 생성
export async function createDatabase() {
    const connection = await createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
    });
  
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_DATABASE || 'sos_database'}\`;`);
    await connection.end();
  }
  

export default typeOrmConfig;