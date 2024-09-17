import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';
import { createConnection } from 'mysql2/promise';
import * as process from 'node:process';
import * as dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [path.join(__dirname, '/../**/*.entity{.ts,.js}')],
  synchronize: true,
  logging: true,
  charset: 'utf8mb4',
  keepConnectionAlive: true,
  bigNumberStrings: false,
};

// DB 없으면 생성
export async function createDatabase() {
  const connection = await createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'sos_database'}\`;`,
  );
  await connection.end();
}

export default typeOrmConfig;
