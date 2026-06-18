/* ===== Canvas Background ===== */
(function() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h;
  const colors = ['#35bfab', '#1fc9e7', '#9EE7D1', '#88E6E5', '#EDDD62', '#a7f3d0'];
  const bubbles = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function init() {
    resize();
    for (let i = 0; i < 6; i++) {
      bubbles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 200 + Math.random() * 200,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        color: colors[i % colors.length]
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const b of bubbles) {
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < -b.r) b.x = w + b.r;
      if (b.x > w + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = h + b.r;
      if (b.y > h + b.r) b.y = -b.r;

      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      grad.addColorStop(0, b.color + '80');
      grad.addColorStop(1, b.color + '00');
      ctx.fillStyle = grad;
      ctx.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  init();
  setTimeout(draw, 500);
})();

/* ===== Settings Loader ===== */
async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    const s = await res.json();
    const root = document.documentElement;
    const map = {
      color_brand: '--color-brand',
      color_brand_secondary: '--color-brand-secondary',
      color_primary: '--color-primary',
      color_secondary: '--color-secondary',
      color_bg: '--color-bg',
      color_border: '--color-border'
    };
    for (const [k, v] of Object.entries(map)) {
      if (s[k]) root.style.setProperty(v, s[k]);
    }
    if (s.site_name) {
      document.title = s.site_name;
      const el = document.getElementById('site-title');
      if (el) el.textContent = s.site_name;
    }
    if (s.greeting) {
      const el = document.getElementById('site-greeting');
      if (el) el.textContent = s.greeting;
    }
    if (s.site_description) {
      const el = document.getElementById('site-status');
      if (el) el.textContent = s.site_description;
    }
    const sg = document.getElementById('social-grid');
    if (sg) {
      const links = sg.querySelectorAll('.social-btn');
      if (s.github_url && links[0]) links[0].href = s.github_url;
      if (s.bilibili_url && links[1]) links[1].href = s.bilibili_url;
      if (s.xiaohongshu_url && links[2]) links[2].href = s.xiaohongshu_url;
      if (s.email && links[3]) links[3].href = 'mailto:' + s.email;
    }
  } catch (e) {}
}

/* ===== Clock ===== */
function updateClock() {
  const now = new Date();
  const h = document.getElementById('clock-h');
  const m = document.getElementById('clock-m');
  if (h) h.textContent = String(now.getHours()).padStart(2, '0');
  if (m) m.textContent = String(now.getMinutes()).padStart(2, '0');
}
setInterval(updateClock, 1000);
updateClock();

/* ===== Calendar ===== */
let calYear, calMonth;
(function() {
  const now = new Date();
  calYear = now.getFullYear();
  calMonth = now.getMonth();
  renderCalendar();
  document.getElementById('cal-prev')?.addEventListener('click', () => {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });
  document.getElementById('cal-next')?.addEventListener('click', () => {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });
})();

function renderCalendar() {
  const title = document.getElementById('cal-title');
  const days = document.getElementById('cal-days');
  if (!title || !days) return;

  const now = new Date();
  const today = now.getFullYear() === calYear && now.getMonth() === calMonth ? now.getDate() : -1;
  const months = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
  title.textContent = `${calYear} ${months[calMonth]}`;

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  let html = '';
  for (let i = 0; i < offset; i++) html += '<div class="cal-day empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    html += `<div class="cal-day${d === today ? ' today' : ''}">${d}</div>`;
  }
  days.innerHTML = html;
}

/* ===== Music Player ===== */
(function() {
  const playBtn = document.getElementById('music-play');
  const fill = document.getElementById('music-fill');
  const progress = document.getElementById('music-progress');
  if (!playBtn) return;

  let playing = false;
  let progress_val = 0;
  let timer = null;

  playBtn.addEventListener('click', () => {
    playing = !playing;
    playBtn.innerHTML = playing
      ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
      : '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';

    if (playing) {
      timer = setInterval(() => {
        progress_val = (progress_val + 0.5) % 100;
        if (fill) fill.style.width = progress_val + '%';
      }, 200);
    } else {
      clearInterval(timer);
    }
  });

  if (progress) {
    progress.addEventListener('click', (e) => {
      const rect = progress.getBoundingClientRect();
      progress_val = ((e.clientX - rect.left) / rect.width) * 100;
      if (fill) fill.style.width = progress_val + '%';
    });
  }
})();

/* ===== Like Button with Particles ===== */
(function() {
  const btn = document.getElementById('like-btn');
  const countEl = document.getElementById('like-count');
  if (!btn) return;

  let liked = false;
  let count = 18988;
  countEl.textContent = count;

  btn.addEventListener('click', () => {
    if (!liked) {
      count++;
      liked = true;
      btn.classList.add('liked');
      spawnParticles(btn);
    } else {
      count--;
      liked = false;
      btn.classList.remove('liked');
    }
    countEl.textContent = count;
  });

  function spawnParticles(parent) {
    const emojis = ['❤️', '💕', '💖', '✨', '💗', '💓'];
    for (let i = 0; i < 6; i++) {
      const p = document.createElement('span');
      p.className = 'like-particle';
      p.textContent = emojis[i % emojis.length];
      const angle = (Math.PI * 2 / 6) * i + Math.random() * 0.5;
      const dist = 30 + Math.random() * 30;
      p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--ty', Math.sin(angle) * dist - 10 + 'px');
      p.style.left = '50%';
      p.style.top = '50%';
      parent.appendChild(p);
      setTimeout(() => p.remove(), 800);
    }
  }
})();

/* ===== Latest Article ===== */
let latestSlug = '';
async function loadLatest() {
  try {
    const res = await fetch('/api/articles');
    const data = await res.json();
    if (data.articles && data.articles.length > 0) {
      const a = data.articles[0];
      latestSlug = a.slug;
      const t = document.getElementById('latest-title');
      const d = document.getElementById('latest-date');
      if (t) t.textContent = a.title;
      if (d) d.textContent = formatDate(a.created_at);
    }
  } catch (e) {}
}

function goToArticle() {
  if (latestSlug) window.location.href = '/article/' + latestSlug;
}
window.goToArticle = goToArticle;

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

/* ===== Init ===== */
loadSettings();
loadLatest();
