"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Download, Shield, Zap, Users } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { AdBanner } from "@/components/ad-banner"
import { useEffect, useState } from "react"
import { QRCodeSVG } from "qrcode.react"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // 비로그인 임시 QR 생성 상태
  const [tempUrl, setTempUrl] = useState("");
  const [tempColor, setTempColor] = useState("#000000");
  const [tempBgColor, setTempBgColor] = useState("#ffffff");
  const [tempSize, setTempSize] = useState(200);
  const [tempErrorCorrection, setTempErrorCorrection] = useState("M");
  const [isTempGenerated, setIsTempGenerated] = useState(false);

  const handleTempGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTempGenerated(true);
  };

  const handleGetStarted = () => {
    router.push("/login")
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* 헤더 */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <QrCode className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Generator</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 py-12">
        {/* 히어로 섹션 */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            QR 코드를
            <span className="text-blue-600"> 쉽고 빠르게</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            URL을 입력하고 나만의 스타일로 QR 코드를 생성하세요. 구글 계정으로 로그인하여 QR 코드를 저장하고 관리할 수
            있습니다.
          </p>
          <Button onClick={handleGetStarted} size="lg" className="text-lg px-8 py-4">
            구글 로그인으로 QR코드 관리하기
          </Button>
        </div>

        {/* 비로그인 QR 생성 폼 */}
        {status !== "authenticated" && (
          <div className="max-w-xl mx-auto mb-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">로그인 없이 QR 코드 만들기</h3>
            <form onSubmit={handleTempGenerate} className="flex flex-col gap-4 items-center">
              <input
                type="text"
                placeholder="URL을 입력하세요"
                value={tempUrl}
                onChange={e => setTempUrl(e.target.value)}
                className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <div className="flex gap-4 w-full">
                <div className="flex flex-col items-start">
                  <label className="text-sm mb-1">색상</label>
                  <input type="color" value={tempColor} onChange={e => setTempColor(e.target.value)} />
                </div>
                <div className="flex flex-col items-start">
                  <label className="text-sm mb-1">배경색</label>
                  <input type="color" value={tempBgColor} onChange={e => setTempBgColor(e.target.value)} />
                </div>
                <div className="flex flex-col items-start">
                  <label className="text-sm mb-1">크기</label>
                  <input type="number" min={100} max={400} value={tempSize} onChange={e => setTempSize(Number(e.target.value))} className="w-20" />
                </div>
                <div className="flex flex-col items-start">
                  <label className="text-sm mb-1">정확도</label>
                  <select value={tempErrorCorrection} onChange={e => setTempErrorCorrection(e.target.value)}>
                    <option value="L">L</option>
                    <option value="M">M</option>
                    <option value="Q">Q</option>
                    <option value="H">H</option>
                  </select>
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full">QR 코드 생성</Button>
            </form>
            {isTempGenerated && tempUrl && (
              <div className="mt-8 flex flex-col items-center">
                <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
                  <QRCodeSVG
                    value={tempUrl}
                    size={tempSize}
                    fgColor={tempColor}
                    bgColor={tempBgColor}
                    level={tempErrorCorrection as any}
                  />
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">이 QR 코드는 새로고침하면 사라집니다.</p>
                <div className="mt-4">
                  <Button onClick={handleGetStarted} variant="outline">QR 저장/관리는 로그인 필요</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 기능 소개 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>빠른 생성</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                URL을 입력하면 즉시 QR 코드가 생성됩니다. 색상과 크기를 자유롭게 커스터마이징하세요.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Download className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>다양한 형식</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                SVG와 PNG 형식으로 QR 코드를 다운로드할 수 있습니다. 고품질 벡터 이미지를 지원합니다.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>안전한 저장</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                구글 계정으로 로그인하여 QR 코드를 안전하게 저장하고 언제든지 다시 사용할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* QR 코드 미리보기 */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">이런 QR 코드를 만들 수 있어요</h3>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">기본 스타일</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="w-32 h-32 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="h-16 w-16 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">컬러 스타일</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="w-32 h-32 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="h-16 w-16 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">커스텀 스타일</p>
            </div>
          </div>
        </div>

        {/* 광고 배너 */}
        {/* <AdBanner /> */}
      </main>

      {/* 푸터 */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
        <p>&copy; 2024 QR Generator. Made by luckyviki</p>
      </footer>
    </div>
  )
}
