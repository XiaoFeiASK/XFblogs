"use client";

import { useEffect, useState } from 'react';
import { siteConfig } from '../siteConfig';

interface DanmakuItem {
  id: number;
  text: string;
  top: number;
  duration: number;
  delay: number;
}

export default function DanmakuBackground() {
  const [danmakus, setDanmakus] = useState<DanmakuItem[]>([]);

  useEffect(() => {
    const list = siteConfig.danmakuList || [];
    if (list.length === 0) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const generate = () => {
      if (document.visibilityState === 'hidden' || mediaQuery.matches) {
        setDanmakus([]);
        return;
      }

      const generatedDanmakus: DanmakuItem[] = [];
      const count = window.innerWidth < 768 ? 6 : 10;

      for (let i = 0; i < count; i++) {
        generatedDanmakus.push({
          id: i,
          text: list[Math.floor(Math.random() * list.length)],
          top: Math.random() * 80 + 10,
          duration: Math.random() * 20 + 25,
          delay: Math.random() * 20,
        });
      }
      setDanmakus(generatedDanmakus);
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
    // 🌟 终极限制：去掉了 bottom-0，换成了 h-[30vh] 强制锁死容器高度！
    // 并且加上 z-0 确保它在卡片矩阵的后面
    <div className="fixed top-28 h-[30vh] left-0 right-0 overflow-hidden pointer-events-none z-0">
      {danmakus.map((item) => (
        <div
          key={item.id}
          className="absolute whitespace-nowrap text-white/30 dark:text-white/10 font-bold text-lg tracking-wider select-none"
          style={{
            top: `${item.top}%`,
            left: '100%',
            animation: `float-left ${item.duration}s linear ${item.delay}s infinite`,
          }}
        >
          {item.text}
        </div>
      ))}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100vw - 100%));
          }
        }
      `}} />
    </div>
  );
}
