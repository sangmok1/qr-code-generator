import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pool from '@/lib/db';
import QRCode from 'qrcode';
import { authOptions } from '../auth/[...nextauth]/route';
import { s3Client } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';

// Base64 데이터를 Buffer로 변환하는 함수
function base64ToBuffer(base64: string) {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'URL이 필요합니다.' }, { status: 400 });
    }

    // QR 코드 생성
    const qrDataUrl = await QRCode.toDataURL(url);
    
    // S3에 업로드할 파일명 생성
    const timestamp = Date.now();
    const fileName = `${session.user.id}/${timestamp}.png`;

    // QR 코드 이미지를 S3에 업로드
    try {
      const imageBuffer = base64ToBuffer(qrDataUrl);
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: imageBuffer,
        ContentType: 'image/png',
        ACL: 'public-read',
      }));
    } catch (error) {
      console.error('S3 업로드 에러:', error);
      return NextResponse.json({ error: 'QR 코드 이미지 업로드에 실패했습니다.' }, { status: 500 });
    }

    // S3 URL 생성
    const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // DB에 저장
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'INSERT INTO qr_info (id, url, qr_url, status, date) VALUES (?, ?, ?, ?, NOW())',
        [session.user.id, url, s3Url, 1]
      );

      return NextResponse.json({ 
        success: true,
        qrUrl: s3Url
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

    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM qr_info WHERE id = ? AND status = 1 ORDER BY date DESC',
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

    const connection = await pool.getConnection();
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