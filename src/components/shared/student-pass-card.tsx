"use client";

import { useState, useRef } from "react";
import { Sparkles, QrCode, ShieldCheck, Wifi } from "lucide-react";

interface StudentPassCardProps {
  name?: string;
  role?: string;
  department?: string;
  year?: number | string;
  studentId?: string;
}

export function StudentPassCard({
  name = "Liam Johnson",
  role = "Verified Student",
  department = "Computer Science",
  year = "2026",
  studentId = "CC-84920-CS",
}: StudentPassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [sheenStyle, setSheenStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: "transform 0.1s ease-out",
    });

    setSheenStyle({
      background: `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.35), rgba(240, 0, 16, 0.25) 30%, transparent 60%)`,
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.5s ease-out",
    });
    setSheenStyle({});
  };

  return (
    <div className="relative flex justify-center items-center py-6">
      {/* Background radial glow */}
      <div className="absolute w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle,rgba(240,0,16,0.45),rgba(160,0,16,0.18)_55%,transparent_75%)] blur-3xl pointer-events-none" />

      {/* The 3D Interactive ID Card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={style}
        className="relative w-full max-w-[340px] aspect-[5/7] rounded-[24px] overflow-hidden p-6 flex flex-col justify-between border-2 border-primary bg-gradient-to-b from-[#180204] via-[#090102] to-[#140103] shadow-[0_0_40px_rgba(240,0,16,0.6),inset_0_0_20px_rgba(240,0,16,0.3),0_30px_60px_-15px_rgba(0,0,0,0.95)] cursor-pointer select-none group"
      >
        {/* Dynamic Sheen overlay */}
        <div
          style={sheenStyle}
          className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-300"
        />

        {/* Tactical grid background inside card */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(240,0,16,0.18)_1.5px,transparent_1.5px)] bg-[size:16px_16px] pointer-events-none opacity-50" />

        {/* Card Top: Brand & Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-white shadow-[0_0_12px_#f00010]">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-heading font-bold text-sm tracking-wider uppercase text-white">
              Campus<span className="text-primary">Connect</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-primary/50 bg-black/60 shadow-[0_0_14px_rgba(240,0,16,0.3)]">
            <span className="pulse-dot" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-rose-300 font-medium">
              PASS // ACTIVE
            </span>
          </div>
        </div>

        {/* Card Middle: Student Profile Visual */}
        <div className="relative z-10 my-auto py-4 space-y-3">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-xl border-2 border-primary/60 bg-gradient-to-br from-primary/30 to-black p-1 shadow-[0_0_20px_rgba(240,0,16,0.4)] flex items-center justify-center overflow-hidden">
              <span className="font-heading font-extrabold text-2xl text-white">
                {name.split(" ").map((n) => n[0]).join("")}
              </span>
              <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-primary text-[11px] font-mono uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{role}</span>
              </div>
              <h3 className="font-heading font-bold text-2xl uppercase tracking-wide text-white leading-tight">
                {name}
              </h3>
              <p className="font-mono text-xs text-[#cca0a4] tracking-wide">
                {department}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-primary/20 font-mono text-xs">
            <div>
              <span className="text-[10px] text-[#cca0a4] uppercase block">ID Number</span>
              <span className="font-semibold text-white">{studentId}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#cca0a4] uppercase block">Batch / Class</span>
              <span className="font-semibold text-white">Class of {year}</span>
            </div>
          </div>
        </div>

        {/* Card Footer: Fast QR Code & RFID tag */}
        <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-black/80 border border-primary/40 shadow-[0_0_14px_rgba(240,0,16,0.3)]">
              <QrCode className="w-8 h-8 text-primary" />
            </div>
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#cca0a4] block">
                Access Token
              </span>
              <span className="font-mono text-xs text-white font-bold tracking-wider">
                FAST-SCAN OK
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[#cca0a4]">
            <Wifi className="w-4 h-4 rotate-90 text-primary animate-pulse" />
            <span className="font-mono text-[10px] tracking-wider uppercase">RFID</span>
          </div>
        </div>
      </div>
    </div>
  );
}
