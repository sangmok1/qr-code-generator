"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface DownloadButtonProps {
  svgRef: React.RefObject<SVGSVGElement>
  url: string
  size: number
  fileName?: string
}

export function DownloadButton({ svgRef, url, size, fileName = "qrcode" }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadSVG = () => {
    if (!svgRef.current) return

    setIsDownloading(true)
    try {
      // SVG 요소에서 SVG 문자열 가져오기
      const svgElement = svgRef.current
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)

      // 다운로드 링크 생성
      const downloadLink = document.createElement("a")
      downloadLink.href = svgUrl
      downloadLink.download = `${fileName}.svg`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(svgUrl)
    } catch (error) {
      console.error("SVG 다운로드 중 오류 발생:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  const downloadPNG = () => {
    if (!svgRef.current) return

    setIsDownloading(true)
    try {
      // SVG 요소에서 SVG 문자열 가져오기
      const svgElement = svgRef.current
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)

      // 이미지 생성
      const img = new Image()
      img.onload = () => {
        // 캔버스 생성
        const canvas = document.createElement("canvas")
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          console.error("Canvas 2D context를 가져올 수 없습니다.")
          setIsDownloading(false)
          return
        }

        // 이미지를 캔버스에 그리기
        ctx.drawImage(img, 0, 0)

        // PNG로 변환하여 다운로드
        canvas.toBlob((blob) => {
          if (!blob) {
            console.error("PNG 변환 중 오류가 발생했습니다.")
            setIsDownloading(false)
            return
          }

          const pngUrl = URL.createObjectURL(blob)
          const downloadLink = document.createElement("a")
          downloadLink.href = pngUrl
          downloadLink.download = `${fileName}.png`
          document.body.appendChild(downloadLink)
          downloadLink.click()
          document.body.removeChild(downloadLink)
          URL.revokeObjectURL(pngUrl)
          setIsDownloading(false)
        }, "image/png")
      }

      img.onerror = () => {
        console.error("이미지 로드 중 오류가 발생했습니다.")
        setIsDownloading(false)
      }

      img.src = svgUrl
    } catch (error) {
      console.error("PNG 다운로드 중 오류 발생:", error)
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={downloadSVG}
        disabled={isDownloading}
        className="flex items-center gap-1"
      >
        <Download className="h-4 w-4" />
        SVG
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={downloadPNG}
        disabled={isDownloading}
        className="flex items-center gap-1"
      >
        <Download className="h-4 w-4" />
        PNG
      </Button>
    </div>
  )
}
