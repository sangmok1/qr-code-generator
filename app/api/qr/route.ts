import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import QRCode from 'qrcode';
import { authOptions } from '../auth/[...nextauth]/route';
import { s3Client } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { headers } from 'next/headers';
import crypto from 'crypto';

// Base64 데이터를 Buffer로 변환하는 함수
function base64ToBuffer(base64: string) {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

async function generateUniqueCode(connection: any): Promise<string> {
  let code: string = '';
  let exists = true;
  while (exists) {
    code = 'qrgen_' + crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    const [rows]: any = await connection.execute(
      'SELECT COUNT(*) as cnt FROM qr_info WHERE redirect_code = ?',
      [code]
    );
    exists = rows[0].cnt > 0;
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session); // 디버깅용 로그 추가

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { url, color, backgroundColor, size, errorCorrection } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'URL이 필요합니다.' }, { status: 400 });
    }

    // 1. 원래 url로 QR 코드 생성
    const qrDataUrl = await QRCode.toDataURL(url, {
      color: {
        dark: color || '#000000',
        light: backgroundColor || '#ffffff',
      },
      width: size || 200,
      errorCorrectionLevel: errorCorrection || 'M',
    });
    // 2. 중계 url 생성
    const connection = await db.getConnection();
    let redirectCode = '';
    let trackingDataUrl = '';
    let trackingS3Url = '';
    try {
      redirectCode = await generateUniqueCode(connection);
      const trackingUrl = `https://www.spl.it.kr/qr/redirect?code=${redirectCode}`;
      // 3. 중계 url로 QR 코드 생성
      trackingDataUrl = await QRCode.toDataURL(trackingUrl, {
        color: {
          dark: color || '#000000',
          light: backgroundColor || '#ffffff',
        },
        width: size || 200,
        errorCorrectionLevel: errorCorrection || 'M',
      });
      // S3에 업로드할 파일명 생성
      const timestamp = Date.now();
      const fileName = `${session.user.id}/${timestamp}.png`;
      const trackingFileName = `${session.user.id}/${timestamp}_tracking.png`;
      // 원래 QR S3 업로드
      const imageBuffer = base64ToBuffer(qrDataUrl);
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: imageBuffer,
        ContentType: 'image/png',
        ContentLength: imageBuffer.length
      });
      await s3Client.send(command);
      const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      // 트래킹 QR S3 업로드
      const trackingImageBuffer = base64ToBuffer(trackingDataUrl);
      const trackingCommand = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: trackingFileName,
        Body: trackingImageBuffer,
        ContentType: 'image/png',
        ContentLength: trackingImageBuffer.length
      });
      await s3Client.send(trackingCommand);
      trackingS3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${trackingFileName}`;
      // DB 저장
      await connection.execute(
        'INSERT INTO qr_info (id, url, qr_url, tracking_url, status, date, redirect_code) VALUES (?, ?, ?, ?, ?, NOW(), ?)',
        [session.user.id, url, s3Url, trackingS3Url, 1, redirectCode]
      );
      return NextResponse.json({ 
        success: true,
        qrUrl: s3Url,
        trackingUrl: trackingS3Url,
        redirectUrl: trackingUrl
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('QR 코드 생성 에러:', error);
    return NextResponse.json({ error: 'QR 코드 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const connection = await db.getConnection();
    try {
      const [rows]: any = await connection.execute(
        `SELECT q.*, COUNT(a.id) as view_count
         FROM qr_info q
         LEFT JOIN qr_access_log a ON q.redirect_code = a.redirect_code
         WHERE q.id = ? AND q.status = 1
         GROUP BY q.qr_url
         ORDER BY q.date DESC`,
        [session.user.id]
      );

      return NextResponse.json({ qrCodes: rows });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('QR 코드 조회 에러:', error);
    return NextResponse.json({ error: 'QR 코드 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const qrUrl = searchParams.get('qr_url');
    
    if (!qrUrl) {
      return NextResponse.json({ error: 'QR URL이 필요합니다.' }, { status: 400 });
    }

    const connection = await db.getConnection();
    try {
      await connection.execute(
        'UPDATE qr_info SET status = 0 WHERE id = ? AND qr_url = ?',
        [session.user.id, qrUrl]
      );

      return NextResponse.json({ success: true });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('QR 코드 삭제 에러:', error);
    return NextResponse.json({ error: 'QR 코드 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 