"use client";
import { useEffect, useState } from 'react';

interface Petal {
  id: number;
  left: string;
  size: number;
  duration: number;
  delay: number;
}

export default function Sakura() {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const generate = () => {
      if (document.visibilityState === 'hidden' || mediaQuery.matches) {
        setPetals([]);
        return;
      }

      const count = window.innerWidth < 768 ? 12 : 22;
      const generated = Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: 8 + Math.random() * 12, // 8px 到 20px 大小的花瓣
        duration: 7 + Math.random() * 9, // 稍慢一点，减少同时重绘
        delay: Math.random() * -15, // 随机错开下落时间
      }));
      setPetals(generated);
    };

    generate();
    document.addEventListener('visibilitychange', generate);
    window.addEventListener('resize', generate);
    mediaQuery.addEventListener('change', generate);
    return () => {
      document.removeEventListener('visibilitychange', generate);
      window.removeEventListener('resize', generate);
      mediaQuery.removeEventListener('change', generate);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-10 overflow-hidden">
      <style>{`
        @keyframes sakuraFall {
          0% { transform: translate(0, -10vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate(15vw, 110vh) rotate(360deg); opacity: 0; }
        }
      `}</style>

      {petals.map(p => (
        <div
          key={p.id}
          className="absolute top-0 bg-pink-300/70 shadow-[0_0_5px_rgba(255,182,193,0.6)]"
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size * 1.2}px`,
            // 樱花特有的圆角形状
            borderRadius: '100% 0 100% 0',
            animation: `sakuraFall ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        ></div>
      ))}
    </div>
  );
}
