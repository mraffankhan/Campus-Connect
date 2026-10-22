"use client";

import { useEffect, useState } from "react";

interface Ember {
  id: number;
  left: string;
  size: number;
  duration: string;
  delay: string;
}

export function DragonParticles() {
  const [embers, setEmbers] = useState<Ember[]>([]);

  useEffect(() => {
    // Generate scattered ember particles
    const items: Ember[] = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${(i * 5.5 + Math.random() * 4).toFixed(1)}%`,
      size: Math.floor(Math.random() * 4) + 3,
      duration: `${(7 + Math.random() * 8).toFixed(1)}s`,
      delay: `${(Math.random() * 6).toFixed(1)}s`,
    }));
    setEmbers(items);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {embers.map((ember) => (
        <span
          key={ember.id}
          style={{
            left: ember.left,
            width: `${ember.size}px`,
            height: `${ember.size}px`,
            animation: `emberRise ${ember.duration} linear infinite`,
            animationDelay: ember.delay,
          }}
          className="absolute -bottom-6 rounded-full bg-[#f00010] shadow-[0_0_10px_#f00010,0_0_20px_#ff3344,0_0_30px_rgba(240,0,16,0.6)] opacity-0 pointer-events-none"
        />
      ))}
    </div>
  );
}
