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
import FooterClient from "@/components/footer-client"
import { useLanguage } from "@/hooks/use-language"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, isLoading: langLoading } = useLanguage()

  // Temporary QR generation state for non-logged in users
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

  if (status === "loading" || langLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>{t.common.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <QrCode className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Generator</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {t.home.title}
            <span className="text-blue-600">{t.home.subtitle}</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {t.home.description}
          </p>
          <Button onClick={handleGetStarted} size="lg" className="text-lg px-8 py-4">
            {t.home.loginButton}
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 max-w-md mx-auto">
            {t.home.privacyNotice}
          </p>
        </div>

        {/* Non-logged in QR generation form */}
        {status !== "authenticated" && (
          <div className="max-w-xl mx-auto mb-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t.home.tempQrTitle}</h3>
            <form onSubmit={handleTempGenerate} className="flex flex-col gap-4 items-center">
              <input
                type="text"
                placeholder={t.home.tempQrPlaceholder}
                value={tempUrl}
                onChange={e => setTempUrl(e.target.value)}
                className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <div className="flex gap-4 w-full">
                <div className="flex flex-col items-start">
                  <label className="text-sm mb-1">{t.common.labels.color}</label>
                  <input type="color" value={tempColor} onChange={e => setTempColor(e.target.value)} />
                </div>
                <div className="flex flex-col items-start">
                  <label className="text-sm mb-1">{t.common.labels.background}</label>
                  <input type="color" value={tempBgColor} onChange={e => setTempBgColor(e.target.value)} />
                </div>
                <div className="flex flex-col items-start">
                  <label className="text-sm mb-1">{t.common.labels.size}</label>
                  <input type="number" min={100} max={400} value={tempSize} onChange={e => setTempSize(Number(e.target.value))} className="w-20" />
                </div>
                <div className="flex flex-col items-start">
                  <label className="text-sm mb-1">{t.common.labels.errorLevel}</label>
                  <select value={tempErrorCorrection} onChange={e => setTempErrorCorrection(e.target.value)}>
                    <option value="L">L</option>
                    <option value="M">M</option>
                    <option value="Q">Q</option>
                    <option value="H">H</option>
                  </select>
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full">{t.home.tempQrGenerate}</Button>
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
                <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">{t.home.tempQrNote}</p>
                <div className="mt-4">
                  <Button onClick={handleGetStarted} variant="outline">{t.home.tempQrLoginRequired}</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Features Introduction */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>{t.home.features.fast.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                {t.home.features.fast.description}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Download className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>{t.home.features.formats.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                {t.home.features.formats.description}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>{t.home.features.secure.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                {t.home.features.secure.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Preview */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t.home.preview.title}</h3>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">{t.home.preview.basic}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="w-32 h-32 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="h-16 w-16 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">{t.home.preview.color}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="w-32 h-32 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="h-16 w-16 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">{t.home.preview.custom}</p>
            </div>
          </div>
        </div>

        {/* Ad Banner */}
        {/* <AdBanner /> */}
      </main>
      <FooterClient />
    </div>
  )
}
