"use client"

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function QRRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [targetUrl, setTargetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAndRedirect() {
      if (!code) {
        setError("code 파라미터가 필요합니다.");
        return;
      }
      try {
        // DB에서 원래 url 조회 및 카운트 저장 API 호출
        const res = await fetch(`/api/qr/redirect?code=${encodeURIComponent(code)}`);
        const data = await res.json();
        if (res.status !== 200 || !data.url) {
          setError(data.error || "잘못된 QR 코드입니다.");
          return;
        }
        setTargetUrl(data.url);
        setTimeout(() => {
          window.location.href = data.url;
        }, 1500);
      } catch (e) {
        setError("서버 오류가 발생했습니다.");
      }
    }
    fetchAndRedirect();
  }, [code]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow text-center">
          <div className="text-red-600 font-bold mb-2">에러</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow text-center">
        <div className="text-lg font-bold mb-4">잠시만 기다려 주세요</div>
        {targetUrl ? (
          <div>
            <div className="mb-2">곧 아래 주소로 이동합니다:</div>
            <div className="text-blue-600 break-all">{targetUrl}</div>
          </div>
        ) : (
          <div>이동할 주소를 불러오는 중입니다...</div>
        )}
      </div>
    </div>
  );
} 