import { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function ArtQRGenerator({ disabled }: { disabled: boolean }) {
  const [image, setImage] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrColor, setQrColor] = useState("#000000");
  const [qrAlpha, setQrAlpha] = useState(1);
  const [qrRound, setQrRound] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // 이미지 업로드 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // 합성 핸들러
  const handleCompose = async () => {
    if (!image || !url) return;
    setLoading(true);
    const img = new window.Image();
    img.src = URL.createObjectURL(image);
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // QR코드 이미지를 미리 렌더링한 뒤, 그 이미지를 합성
      const qrCanvas = qrCanvasRef.current!;
      const qrSize = Math.min(img.width, img.height) / 2;
      // 투명도 적용
      ctx.save();
      ctx.globalAlpha = qrAlpha;
      ctx.drawImage(
        qrCanvas,
        (img.width - qrSize) / 2,
        (img.height - qrSize) / 2,
        qrSize,
        qrSize
      );
      ctx.restore();
      setPreview(canvas.toDataURL("image/png"));
      setLoading(false);
    };
  };

  // 저장 핸들러(예시)
  const handleSave = async () => {
    if (!preview) return;
    alert("저장 기능은 추후 구현 예정입니다.");
  };

  // 라운드 스타일 QR 렌더링용 커스텀 컴포넌트
  function CustomQRCodeCanvas(props: any) {
    // qrcode.react의 renderAs="canvas"는 도트 스타일 지원이 없으므로,
    // 도트 스타일은 추후 커스텀 라이브러리로 확장 가능
    return (
      <QRCodeCanvas
        value={props.value}
        size={props.size}
        level="M"
        includeMargin={true}
        bgColor="#ffffff00"
        fgColor={qrColor}
        // 도트 스타일은 기본 네모로, 추후 커스텀 가능
      />
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col gap-4 items-center">
      <div className="text-center mb-2 text-gray-800 dark:text-gray-100 font-semibold">
        내가 원하는 이미지에 QR을 심어서 사용할 수 있습니다. (계정당 최대 3회)
      </div>
      <input type="file" accept="image/*" onChange={handleImageChange} disabled={disabled} />
      <input type="text" placeholder="QR에 넣을 URL" value={url} onChange={e => setUrl(e.target.value)} disabled={disabled} className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" />
      <div className="flex gap-4 w-full items-center">
        <div className="flex flex-col items-start">
          <label className="text-sm mb-1">QR 색상</label>
          <input type="color" value={qrColor} onChange={e => setQrColor(e.target.value)} />
        </div>
        <div className="flex flex-col items-start">
          <label className="text-sm mb-1">투명도</label>
          <input type="range" min={0.2} max={1} step={0.05} value={qrAlpha} onChange={e => setQrAlpha(Number(e.target.value))} />
          <span className="text-xs">{Math.round(qrAlpha * 100)}%</span>
        </div>
        <div className="flex flex-col items-start">
          <label className="text-sm mb-1">라운드 스타일</label>
          <input type="checkbox" checked={qrRound} onChange={e => setQrRound(e.target.checked)} disabled />
          <span className="text-xs text-gray-400">(준비중)</span>
        </div>
      </div>
      {/* 숨겨진 QR코드 canvas */}
      <div style={{ position: "absolute", left: -9999, top: -9999 }}>
        <QRCodeCanvas
          value={url || " "}
          size={300}
          level="M"
          includeMargin={true}
          bgColor="#ffffff00"
          fgColor={qrColor}
          ref={qrCanvasRef}
        />
      </div>
      <button onClick={handleCompose} disabled={disabled || !image || !url || loading} className="bg-blue-600 text-white px-4 py-2 rounded">합성</button>
      {loading && <div className="text-blue-600 font-semibold mt-2">생성중입니다.</div>}
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {preview && !loading && (
        <div className="flex flex-col items-center gap-2">
          <img src={preview} alt="아트 QR 미리보기" style={{ maxWidth: 300 }} />
          <button onClick={handleSave} disabled={disabled} className="bg-green-600 text-white px-4 py-2 rounded">저장</button>
        </div>
      )}
      {disabled && <div className="text-red-500 mt-2">아트 QR 생성은 3회까지만 가능합니다.</div>}
    </div>
  );
} 