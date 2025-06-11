import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { title, content, replyEmail } = await req.json();
    if (!title || !content || !replyEmail) {
      return NextResponse.json({ error: '제목, 내용, 회신 이메일을 모두 입력해 주세요.' }, { status: 400 });
    }

    // 환경변수에서 메일 주소와 SMTP 정보 읽기
    const to = process.env.CONTACT_EMAIL;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465;

    if (!to || !smtpUser || !smtpPass || !smtpHost) {
      return NextResponse.json({ error: '메일 서버 설정이 누락되었습니다.' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // 465: SSL, 587: TLS
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailBody = `회신받을 메일주소: ${replyEmail}\n\n${content}`;

    await transporter.sendMail({
      from: smtpUser,
      to,
      subject: `[Contact] ${title}`,
      text: mailBody,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '메일 전송 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 