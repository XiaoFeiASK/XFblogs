const modal = document.getElementById('modal');
const form = document.getElementById('form');
const toast = document.getElementById('toast');

function showToast(msg, type = 'success') {
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function openModal(a = null) {
  document.getElementById('modal-title').textContent = a ? '编辑文章' : '新建文章';
  document.getElementById('f-id').value = a ? a.id : '';
  document.getElementById('f-title').value = a ? a.title : '';
  document.getElementById('f-slug').value = a ? a.slug : '';
  document.getElementById('f-summary').value = a ? a.summary : '';
  document.getElementById('f-tags').value = a ? a.tags : '';
  document.getElementById('f-content').value = a ? a.content : '';
  modal.classList.add('active');
}

function closeModal() { modal.classList.remove('active'); }

document.getElementById('new-btn').addEventListener('click', () => openModal());
document.getElementById('cancel-btn').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

document.getElementById('f-title').addEventListener('input', e => {
  const slugInput = document.getElementById('f-slug');
  if (!document.getElementById('f-id').value) {
    slugInput.value = e.target.value.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');
  }
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('f-id').value;
  const data = {
    title: document.getElementById('f-title').value,
    slug: document.getElementById('f-slug').value,
    summary: document.getElementById('f-summary').value,
    tags: document.getElementById('f-tags').value,
    content: document.getElementById('f-content').value
  };
  try {
    const res = await fetch(id ? `/api/articles/${id}` : '/api/articles', {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const r = await res.json();
    if (r.error) throw new Error(r.error);
    showToast(id ? '已更新' : '已创建');
    closeModal();
    loadArticles();
  } catch (err) { showToast(err.message, 'error'); }
});

async function deleteArticle(id) {
  if (!confirm('确定删除？')) return;
  await fetch(`/api/articles/${id}`, { method: 'DELETE' });
  showToast('已删除');
  loadArticles();
}

function fmtDate(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}/${dt.getMonth()+1}/${dt.getDate()}`;
}

async function loadArticles() {
  const table = document.getElementById('table');
  table.innerHTML = '<div class="loading"></div>';
  try {
    const res = await fetch('/api/articles/all');
    const articles = await res.json();
    if (!articles.length) {
      table.innerHTML = '<div class="empty-state"><p>还没有文章</p></div>';
      return;
    }
    table.innerHTML = `<table>
      <thead><tr><th>标题</th><th>创建时间</th><th>浏览</th><th>操作</th></tr></thead>
      <tbody>${articles.map(a => `<tr>
        <td><a href="/article/${a.slug}" target="_blank" style="color:var(--color-primary);text-decoration:none;font-weight:500">${a.title}</a></td>
        <td style="color:var(--color-secondary)">${fmtDate(a.created_at)}</td>
        <td style="color:var(--color-secondary)">${a.views||0}</td>
        <td>
          <button class="act-btn act-btn-edit" onclick='editArticle(${JSON.stringify(a).replace(/'/g,"&#39;")})'>编辑</button>
          <button class="act-btn act-btn-delete" onclick="deleteArticle(${a.id})">删除</button>
        </td>
      </tr>`).join('')}</tbody></table>`;
  } catch (e) {
    table.innerHTML = '<div class="empty-state"><p>加载失败</p></div>';
  }
}

window.editArticle = a => openModal(a);
window.deleteArticle = deleteArticle;
loadArticles();
