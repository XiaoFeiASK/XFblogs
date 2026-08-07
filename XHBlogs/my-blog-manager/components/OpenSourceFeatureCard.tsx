import Link from 'next/link';
import { openSourceConfig, openSourceProjects } from '../data/opensource';

export default function OpenSourceFeatureCard() {
  const projectCount = openSourceProjects.length;

  return (
    <div className="w-full h-full rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl overflow-hidden relative group min-h-[220px] flex flex-col">
      <Link href="/opensource" className="absolute inset-0 z-20" aria-label="查看开源贡献" />

      <div className="absolute inset-0 z-0">
        <img src={openSourceConfig.homeCover} className="w-full h-full object-cover opacity-80 dark:opacity-60 transition-transform duration-500 group-hover:scale-105" alt="Open Source Cover" loading="eager" decoding="async" width={900} height={500} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/10"></div>
      </div>

      <div className="relative z-10 flex flex-col justify-center p-6 md:p-8 h-full pointer-events-none w-full md:w-[85%]">
        <div className="flex items-end gap-2 mb-2">
          <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10 shadow-sm">
            Open Source
          </span>
          <span className="text-[11px] font-mono text-slate-300 drop-shadow-md">
            {projectCount} projects
          </span>
        </div>

        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors line-clamp-1 drop-shadow-md">
          {openSourceConfig.homeTitle}
        </h3>
        <p className="text-sm text-slate-300 font-medium leading-relaxed drop-shadow-md line-clamp-2">
          {openSourceConfig.homeDescription}
        </p>
      </div>
    </div>
  );
}
