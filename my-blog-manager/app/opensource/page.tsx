import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';
import { siteConfig } from '../../siteConfig';

type GithubSearchItem = {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  created_at: string;
  updated_at: string;
  repository_url: string;
  pull_request?: {
    merged_at?: string | null;
  };
};

type OpenSourceItem = {
  id: number;
  number: number;
  title: string;
  url: string;
  state: string;
  type: 'Issue' | 'PR';
  isMerged: boolean;
  createdAt: string;
  updatedAt: string;
  repo: string;
  repoUrl: string;
};

type RepoGroup = {
  repo: string;
  repoUrl: string;
  issues: OpenSourceItem[];
  prs: OpenSourceItem[];
};

export const metadata = {
  title: `开源贡献 | ${siteConfig.title}`,
  description: '按项目整理的 Issue 与 Pull Request 记录',
};

const getGithubUser = () => {
  const githubUrl = siteConfig.social.github;
  const matched = githubUrl.match(/github\.com\/([^/?#]+)/i);
  return matched?.[1] || 'XiaoFeiASK';
};

const formatDate = (date: string) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return `${parsed.getFullYear()}.${String(parsed.getMonth() + 1).padStart(2, '0')}.${String(parsed.getDate()).padStart(2, '0')}`;
};

const getRepoFromApiUrl = (url: string) => {
  const marker = '/repos/';
  const index = url.indexOf(marker);
  return index >= 0 ? url.slice(index + marker.length) : 'unknown/repository';
};

const getRepoId = (repo: string) => {
  return repo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

async function fetchGithubItems(user: string, type: 'issue' | 'pr') {
  const query = encodeURIComponent(`author:${user} type:${type} is:public`);
  const response = await fetch(`https://api.github.com/search/issues?q=${query}&sort=updated&order=desc&per_page=100`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'XiaoFei-blog-opensource',
    },
    next: { revalidate: 1800 },
  });

  if (!response.ok) return [];
  const data = await response.json() as { items?: GithubSearchItem[] };
  return data.items || [];
}

async function getOpenSourceGroups() {
  const user = getGithubUser();
  const [issues, prs] = await Promise.all([
    fetchGithubItems(user, 'issue'),
    fetchGithubItems(user, 'pr'),
  ]);

  const items: OpenSourceItem[] = [...issues, ...prs].map((item) => {
    const repo = getRepoFromApiUrl(item.repository_url);
    const isPr = Boolean(item.pull_request);
    return {
      id: item.id,
      number: item.number,
      title: item.title,
      url: item.html_url,
      state: item.state,
      type: isPr ? 'PR' : 'Issue',
      isMerged: Boolean(item.pull_request?.merged_at),
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      repo,
      repoUrl: `https://github.com/${repo}`,
    };
  });

  const grouped = new Map<string, RepoGroup>();
  items.forEach((item) => {
    const group = grouped.get(item.repo) || { repo: item.repo, repoUrl: item.repoUrl, issues: [], prs: [] };
    if (item.type === 'PR') group.prs.push(item);
    else group.issues.push(item);
    grouped.set(item.repo, group);
  });

  return Array.from(grouped.values()).sort((a, b) => {
    const countDiff = (b.issues.length + b.prs.length) - (a.issues.length + a.prs.length);
    return countDiff || a.repo.localeCompare(b.repo);
  });
}

const getStatusBadge = (item: OpenSourceItem) => {
  if (item.type === 'PR') {
    if (item.isMerged) {
      return {
        label: 'Merged',
        className: 'bg-purple-600 text-white shadow-purple-500/25',
      };
    }

    return {
      label: item.state === 'closed' ? 'Unmerged' : 'Open',
      className: 'bg-emerald-500 text-white shadow-emerald-500/25',
    };
  }

  if (item.state === 'closed') {
    return {
      label: 'Closed',
      className: 'bg-purple-600 text-white shadow-purple-500/25',
    };
  }

  return {
    label: 'Open',
    className: 'bg-emerald-500 text-white shadow-emerald-500/25',
  };
};

function ContributionCard({ item }: { item: OpenSourceItem }) {
  const isPr = item.type === 'PR';
  const statusBadge = getStatusBadge(item);
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-white/40 bg-white/55 p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-white/75 hover:shadow-indigo-500/20 dark:border-white/10 dark:bg-slate-800/55 dark:hover:bg-slate-800/75"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${isPr ? 'bg-purple-500/10 text-purple-600 dark:text-purple-300' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'}`}>
          {item.type} #{item.number}
        </span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black shadow-lg ${statusBadge.className}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-white/90"></span>
          {statusBadge.label}
        </span>
      </div>
      <h3 className="line-clamp-2 text-base font-black leading-snug text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">
        {item.title}
      </h3>
      <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
        <span>更新 {formatDate(item.updatedAt)}</span>
        <span className="text-indigo-500 transition-transform group-hover:translate-x-1">跳转 ↗</span>
      </div>
    </a>
  );
}

export default async function OpenSourcePage() {
  const groups = await getOpenSourceGroups();
  const totalIssues = groups.reduce((sum, group) => sum + group.issues.length, 0);
  const totalPrs = groups.reduce((sum, group) => sum + group.prs.length, 0);

  return (
    <div className="min-h-screen relative pb-24">
      <Navbar />
      <PageTransition>
        <main className="mx-auto mt-28 w-[92%] max-w-6xl relative z-10">
          <section className="mb-10 rounded-[40px] border border-white/40 bg-white/50 p-8 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/45 md:p-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-indigo-500">Open Source Log</p>
                <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-6xl">开源参与记录</h1>
                <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
                  自动汇总 GitHub 公开 Issue 与 Pull Request，并按项目分类展示，方便快速跳转到对应讨论和代码变更。
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-white/60 px-4 py-3 dark:bg-white/10">
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-300">{groups.length}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Projects</div>
                </div>
                <div className="rounded-2xl bg-white/60 px-4 py-3 dark:bg-white/10">
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-300">{totalIssues}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Issues</div>
                </div>
                <div className="rounded-2xl bg-white/60 px-4 py-3 dark:bg-white/10">
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-300">{totalPrs}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">PRs</div>
                </div>
              </div>
            </div>
          </section>

          {groups.length > 0 ? (
            <>
              <nav className="sticky top-20 z-20 mb-8 rounded-3xl border border-white/40 bg-white/55 p-4 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/55">
                <div className="flex flex-wrap gap-2">
                  {groups.map((group) => (
                    <a key={group.repo} href={`#${getRepoId(group.repo)}`} className="rounded-2xl bg-white/70 px-4 py-2 text-xs font-black text-slate-600 transition-all hover:bg-indigo-500 hover:text-white dark:bg-white/10 dark:text-slate-300">
                      {group.repo.split('/')[1]} <span className="opacity-60">{group.issues.length + group.prs.length}</span>
                    </a>
                  ))}
                </div>
              </nav>

              <div className="space-y-8">
                {groups.map((group) => (
                  <section key={group.repo} id={getRepoId(group.repo)} className="scroll-mt-28 rounded-[36px] border border-white/40 bg-white/45 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/45 md:p-8">
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Repository</p>
                        <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white md:text-3xl">{group.repo}</h2>
                      </div>
                      <a href={group.repoUrl} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-200">
                        仓库主页 ↗
                      </a>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <div>
                        <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-300">
                          <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Issues
                        </div>
                        <div className="space-y-3">
                          {group.issues.length > 0 ? group.issues.map((item) => <ContributionCard key={item.id} item={item} />) : <p className="rounded-2xl bg-white/40 p-4 text-sm font-bold text-slate-500 dark:bg-white/5">暂无公开 Issue 记录</p>}
                        </div>
                      </div>

                      <div>
                        <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-purple-600 dark:text-purple-300">
                          <span className="h-2 w-2 rounded-full bg-purple-500"></span> Pull Requests
                        </div>
                        <div className="space-y-3">
                          {group.prs.length > 0 ? group.prs.map((item) => <ContributionCard key={item.id} item={item} />) : <p className="rounded-2xl bg-white/40 p-4 text-sm font-bold text-slate-500 dark:bg-white/5">暂无公开 PR 记录</p>}
                        </div>
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-[36px] border border-white/40 bg-white/50 p-12 text-center shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/45">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">暂未读取到公开开源记录</h2>
              <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">可能是 GitHub API 限流、网络失败，或当前账号暂无公开 Issue / PR。</p>
              <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex rounded-2xl bg-indigo-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-indigo-600">
                前往 GitHub ↗
              </a>
            </div>
          )}
        </main>
      </PageTransition>
    </div>
  );
}
