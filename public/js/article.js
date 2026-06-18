async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    const s = await res.json();
    const root = document.documentElement;
    if (s.color_brand) root.style.setProperty('--color-brand', s.color_brand);
    if (s.color_brand_secondary) root.style.setProperty('--color-brand-secondary', s.color_brand_secondary);
    if (s.color_primary) root.style.setProperty('--color-primary', s.color_primary);
    if (s.color_secondary) root.style.setProperty('--color-secondary', s.color_secondary);
    if (s.color_bg) root.style.setProperty('--color-bg', s.color_bg);
    if (s.color_border) root.style.setProperty('--color-border', s.color_border);
  } catch (e) {}
}

function fmtDate(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}/${dt.getMonth()+1}/${dt.getDate()}`;
}

async function loadArticle() {
  const slug = window.location.pathname.split('/').pop();
  const el = document.getElementById('content');
  try {
    const res = await fetch(`/api/articles/${slug}`);
    if (!res.ok) throw new Error();
    const a = await res.json();
    document.title = `${a.title} - 小飞`;
    el.innerHTML = `
      <div class="article-page-header">
        <h1 class="article-page-title">${a.title}</h1>
        <div class="article-page-meta">
          <span>${fmtDate(a.created_at)}</span>
          <span>${a.views} 次阅读</span>
          ${a.tags ? a.tags.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('') : ''}
        </div>
      </div>
      <div class="prose">${a.html}</div>`;
  } catch (e) {
    el.innerHTML = '<div class="empty-state"><p>文章不存在</p><a href="/" class="brand-btn">返回首页</a></div>';
  }
}

loadSettings();
loadArticle();
