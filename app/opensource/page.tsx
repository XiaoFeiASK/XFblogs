import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';
import { siteConfig } from '../../siteConfig';
import { openSourceConfig, openSourceProjects, OpenSourceEntry, OpenSourceLinkedIssue } from '../../data/opensource';

type GithubSearchItem = {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  created_at: string;
  updated_at: string;
  body?: string | null;
  repository_url: string;
  pull_request?: {
    merged_at?: string | null;
  };
};

type OpenSourceItem = {
  id: number | string;
  number: number | string;
  title: string;
  url: string;
  state: string;
  type: 'Issue' | 'PR';
  isMerged: boolean;
  createdAt: string;
  updatedAt: string;
  repo: string;
  repoUrl: string;
  linkedIssue?: LinkedIssue;
};

type LinkedIssue = {
  number: number | string;
  title?: string;
  url: string;
  repo: string;
};

type RepoGroup = {
  repo: string;
  repoUrl: string;
  issues: OpenSourceItem[];
  prs: OpenSourceItem[];
};

type ContributionRow = {
  issue?: OpenSourceItem;
  pr?: OpenSourceItem;
};

export const metadata = {
  title: `${openSourceConfig.title} | ${siteConfig.title}`,
  description: openSourceConfig.description,
};

const getGithubUser = () => {
  const githubUrl = siteConfig.social.github;
  const matched = githubUrl.match(/github\.com\/([^/?#]+)/i);
  return openSourceConfig.githubUser || matched?.[1] || 'XiaoFeiASK';
};

const OWNED_REPO_MIN_STARS = 50;

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

const repoLabelOverrides: Record<string, string> = {
  'ob-labs/agentseek': 'Oceanbase/agentseek',
};

const ownerLabelOverrides: Record<string, string> = {
  apache: 'Apache',
  oceanbase: 'Oceanbase',
  'ob-labs': 'Oceanbase',
};

const contributionTitleOverrides: Record<string, string> = {
  'ob-labs/agentseek#166': 'Fix root CLI mode parsing\nand stabilize Windows test runs',
};

const getRepoLabel = (repo: string) => {
  const normalizedRepo = repo.toLowerCase();
  const repoLabelOverride = repoLabelOverrides[normalizedRepo];
  if (repoLabelOverride) return repoLabelOverride;

  const [owner, name] = repo.split('/');
  if (!name) return repo;

  const displayOwner = ownerLabelOverrides[owner.toLowerCase()] || owner;
  const displayName = name.startsWith('incubator-') ? name.replace('incubator-', '') : name;
  return `${displayOwner}/${displayName}`;
};

const getIssueUrl = (repo: string, number: number | string) => `https://github.com/${repo}/issues/${number}`;

const getIssueKey = (repo: string, number: number | string) => `${repo.toLowerCase()}#${number}`;

const getContributionKey = (item: OpenSourceItem) => `${item.type}-${getIssueKey(item.repo, item.number)}-${item.id}`;

const getContributionRows = (group: RepoGroup) => {
  const issuesByKey = new Map(group.issues.map((issue) => [getIssueKey(issue.repo, issue.number), issue]));
  const pairedIssueKeys = new Set<string>();
  const rows: ContributionRow[] = group.prs.map((pr) => {
    const issueKey = pr.linkedIssue ? getIssueKey(pr.linkedIssue.repo, pr.linkedIssue.number) : undefined;
    const issue = issueKey ? issuesByKey.get(issueKey) : undefined;
    if (issueKey && issue) pairedIssueKeys.add(issueKey);
    return { issue, pr };
  });

  group.issues.forEach((issue) => {
    if (!pairedIssueKeys.has(getIssueKey(issue.repo, issue.number))) rows.push({ issue });
  });

  return rows;
};

const normalizeTitle = (title: string) => title.toLowerCase().replace(/\s+/g, ' ').trim();

const getContributionTitle = (item: OpenSourceItem) => {
  return contributionTitleOverrides[getIssueKey(item.repo, item.number)] || item.title;
};

const toLinkedIssue = (issue: OpenSourceItem): LinkedIssue => ({
  number: issue.number,
  title: issue.title,
  url: issue.url,
  repo: issue.repo,
});

const resolveManualLinkedIssue = (linkedIssue: OpenSourceLinkedIssue | undefined, fallbackRepo: string): LinkedIssue | undefined => {
  if (!linkedIssue) return undefined;
  const repo = linkedIssue.repo || fallbackRepo;
  return {
    number: linkedIssue.number,
    title: linkedIssue.title,
    url: linkedIssue.url || getIssueUrl(repo, linkedIssue.number),
    repo,
  };
};

const getLinkedIssueReference = (body: string | null | undefined, fallbackRepo: string) => {
  if (!body) return undefined;

  const urlMatch = body.match(/github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)\/issues\/(\d+)/i);
  if (urlMatch) return { repo: urlMatch[1], number: Number(urlMatch[2]) };

  const repoQualifiedMatch = body.match(/(?:^|[\s([:,])([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)#(\d+)\b/i);
  if (repoQualifiedMatch) return { repo: repoQualifiedMatch[1], number: Number(repoQualifiedMatch[2]) };

  const keywordMatch = body.match(/(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?|关联|相关|issue|issues)\s*(?:issue|issues)?\s*[:：]?\s*#(\d+)\b/i);
  if (keywordMatch) return { repo: fallbackRepo, number: Number(keywordMatch[1]) };

  const plainMatch = body.match(/#(\d+)\b/);
  if (plainMatch) return { repo: fallbackRepo, number: Number(plainMatch[1]) };

  return undefined;
};

const toOpenSourceItem = (item: GithubSearchItem): OpenSourceItem => {
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
};

const isVisiblePullRequest = (item: OpenSourceItem) => item.state === 'open' || item.isMerged;

const toIssueItemFromLinkedIssue = (linkedIssue: LinkedIssue, pr: OpenSourceItem): OpenSourceItem => ({
  id: `linked-${linkedIssue.repo}-${linkedIssue.number}`,
  number: linkedIssue.number,
  title: linkedIssue.title || `Issue #${linkedIssue.number}`,
  url: linkedIssue.url,
  state: pr.isMerged || pr.state === 'closed' ? 'closed' : 'open',
  type: 'Issue',
  isMerged: false,
  createdAt: pr.createdAt,
  updatedAt: pr.updatedAt,
  repo: linkedIssue.repo,
  repoUrl: `https://github.com/${linkedIssue.repo}`,
});

const isFallbackIssueTitle = (issue: OpenSourceItem) => issue.title === `Issue #${issue.number}`;

const addIssueIfMissing = (group: RepoGroup, issue: OpenSourceItem) => {
  const issueKey = getIssueKey(issue.repo, issue.number);
  const existingIndex = group.issues.findIndex((item) => getIssueKey(item.repo, item.number) === issueKey);
  if (existingIndex === -1) {
    group.issues.push(issue);
  } else if (isFallbackIssueTitle(group.issues[existingIndex]) && !isFallbackIssueTitle(issue)) {
    group.issues[existingIndex] = issue;
  }
};

async function fetchGithubItems(user: string, type: 'issue' | 'pr') {
  const qualifier = type === 'issue' ? 'involves' : 'author';
  const query = encodeURIComponent(`${qualifier}:${user} type:${type} is:public`);
  const response = await fetch(`https://api.github.com/search/issues?q=${query}&sort=updated&order=desc&per_page=100`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'XiaoFei-blog-opensource',
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) return [];
  const data = await response.json() as { items?: GithubSearchItem[] };
  return data.items || [];
}

async function fetchGithubIssue(repo: string, number: number | string) {
  const response = await fetch(`https://api.github.com/repos/${repo}/issues/${number}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'XiaoFei-blog-opensource',
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) return undefined;
  const item = await response.json() as GithubSearchItem;
  if (item.pull_request) return undefined;
  return toOpenSourceItem(item);
}

async function fetchRepoStars(repo: string) {
  const response = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'XiaoFei-blog-opensource',
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) return undefined;
  const data = await response.json() as { stargazers_count?: number };
  return typeof data.stargazers_count === 'number' ? data.stargazers_count : undefined;
}

async function getOpenSourceGroups() {
  const user = getGithubUser();
  const [issues, prs] = await Promise.all([
    fetchGithubItems(user, 'issue'),
    fetchGithubItems(user, 'pr'),
  ]);

  const issueItems = issues.map(toOpenSourceItem);
  const issueByKey = new Map(issueItems.map((issue) => [getIssueKey(issue.repo, issue.number), issue]));
  const issueByRepoTitle = new Map(issueItems.map((issue) => [`${issue.repo.toLowerCase()}::${normalizeTitle(issue.title)}`, issue]));
  const parsedPrItems = prs
    .map((item) => {
      const pr = toOpenSourceItem(item);
      const reference = getLinkedIssueReference(item.body, pr.repo);
      return { pr, reference };
    })
    .filter(({ pr }) => isVisiblePullRequest(pr));
  const referencedIssues = new Map<string, { repo: string; number: number }>();
  parsedPrItems.forEach(({ reference }) => {
    if (reference) referencedIssues.set(getIssueKey(reference.repo, reference.number), reference);
  });
  const fetchedIssueItems = (await Promise.all(Array.from(referencedIssues.values()).map((reference) => {
    return issueByKey.has(getIssueKey(reference.repo, reference.number)) ? undefined : fetchGithubIssue(reference.repo, reference.number);
  }))).filter((issue): issue is OpenSourceItem => Boolean(issue));

  fetchedIssueItems.forEach((issue) => {
    issueByKey.set(getIssueKey(issue.repo, issue.number), issue);
    issueByRepoTitle.set(`${issue.repo.toLowerCase()}::${normalizeTitle(issue.title)}`, issue);
  });

  const prItems = parsedPrItems.map(({ pr, reference }) => {
    const matchedByReference = reference ? issueByKey.get(getIssueKey(reference.repo, reference.number)) : undefined;
    const matchedByTitle = issueByRepoTitle.get(`${pr.repo.toLowerCase()}::${normalizeTitle(pr.title)}`);
    const linkedIssue = matchedByReference
      ? toLinkedIssue(matchedByReference)
      : reference
        ? { number: reference.number, url: getIssueUrl(reference.repo, reference.number), repo: reference.repo }
        : matchedByTitle
          ? toLinkedIssue(matchedByTitle)
          : undefined;

    return { ...pr, linkedIssue };
  });
  const items: OpenSourceItem[] = [...issueItems, ...fetchedIssueItems, ...prItems];

  const grouped = new Map<string, RepoGroup>();

  openSourceProjects.forEach((project) => {
    grouped.set(project.repo, {
      repo: project.repo,
      repoUrl: project.repoUrl || `https://github.com/${project.repo}`,
      issues: [],
      prs: [],
    });
  });

  items.forEach((item) => {
    const projectMeta = openSourceProjects.find((project) => project.repo === item.repo);
    const group = grouped.get(item.repo) || { repo: item.repo, repoUrl: projectMeta?.repoUrl || item.repoUrl, issues: [], prs: [] };
    if (item.type === 'PR' && isVisiblePullRequest(item)) {
      group.prs.push(item);
      if (item.linkedIssue) addIssueIfMissing(group, toIssueItemFromLinkedIssue(item.linkedIssue, item));
    } else if (item.type !== 'PR') {
      addIssueIfMissing(group, item);
    }
    grouped.set(item.repo, group);
  });

  openSourceProjects.forEach((project) => {
    const group = grouped.get(project.repo);
    if (!group) return;
    (project.entries || []).forEach((entry: OpenSourceEntry, index: number) => {
      const item: OpenSourceItem = {
        id: Number(`${openSourceProjects.indexOf(project) + 1}${index + 1}`),
        number: entry.number || index + 1,
        title: entry.title,
        url: entry.url,
        state: entry.status === 'open' ? 'open' : 'closed',
        type: entry.type,
        isMerged: entry.status === 'merged',
        createdAt: entry.updatedAt || '',
        updatedAt: entry.updatedAt || '',
        repo: project.repo,
        repoUrl: project.repoUrl || `https://github.com/${project.repo}`,
        linkedIssue: resolveManualLinkedIssue(entry.linkedIssue, project.repo),
      };
      if (item.type === 'PR' && isVisiblePullRequest(item)) {
        group.prs.push(item);
        if (item.linkedIssue) addIssueIfMissing(group, toIssueItemFromLinkedIssue(item.linkedIssue, item));
      } else if (item.type !== 'PR') {
        addIssueIfMissing(group, item);
      }
    });
  });

  grouped.forEach((group) => {
    const issuesByKey = new Map(group.issues.map((issue) => [getIssueKey(issue.repo, issue.number), issue]));
    const pairedPrs: OpenSourceItem[] = [];
    const pairedIssues: OpenSourceItem[] = [];

    group.prs.forEach((pr) => {
      if (!pr.linkedIssue) return;
      const issueKey = getIssueKey(pr.linkedIssue.repo, pr.linkedIssue.number);
      const issue = issuesByKey.get(issueKey);
      if (!issue) return;

      pairedPrs.push(pr);
      pairedIssues.push({ ...issue, id: `${issue.id}-paired-${pr.id}` });
    });

    group.prs = pairedPrs;
    group.issues = pairedIssues;
  });

  const groups = Array.from(grouped.values()).filter((group) => group.issues.length > 0 && group.prs.length > 0).sort((a, b) => {
    const orderA = openSourceProjects.findIndex((project) => project.repo === a.repo);
    const orderB = openSourceProjects.findIndex((project) => project.repo === b.repo);
    if (orderA !== -1 || orderB !== -1) return (orderA === -1 ? 999 : orderA) - (orderB === -1 ? 999 : orderB);
    const countDiff = (b.issues.length + b.prs.length) - (a.issues.length + a.prs.length);
    return countDiff || a.repo.localeCompare(b.repo);
  });

  const ownedGroups = groups.filter((group) => group.repo.split('/')[0]?.toLowerCase() === user.toLowerCase());
  const ownedRepoStars = new Map(
    (await Promise.all(ownedGroups.map(async (group) => [group.repo, await fetchRepoStars(group.repo)] as const)))
      .filter((entry): entry is [string, number] => entry[1] !== undefined),
  );

  return groups.filter((group) => {
    const stars = ownedRepoStars.get(group.repo);
    const isOwnedRepo = group.repo.split('/')[0]?.toLowerCase() === user.toLowerCase();
    return !isOwnedRepo || (stars !== undefined && stars >= OWNED_REPO_MIN_STARS);
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
  const title = getContributionTitle(item);
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col rounded-2xl border border-white/40 bg-white/55 p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-white/75 hover:shadow-indigo-500/20 dark:border-white/10 dark:bg-slate-800/55 dark:hover:bg-slate-800/75"
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
      <h3 className="line-clamp-2 whitespace-pre-line text-base font-black leading-snug text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">
        {title}
      </h3>
      <div className="mt-auto flex items-center justify-between pt-4 text-[11px] font-bold text-slate-500 dark:text-slate-400">
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
          <section className="mb-12 px-1 py-4 md:px-3">
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-xs font-black uppercase tracking-[0.35em] text-indigo-600 shadow-sm backdrop-blur-md dark:bg-slate-950/30 dark:text-indigo-300">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_16px_rgba(99,102,241,0.8)]"></span>
                  {openSourceConfig.badge}
                </p>
                <h1 className="text-5xl font-black tracking-tight text-slate-950 drop-shadow-[0_2px_10px_rgba(255,255,255,0.75)] dark:text-white md:text-7xl">{openSourceConfig.title}</h1>
                <p className="mt-5 flex max-w-3xl items-start gap-3 rounded-3xl bg-white/55 px-5 py-4 text-sm font-black leading-relaxed text-slate-700 shadow-lg shadow-slate-900/5 backdrop-blur-md dark:bg-slate-950/30 dark:text-slate-200 md:text-base">
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">✦</span>
                  记录我参与过的 Issue 与 Pull Request，自动同步 GitHub 公开记录，沉淀每一次开源协作轨迹。
                </p>
              </div>
              <div className="grid grid-cols-3 gap-5 text-left md:min-w-[360px]">
                <div className="rounded-2xl bg-white/50 p-4 shadow-md backdrop-blur-sm dark:bg-slate-950/25">
                  <div className="text-4xl font-black text-indigo-600 dark:text-indigo-300">{groups.length}</div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Projects</div>
                </div>
                <div className="rounded-2xl bg-white/50 p-4 shadow-md backdrop-blur-sm dark:bg-slate-950/25">
                  <div className="text-4xl font-black text-emerald-600 dark:text-emerald-300">{totalIssues}</div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Issues</div>
                </div>
                <div className="rounded-2xl bg-white/50 p-4 shadow-md backdrop-blur-sm dark:bg-slate-950/25">
                  <div className="text-4xl font-black text-purple-600 dark:text-purple-300">{totalPrs}</div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">PRs</div>
                </div>
              </div>
            </div>
          </section>

          {groups.length > 0 ? (
            <>
              <nav className="mb-8 px-1 py-2 md:px-3">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.28em] text-slate-700 dark:text-slate-200">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-[11px] text-white shadow-lg shadow-indigo-500/30">#</span>
                    Project Index
                  </div>
                  <div className="text-[11px] font-black text-slate-600 dark:text-slate-300">按仓库快速定位 Issue / PR 记录</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href="#open-source-list" className="rounded-2xl border border-indigo-500/20 bg-indigo-500 px-4 py-2 text-xs font-black text-white shadow-lg shadow-indigo-500/25 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-indigo-600">
                    全部 <span className="ml-1 opacity-80">{groups.length}</span>
                  </a>
                  {groups.map((group) => (
                    <a key={group.repo} href={`#${getRepoId(group.repo)}`} className="rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-xs font-black text-slate-700 shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:text-white hover:shadow-indigo-500/20 dark:border-white/10 dark:bg-white/15 dark:text-slate-200">
                      {getRepoLabel(group.repo)} <span className="ml-1 opacity-60">{group.issues.length + group.prs.length}</span>
                    </a>
                  ))}
                </div>
              </nav>

              <div id="open-source-list" className="space-y-8 scroll-mt-28">
                {groups.map((group) => {
                  const contributionRows = getContributionRows(group);
                  const displayedRows: ContributionRow[] = contributionRows.length > 0 ? contributionRows : [{}];
                  return (
                    <section key={group.repo} id={getRepoId(group.repo)} className="scroll-mt-28 rounded-[36px] border border-white/40 bg-white/45 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/45 md:p-8">
                      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Repository</p>
                          <h2 className="mt-2 flex items-center gap-2 text-2xl font-black text-slate-950 dark:text-white md:text-3xl">
                            {group.repo.toLowerCase().startsWith('tencent') && <span aria-hidden="true" className="shrink-0 font-normal leading-none">🐧</span>}
                            <span>{getRepoLabel(group.repo)}</span>
                          </h2>
                        </div>
                        <a href={group.repoUrl} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-200">
                          仓库主页 ↗
                        </a>
                      </div>

                      <div className="mb-3 hidden grid-cols-2 gap-6 lg:grid">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-300">
                          <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Issues
                        </div>
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-purple-600 dark:text-purple-300">
                          <span className="h-2 w-2 rounded-full bg-purple-500"></span> Pull Requests
                        </div>
                      </div>
                      <div className="space-y-3">
                        {displayedRows.map(({ issue, pr }, index) => (
                          <div key={pr ? getContributionKey(pr) : issue ? getContributionKey(issue) : `empty-${group.repo}-${index}`} className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-6">
                            {issue ? <ContributionCard item={issue} /> : <p className="h-full rounded-2xl border border-dashed border-emerald-500/20 bg-white/25 p-4 text-sm font-bold text-slate-500 dark:bg-white/5 dark:text-slate-400">未关联 Issue</p>}
                            {pr ? <ContributionCard item={pr} /> : <p className="h-full rounded-2xl border border-dashed border-purple-500/20 bg-white/25 p-4 text-sm font-bold text-slate-500 dark:bg-white/5 dark:text-slate-400">暂无对应 PR</p>}
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
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
