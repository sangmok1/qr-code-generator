import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'code 파라미터가 필요합니다.' }, { status: 400 });
  }

  const connection = await pool.getConnection();
  try {
    // 1. code로 원래 url 찾기
    const [rows]: any = await connection.execute(
      'SELECT url FROM qr_info WHERE redirect_code = ? AND status = 1',
      [code]
    );
    if (!rows[0]) {
      return NextResponse.json({ error: '해당 QR 코드가 존재하지 않습니다.' }, { status: 404 });
    }
    let url = rows[0].url;
    // url이 http/https로 시작하지 않으면 자동 보정
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    // 2. 접속 기록 남기기 (auto_increment PK, redirect_code만)
    await connection.execute(
      'INSERT INTO qr_access_log (redirect_code, access_time) VALUES (?, NOW())',
      [code]
    );
    // 3. 원래 url 반환 (리디렉션 X)
    return NextResponse.json({ url });
  } finally {
    connection.release();
  }
} 