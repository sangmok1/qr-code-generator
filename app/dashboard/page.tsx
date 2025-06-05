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
import type { QRCodeErrorCorrectionLevel } from "qrcode.react"

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

  const generateQRCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setQRCode(url)
    setIsGenerated(true)

    try {
      const response = await fetch('/api/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (data.success) {
        fetchQRCodes(); // QR 코드 목록 새로고침
        setSaveMessage("QR 코드가 성공적으로 저장되었습니다!");
      } else {
        setSaveMessage("QR 코드 저장에 실패했습니다.");
      }
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 3000);
    } catch (error) {
      console.error('QR 코드 저장 실패:', error);
      setSaveMessage("QR 코드 저장에 실패했습니다.");
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 3000);
    }
  }

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      {/* 헤더 */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-gray-600 dark:text-gray-300" />
            <div>
              <p className="font-medium">{session.user?.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{session.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleGoHome}>
              <Home className="h-4 w-4 mr-2" />홈
            </Button>
            <ThemeToggle />
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Static QR Code Generator</CardTitle>
            <p className="text-center text-muted-foreground mt-2">Generate and manage static QR codes</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="generate" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="generate">QR 코드 생성</TabsTrigger>
                <TabsTrigger value="saved">저장된 QR 코드 ({savedQRCodes.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="generate" className="space-y-4">
                <form onSubmit={generateQRCode} className="space-y-4">
                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="Enter a URL"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                      className="w-full"
                      disabled={isGenerated}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="color">QR Code Color</Label>
                      <Input
                        id="color"
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full h-10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="backgroundColor">Background Color</Label>
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-full h-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="size">
                      Size: {size}x{size}
                    </Label>
                    <Slider
                      id="size"
                      min={100}
                      max={400}
                      step={10}
                      value={[size]}
                      onValueChange={(value) => setSize(value[0])}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="errorCorrection">Error Correction Level</Label>
                    <Select value={errorCorrection} onValueChange={(value: QRCodeErrorCorrectionLevel) => setErrorCorrection(value)}>
                      <SelectTrigger id="errorCorrection">
                        <SelectValue placeholder="Select error correction level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Low (7%)</SelectItem>
                        <SelectItem value="M">Medium (15%)</SelectItem>
                        <SelectItem value="Q">Quartile (25%)</SelectItem>
                        <SelectItem value="H">High (30%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={isGenerated}>
                      Generate Static QR Code
                    </Button>
                    {isGenerated && (
                      <Button type="button" variant="outline" onClick={resetGenerator}>
                        Reset
                      </Button>
                    )}
                  </div>
                </form>

                {qrCode && (
                  <div className="flex flex-col items-center space-y-4 mt-6">
                    <QRCodeSVG
                      ref={qrCodeRef}
                      value={qrCode}
                      size={size}
                      fgColor={color}
                      bgColor={backgroundColor}
                      level={errorCorrection}
                      includeMargin={true}
                    />
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                      <Button onClick={generateQRCode} variant="secondary">
                        QR 코드 저장
                      </Button>
                      <DownloadButton
                        svgRef={qrCodeRef}
                        url={qrCode}
                        size={size}
                        fileName={`qrcode-${new Date().getTime()}`}
                      />
                    </div>
                    {showSaveMessage && (
                      <div
                        className={`text-center text-sm p-2 rounded ${
                          saveMessage.includes("성공") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {saveMessage}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="saved" className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                  <SearchBar onSearch={handleSearch} />
                  {savedQRCodes.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex items-center gap-1">
                          <Trash className="h-4 w-4" />
                          전체 삭제
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>모든 QR 코드 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            저장된 모든 QR 코드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction onClick={deleteAllQRCodes}>삭제</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                {qrCodes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    저장된 QR 코드가 없습니다.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {qrCodes.map((qr) => (
                      <Card key={qr.qr_url} className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <img src={qr.qr_url} alt="QR Code" className="w-20 h-20" />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <LinkIcon className="h-4 w-4" />
                                <span className="font-medium break-all">{qr.url}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(qr.date).toLocaleString("ko-KR")}</span>
                              </div>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
