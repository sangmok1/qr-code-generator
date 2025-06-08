import { S3Client } from "@aws-sdk/client-s3";

// S3 클라이언트 설정 로깅
console.log('S3 설정 정보:');
console.log('Region:', process.env.AWS_REGION);
console.log('Access Key ID 존재 여부:', !!process.env.AWS_ACCESS_KEY_ID);
console.log('Secret Access Key 존재 여부:', !!process.env.AWS_SECRET_ACCESS_KEY);
console.log('Bucket Name:', process.env.S3_BUCKET_NAME);

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  requestHandler: {
    connectionTimeout: 15000,  // 15초로 증가
    socketTimeout: 15000      // 15초로 증가
  },
  logger: console,
  maxAttempts: 3
}); 