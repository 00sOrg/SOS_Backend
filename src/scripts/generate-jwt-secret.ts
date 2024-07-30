import { randomBytes } from 'crypto';

// 256비트(32바이트)의 랜덤 비밀 키 생성
const specificWord = '00sorgsos';
const secretKey = specificWord + randomBytes(28).toString('hex');

console.log('Generated JWT Secret Key:', secretKey);
