import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { ExceptionHandler } from '../common/filters/exception/exception.handler';
import { ErrorStatus } from '../common/api/status/error.status';

const FILE_PATH = path.resolve(
  __dirname,
  '../../firebase-service-account.json',
);

export const firebaseConfig = (): admin.app.App => {
  let serviceAccount: any;
  try {
    const rawData = fs.readFileSync(FILE_PATH, 'utf-8');
    serviceAccount = JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading Firebase account file:', error);
    throw new ExceptionHandler(ErrorStatus.FIREBASE_CONFIG_ERROR);
  }

  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};
