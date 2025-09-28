import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export default function QRGenerator({ value, size = 200, className = "" }: QRGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    }).catch((error) => {
      console.error("Failed to generate QR code:", error);
    });
  }, [value, size]);

  return (
    <div className={`inline-block ${className}`}>
      <canvas
        ref={canvasRef}
        className="border border-gray-200 rounded-lg"
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </div>
  );
}

