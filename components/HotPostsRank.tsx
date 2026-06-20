"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HotPostsRank({ posts }: { posts: any[] }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="w-full h-full rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-5 sm:p-6 flex items-center justify-center">
        <span className="text-sm text-slate-400 dark:text-slate-500">暂无文章</span>
      </div>
    );
  }

  const rankColors = [
    'bg-gradient-to-br from-amber-400 to-orange-500 text-white',
    'bg-gradient-to-br from-slate-300 to-slate-400 text-white',
    'bg-gradient-to-br from-amber-600 to-amber-700 text-white',
  ];

  return (
    <div className="w-full h-full rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-5 sm:p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-500 to-orange-500"></div>
        <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 tracking-widest uppercase">Latest Posts</h2>
      </div>

      <div className="flex flex-col gap-1 flex-1">
        {posts.slice(0, 8).map((post, i) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`/posts/${post.slug}`}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/50 dark:hover:bg-slate-700/40 transition-all duration-300 group"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${i < 3 ? rankColors[i] : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                {i + 1}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {post.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{post.formattedDate}</span>
                  {post.tags?.[0] && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 font-semibold">
                      {post.tags[0]}
                    </span>
                  )}
                </div>
              </div>

              <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </motion.div>
        ))}
      </div>

      {posts.length > 8 && (
        <Link href="/timeline" className="mt-3 text-center text-xs font-bold text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
          查看全部 {posts.length} 篇文章 →
        </Link>
      )}
    </div>
  );
}
