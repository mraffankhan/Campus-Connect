"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Camera, RefreshCw, QrCode } from "lucide-react";
import { toast } from "sonner";

interface QRScannerProps {
  eventId: string;
  onScanSuccess?: () => void;
}

export function QRScanner({ eventId, onScanSuccess }: QRScannerProps) {
  const [lastScannedResult, setLastScannedResult] = useState<{
    name: string;
    department: string | null;
    time: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader-container",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      async (decodedText: string) => {
        try {
          const res = await fetch("/api/attendance/check-in", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: decodedText }),
          });

          const data = await res.json();

          if (!data.success) {
            setErrorMsg(data.error);
            toast.error(data.error);
            return;
          }

          setErrorMsg(null);
          setLastScannedResult({
            name: data.data.studentName,
            department: data.data.department,
            time: data.data.time,
          });

          toast.success(`Checked in: ${data.data.studentName}!`);
          if (onScanSuccess) onScanSuccess();
        } catch {
          toast.error("Failed to process QR check-in");
        }
      },
      (error) => {
        // Ignored scan frame errors
      }
    );

    setIsScanning(true);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [eventId, onScanSuccess]);

  return (
    <div className="space-y-4">
      {/* Scanner viewfinder */}
      <div className="rounded-2xl border-2 border-primary/30 p-4 bg-black/5 dark:bg-black/20 overflow-hidden text-center">
        <div id="qr-reader-container" className="mx-auto max-w-sm rounded-xl overflow-hidden" />
      </div>

      {/* Realtime Scan Result Card */}
      {lastScannedResult && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">{lastScannedResult.name}</p>
              <p className="text-xs opacity-90">
                {lastScannedResult.department || "Student"} • Checked in at {lastScannedResult.time}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20">
            CONFIRMED
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 text-sm rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
