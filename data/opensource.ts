export type OpenSourceEntryType = 'Issue' | 'PR';
export type OpenSourceEntryStatus = 'open' | 'closed' | 'merged' | 'unmerged';

export type OpenSourceEntry = {
  type: OpenSourceEntryType;
  title: string;
  url: string;
  status: OpenSourceEntryStatus;
  number?: number | string;
  updatedAt?: string;
};

export type OpenSourceProject = {
  repo: string;
  name?: string;
  description?: string;
  repoUrl?: string;
  entries?: OpenSourceEntry[];
};

export const openSourceConfig = {
  githubUser: 'XiaoFeiASK',
  badge: 'Open Source Log',
  title: '开源参与记录',
  description: '记录我参与过的 Issue 与 Pull Request，并按项目分类沉淀贡献轨迹。',
  homeTitle: '开源足迹',
  homeDescription: 'Issue、PR 与项目协作记录，按仓库分类整理。',
  homeCover: 'https://img.cdn1.vip/i/6a6f7a31273c5_1785690673.webp',
};

export const openSourceProjects: OpenSourceProject[] = [
  {
    repo: 'TencentCloud/CubeSandbox',
    name: 'CubeSandbox',
    repoUrl: 'https://github.com/TencentCloud/CubeSandbox',
    description: '基于 RustVMM/KVM 构建的轻量级 AI Agent 沙箱服务。',
    entries: [],
  },
];
