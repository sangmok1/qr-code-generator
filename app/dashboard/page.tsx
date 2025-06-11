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
import ArtQRGenerator from "@/components/art-qr-generator"
import { useLanguage } from "@/hooks/use-language"

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
  const { t, isLoading: langLoading } = useLanguage()
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
  const [artQrCount, setArtQrCount] = useState(0);

  // Authentication check
  useEffect(() => {
    if (status === "loading") return // Do nothing while loading
    if (!session) {
      router.push("/login")
    }
  }, [session, status, router])

  // Load saved QR codes from local storage (per user)
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

  // Save QR codes to local storage (per user)
  const saveToLocalStorage = (qrCodes: SavedQRCode[]) => {
    if (session?.user?.email) {
      localStorage.setItem(`savedQRCodes_${session.user.email}`, JSON.stringify(qrCodes))
      setSavedQRCodes(qrCodes)
      setFilteredQRCodes(qrCodes)
    }
  }

  // Generate QR code (without saving)
  const handleGenerateQRCode = (e: React.FormEvent) => {
    e.preventDefault();
    setQRCode(url);
    setIsGenerated(true);
  };

  // Save QR code (API call)
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
        setSaveMessage(t.dashboard.messages.saveSuccess);
      } else {
        setSaveMessage(t.dashboard.messages.saveError);
      }
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 3000);
    } catch (error) {
      setSaveMessage(t.dashboard.messages.saveError);
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
        fetchQRCodes(); // Refresh QR code list
      } else {
        console.error('Failed to delete QR code');
      }
    } catch (error) {
      console.error('Failed to delete QR code:', error);
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

  // Show loading if loading or no session
  if (status === "loading" || langLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>{t ? t.common.loading : "Loading..."}</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Redirecting
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <User className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="outline" onClick={handleGoHome}>{t.dashboard.homeButton}</Button>
          <Button variant="destructive" onClick={handleSignOut}>{t.dashboard.logoutButton}</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-8 flex gap-2">
            <TabsTrigger value="generate">{t.dashboard.tabs.generate}</TabsTrigger>
            <TabsTrigger value="saved">{t.dashboard.tabs.saved}</TabsTrigger>
            <TabsTrigger value="art">{t.dashboard.tabs.art}</TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            {/* QR generation form and preview */}
            <form onSubmit={handleGenerateQRCode} className="flex flex-col gap-4 max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <input
                type="text"
                placeholder="Enter URL"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <div className="flex gap-4 w-full">
                <div className="flex flex-col items-start">
                  <label className="text-sm mb-1">Color</label>
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} />
                </div>
                <div className="flex flex-col items-start">
                  <label className="text-sm mb-1">Background</label>
                  <input type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} />
                </div>
                <div className="flex flex-col items-start">
                  <label className="text-sm mb-1">Size</label>
                  <input type="number" min={100} max={400} value={size} onChange={e => setSize(Number(e.target.value))} className="w-20" />
                </div>
                <div className="flex flex-col items-start">
                  <label className="text-sm mb-1">Error Level</label>
                  <select value={errorCorrection} onChange={e => setErrorCorrection(e.target.value as QRCodeErrorCorrectionLevel)}>
                    <option value="L">L</option>
                    <option value="M">M</option>
                    <option value="Q">Q</option>
                    <option value="H">H</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="lg" className="w-full">QR Code Preview</Button>
                {isGenerated && (
                  <Button type="button" variant="outline" onClick={resetGenerator}>Reset</Button>
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
                  <Button onClick={handleSaveQRCode} variant="secondary">Save QR Code</Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved">
            {/* My QR List: Static/Tracking QR from DB, view count, creation date, tooltip guide */}
            <div className="mb-4 text-right text-gray-700 dark:text-gray-300">
              Total <span className="font-bold text-blue-600">{qrCodes.length}</span> QR codes
            </div>
            {qrCodes.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                No saved QR codes.<br />
                Generate and save new QR codes from the tab above!
              </div>
            ) : (
              <div className="grid gap-4">
                {qrCodes.map((qr: any) => (
                  <Card key={qr.qr_url} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Static QR */}
                        <div className="flex flex-col items-center">
                          <img src={qr.qr_url} alt="Static QR Code" className="w-20 h-20 cursor-pointer" onClick={() => handleImgClick(qr.qr_url)} />
                          <div className="text-xs mt-1">Static QR</div>
                        </div>
                        {/* Tracking QR + Tooltip */}
                        <div className="flex flex-col items-center relative">
                          <img src={qr.tracking_url} alt="Tracking QR Code" className="w-20 h-20 cursor-pointer" onClick={() => handleImgClick(qr.tracking_url)} />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="absolute top-0 right-0 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs focus:outline-none">?</button>
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                Access statistics are recorded when using this QR code.
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div className="text-xs mt-1">Tracking QR</div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4" />
                            <span className="font-medium break-all">{qr.url}</span>
                          </div>
                          <div className="text-xs text-gray-500 break-all">
                            Redirect URL: https://www.spl.it.kr/qr/redirect?code={qr.redirect_code}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{qr.date ? new Date(qr.date).toLocaleString("en-US") : "-"}</span>
                          </div>
                          {typeof qr.view_count === 'number' && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <span>Views: {qr.view_count}</span>
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
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="art">
            <ArtQRGenerator disabled={artQrCount >= 3} />
          </TabsContent>
        </Tabs>

        {/* Save/Delete/View UX improvement: notification messages */}
        {showSaveMessage && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded shadow-lg z-50">
            {saveMessage}
          </div>
        )}
      </main>

      {/* QR image zoom modal */}
      {modalOpen && modalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setModalOpen(false)}>
          <div className="bg-white p-4 rounded shadow-lg max-w-full max-h-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img src={modalImg} alt="Enlarged QR Code" className="max-w-[90vw] max-h-[80vh]" />
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
