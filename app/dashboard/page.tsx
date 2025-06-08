"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Calendar, LinkIcon, LogOut, User, Trash, Home } from "lucide-react"
import { DownloadButton } from "@/components/download-button"
import { SearchBar } from "@/components/search-bar"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// QRCodeErrorCorrectionLevel 타입 직접 정의
type QRCodeErrorCorrectionLevel = "L" | "M" | "Q" | "H";

interface SavedQRCode {
  id: string
  url: string
  color: string
  backgroundColor: string
  size: number
  errorCorrection: string
  createdAt: string
}

interface QRCode {
  url: string;
  qr_url: string;
  date: string;
  redirect_code?: string;
  view_count?: number;
  tracking_url: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [qrCode, setQRCode] = useState("")
  const [isGenerated, setIsGenerated] = useState(false)
  const [color, setColor] = useState("#000000")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [size, setSize] = useState(200)
  const [errorCorrection, setErrorCorrection] = useState<QRCodeErrorCorrectionLevel>("M")
  const [savedQRCodes, setSavedQRCodes] = useState<SavedQRCode[]>([])
  const [filteredQRCodes, setFilteredQRCodes] = useState<SavedQRCode[]>([])
  const [saveMessage, setSaveMessage] = useState("")
  const [showSaveMessage, setShowSaveMessage] = useState(false)
  const qrCodeRef = useRef<SVGSVGElement>(null)
  const qrRefs = useRef<{ [key: string]: SVGSVGElement }>({})
  const [qrCodes, setQrCodes] = useState<QRCode[]>([])
  const [redirectUrl, setRedirectUrl] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalImg, setModalImg] = useState<string | null>(null)
  const [tab, setTab] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dashboardTab") || "generate";
    }
    return "generate";
  });

  // 인증 체크
  useEffect(() => {
    if (status === "loading") return // 로딩 중일 때는 아무것도 하지 않음
    if (!session) {
      router.push("/login")
    }
  }, [session, status, router])

  // 로컬 스토리지에서 저장된 QR 코드들 불러오기 (사용자별로)
  useEffect(() => {
    if (session?.user?.email) {
      const saved = localStorage.getItem(`savedQRCodes_${session.user.email}`)
      if (saved) {
        const parsedCodes = JSON.parse(saved)
        setSavedQRCodes(parsedCodes)
        setFilteredQRCodes(parsedCodes)
      }
    }
  }, [session])

  // 로컬 스토리지에 QR 코드들 저장하기 (사용자별로)
  const saveToLocalStorage = (qrCodes: SavedQRCode[]) => {
    if (session?.user?.email) {
      localStorage.setItem(`savedQRCodes_${session.user.email}`, JSON.stringify(qrCodes))
      setSavedQRCodes(qrCodes)
      setFilteredQRCodes(qrCodes)
    }
  }

  // QR 코드 생성 (저장 X)
  const handleGenerateQRCode = (e: React.FormEvent) => {
    e.preventDefault();
    setQRCode(url);
    setIsGenerated(true);
  };

  // QR 코드 저장 (API 호출)
  const handleSaveQRCode = async () => {
    try {
      const response = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          color,
          backgroundColor,
          size,
          errorCorrection,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setRedirectUrl(data.redirectUrl);
        setQRCode(data.redirectUrl);
        fetchQRCodes();
        setSaveMessage("QR 코드가 성공적으로 저장되었습니다!");
      } else {
        setSaveMessage("QR 코드 저장에 실패했습니다.");
      }
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 3000);
    } catch (error) {
      setSaveMessage("QR 코드 저장에 실패했습니다.");
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 3000);
    }
  };

  const deleteQRCode = async (qrUrl: string) => {
    try {
      const response = await fetch(`/api/qr?qr_url=${encodeURIComponent(qrUrl)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchQRCodes(); // QR 코드 목록 새로고침
      } else {
        console.error('QR 코드 삭제 실패');
      }
    } catch (error) {
      console.error('QR 코드 삭제 실패:', error);
    }
  }

  const deleteAllQRCodes = () => {
    saveToLocalStorage([])
  }

  const resetGenerator = () => {
    setUrl("")
    setQRCode("")
    setIsGenerated(false)
    setColor("#000000")
    setBackgroundColor("#ffffff")
    setSize(200)
    setErrorCorrection("M")
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  const handleGoHome = () => {
    router.push("/")
  }

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredQRCodes(savedQRCodes)
      return
    }

    const filtered = savedQRCodes.filter((qr) => qr.url.toLowerCase().includes(query.toLowerCase()))
    setFilteredQRCodes(filtered)
  }

  useEffect(() => {
    if (session?.user) {
      fetchQRCodes();
    }
  }, [session]);

  const fetchQRCodes = async () => {
    try {
      const response = await fetch('/api/qr');
      const data = await response.json();
      if (data.qrCodes) {
        setQrCodes(data.qrCodes);
      }
    } catch (error) {
      console.error('QR 코드 조회 실패:', error);
    }
  };

  // 이미지 클릭 핸들러
  const handleImgClick = (imgUrl: string) => {
    setModalImg(imgUrl);
    setModalOpen(true);
  };

  const handleTabChange = (value: string) => {
    setTab(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboardTab", value);
    }
  };

  // 로딩 중이거나 세션이 없으면 로딩 표시
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

  if (!session) {
    return null // 리다이렉트 중
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* 헤더 */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <User className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">내 QR 대시보드</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="outline" onClick={handleGoHome}>홈으로</Button>
          <Button variant="destructive" onClick={handleSignOut}>로그아웃</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-8 flex gap-2">
            <TabsTrigger value="generate">QR 코드 생성</TabsTrigger>
            <TabsTrigger value="saved">내 QR 목록</TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            {/* QR 생성 폼 및 미리보기 */}
            <form onSubmit={handleGenerateQRCode} className="flex flex-col gap-4 max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <input
                type="text"
                placeholder="URL을 입력하세요"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <div className="flex gap-4 w-full">
                <div className="flex flex-col items-start">
                  <label className="text-sm mb-1">색상</label>
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} />
                </div>
                <div className="flex flex-col items-start">
                  <label className="text-sm mb-1">배경색</label>
                  <input type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} />
                </div>
                <div className="flex flex-col items-start">
                  <label className="text-sm mb-1">크기</label>
                  <input type="number" min={100} max={400} value={size} onChange={e => setSize(Number(e.target.value))} className="w-20" />
                </div>
                <div className="flex flex-col items-start">
                  <label className="text-sm mb-1">정확도</label>
                  <select value={errorCorrection} onChange={e => setErrorCorrection(e.target.value as QRCodeErrorCorrectionLevel)}>
                    <option value="L">L</option>
                    <option value="M">M</option>
                    <option value="Q">Q</option>
                    <option value="H">H</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="lg" className="w-full">QR 코드 미리보기</Button>
                {isGenerated && (
                  <Button type="button" variant="outline" onClick={resetGenerator}>초기화</Button>
                )}
              </div>
            </form>
            {isGenerated && url && (
              <div className="mt-8 flex flex-col items-center">
                <QRCodeSVG
                  ref={qrCodeRef as any}
                  value={url}
                  size={size}
                  fgColor={color}
                  bgColor={backgroundColor}
                  level={errorCorrection}
                />
                <div className="flex flex-col sm:flex-row gap-2 items-center mt-4">
                  <Button onClick={handleSaveQRCode} variant="secondary">QR 코드 저장</Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved">
            {/* 내 QR 목록: DB에서 불러온 정적/추적 QR, 조회수, 생성일, 툴팁 안내 */}
            <div className="mb-4 text-right text-gray-700 dark:text-gray-300">
              총 <span className="font-bold text-blue-600">{qrCodes.length}</span>개의 QR 코드
            </div>
            {qrCodes.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                저장된 QR 코드가 없습니다.<br />
                상단에서 새 QR 코드를 생성하고 저장해보세요!
              </div>
            ) : (
              <div className="grid gap-4">
                {qrCodes.map((qr: any) => (
                  <Card key={qr.qr_url} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* 정적 QR */}
                        <div className="flex flex-col items-center">
                          <img src={qr.qr_url} alt="정적 QR 코드" className="w-20 h-20 cursor-pointer" onClick={() => handleImgClick(qr.qr_url)} />
                          <div className="text-xs mt-1">정적 QR</div>
                        </div>
                        {/* 추적 QR + 툴팁 */}
                        <div className="flex flex-col items-center relative">
                          <img src={qr.tracking_url} alt="추적 QR 코드" className="w-20 h-20 cursor-pointer" onClick={() => handleImgClick(qr.tracking_url)} />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="absolute top-0 right-0 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs focus:outline-none">?</button>
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                이 QR로 접근 시 접속 통계가 기록됩니다.
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div className="text-xs mt-1">추적 QR</div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4" />
                            <span className="font-medium break-all">{qr.url}</span>
                          </div>
                          <div className="text-xs text-gray-500 break-all">
                            중계 URL: https://www.spl.it.kr/qr/redirect?code={qr.redirect_code}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{qr.date ? new Date(qr.date).toLocaleString("ko-KR") : "-"}</span>
                          </div>
                          {typeof qr.view_count === 'number' && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <span>조회수: {qr.view_count}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col gap-2 self-end sm:self-start">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteQRCode(qr.qr_url)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          삭제
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* 저장/삭제/조회 UX 개선: 저장/삭제/조회 시 알림 메시지 */}
        {showSaveMessage && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded shadow-lg z-50">
            {saveMessage}
          </div>
        )}
      </main>

      {/* QR 이미지 확대 모달 */}
      {modalOpen && modalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setModalOpen(false)}>
          <div className="bg-white p-4 rounded shadow-lg max-w-full max-h-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img src={modalImg} alt="확대 QR 코드" className="max-w-[90vw] max-h-[80vh]" />
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setModalOpen(false)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  )
}
