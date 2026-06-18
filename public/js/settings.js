const toast = document.getElementById('toast');
const form = document.getElementById('form');

function showToast(msg, type = 'success') {
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 2500);
}

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

    for (const [key, value] of Object.entries(s)) {
      const el = document.getElementById(key.replace(/_/g, '-'));
      if (el) el.value = value;
    }
  } catch (e) { showToast('加载失败', 'error'); }
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(form);
  const data = {};
  for (const [k, v] of fd.entries()) data[k.replace(/-/g, '_')] = v;
  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error();
    showToast('设置已保存');
    const root = document.documentElement;
    if (data.color_brand) root.style.setProperty('--color-brand', data.color_brand);
    if (data.color_brand_secondary) root.style.setProperty('--color-brand-secondary', data.color_brand_secondary);
    if (data.color_primary) root.style.setProperty('--color-primary', data.color_primary);
    if (data.color_secondary) root.style.setProperty('--color-secondary', data.color_secondary);
    if (data.color_bg) root.style.setProperty('--color-bg', data.color_bg);
    if (data.color_border) root.style.setProperty('--color-border', data.color_border);
  } catch (err) { showToast('保存失败', 'error'); }
});

document.getElementById('reset-btn').addEventListener('click', async () => {
  if (!confirm('恢复默认设置？')) return;
  const defaults = {
    site_name: '小飞', site_description: 'wiki',
    color_brand: '#35bfab', color_brand_secondary: '#1fc9e7',
    color_primary: '#334f52', color_secondary: '#7b888e',
    color_bg: '#eeeeee', color_border: '#ffffff',
    greeting: 'Good Night', github_url: '', bilibili_url: '', email: ''
  };
  await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(defaults)
  });
  showToast('已恢复默认');
  loadSettings();
});

loadSettings();
