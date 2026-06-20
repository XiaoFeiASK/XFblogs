"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../siteConfig';

const phrases = [
  "在代码与分子动力学间穿梭的探索者",
  "GROMACS 模拟运行中...",
  "Graph Neural Networks 炼丹进行时",
  "欢迎来到我的数字花园",
  "记录每一次思考与灵感",
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return { text: "夜深了", sub: "深夜还在码代码吗？注意休息哦" };
  if (h < 12) return { text: "早上好", sub: "新的一天，新的灵感" };
  if (h < 14) return { text: "中午好", sub: "午间小憩，蓄势待发" };
  if (h < 18) return { text: "下午好", sub: "阳光正好，适合创造" };
  return { text: "晚上好", sub: "夜幕降临，思绪更清晰" };
}

export default function HeroSection() {
  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const greeting = getGreeting();

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    const speed = isDeleting ? 30 : 60;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        if (displayText.length === currentPhrase.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setDisplayText(currentPhrase.slice(0, displayText.length - 1));
        if (displayText.length === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIndex]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full rounded-3xl bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-pink-500/20 dark:from-indigo-900/40 dark:via-purple-900/30 dark:to-slate-900/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl overflow-hidden relative group"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-400/20 dark:bg-indigo-600/10 blur-[60px] rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-400/20 dark:bg-pink-600/10 blur-[50px] rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300/10 dark:bg-purple-700/5 blur-[80px] rounded-full"></div>
      </div>

      <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 md:px-12 md:py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase">
              {greeting.sub}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
            {greeting.text}，
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              {siteConfig.authorName}
            </span>
          </h1>

          <div className="h-8 flex items-center justify-center md:justify-start">
            <span className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium">
              {displayText}
              <span className="inline-block w-0.5 h-5 bg-indigo-500 dark:bg-indigo-400 ml-1 animate-pulse"></span>
            </span>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center gap-3 flex-shrink-0">
          <div className="grid grid-cols-3 gap-2">
            {[
              { num: "∞", label: "可能性" },
              { num: "24/7", label: "在线" },
              { num: "☕", label: "续命中" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="w-20 h-20 rounded-2xl bg-white/50 dark:bg-slate-800/60 border border-white/60 dark:border-white/10 flex flex-col items-center justify-center shadow-lg backdrop-blur-sm"
              >
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{item.num}</span>
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
    </motion.div>
  );
}
