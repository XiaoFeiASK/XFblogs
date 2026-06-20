"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const COLORS = [
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
];

export default function TagCloud({ tags }: { tags: { name: string; count: number }[] }) {
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  if (!tags || tags.length === 0) {
    return (
      <div className="w-full h-full rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-5 sm:p-6 flex items-center justify-center">
        <span className="text-sm text-slate-400 dark:text-slate-500">暂无标签</span>
      </div>
    );
  }

  const maxCount = Math.max(...tags.map(t => t.count));
  const minCount = Math.min(...tags.map(t => t.count));
  const range = maxCount - minCount || 1;

  const getSize = (count: number) => {
    const ratio = (count - minCount) / range;
    if (ratio > 0.7) return 'text-base font-black';
    if (ratio > 0.4) return 'text-sm font-bold';
    return 'text-xs font-semibold';
  };

  return (
    <div className="w-full h-full rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-5 sm:p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-pink-500 to-rose-500"></div>
        <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 tracking-widest uppercase">Tags</h2>
        <span className="ml-auto text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-full">
          {tags.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 flex-1 content-start">
        {tags.map((tag, i) => (
          <motion.div
            key={tag.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <Link
              href={`/timeline?tag=${encodeURIComponent(tag.name)}`}
              onMouseEnter={() => setHoveredTag(tag.name)}
              onMouseLeave={() => setHoveredTag(null)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-300 ${COLORS[i % COLORS.length]} ${getSize(tag.count)} ${hoveredTag === tag.name ? 'scale-110 shadow-md' : 'hover:scale-105'}`}
            >
              <span>#</span>
              <span>{tag.name}</span>
              {tag.count > 1 && (
                <span className="text-[9px] opacity-60 ml-0.5">({tag.count})</span>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
