const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, 'data.json');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}${ext}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }
});

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  }
  return null;
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

const defaultData = {
  articles: [
    {
      id: 1,
      title: '欢迎使用 lvy-neko Wiki',
      slug: 'welcome',
      content: '# 欢迎\n\n这是你的第一篇博客文章。你可以在 **管理后台** 编辑或删除它。\n\n## 功能特性\n\n- Markdown 文章编辑\n- 自定义主题颜色\n- 玻璃拟态设计风格\n- 响应式布局\n\n## 代码示例\n\n```javascript\nconsole.log("Hello, Wiki!");\n```\n\n> 开始创建你的第一篇文章吧！',
      summary: '欢迎来到 lvy-neko Wiki，开始你的创作之旅。',
      cover_image: '',
      tags: '欢迎,教程',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 0,
      published: true
    },
    {
      id: 2,
      title: 'Markdown 语法指南',
      slug: 'markdown-guide',
      content: '# Markdown 语法指南\n\n## 标题\n\n使用 `#` 来创建标题，最多支持六级标题。\n\n## 强调\n\n- **粗体** 使用 `**文字**`\n- *斜体* 使用 `*文字*`\n- ~~删除线~~ 使用 `~~文字~~`\n\n## 列表\n\n1. 有序列表项 1\n2. 有序列表项 2\n3. 有序列表项 3\n\n- 无序列表项\n- 无序列表项\n\n## 链接与图片\n\n[链接文字](https://example.com)\n\n## 代码\n\n行内代码：`const x = 1;`\n\n代码块：\n\n```python\ndef hello():\n    print("Hello World")\n```\n\n## 引用\n\n> 这是一段引用文字。\n\n## 表格\n\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| A   | B   | C   |\n| D   | E   | F   |',
      summary: '学习 Markdown 基本语法，让你的文章更加美观。',
      cover_image: '',
      tags: '教程,Markdown',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 0,
      published: true
    }
  ],
  settings: {
    site_name: '小飞',
    site_description: 'wiki',
    color_brand: '#35bfab',
    color_brand_secondary: '#1fc9e7',
    color_primary: '#334f52',
    color_secondary: '#7b888e',
    color_bg: '#eeeeee',
    color_border: '#ffffff',
    color_card: '#ffffff66',
    color_article: '#ffffffcc',
    greeting: 'Good Night',
    intro_text: 'I\'m <span class="text-linear">lvy</span>, Nice to<br>meet you!',
    github_url: '',
    bilibili_url: '',
    xiaohongshu_url: '',
    email: ''
  },
  nextId: 3
};

let db = loadData() || defaultData;
if (!loadData()) saveData(db);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadDir));

app.get('/api/settings', (req, res) => {
  res.json(db.settings);
});

app.put('/api/settings', (req, res) => {
  db.settings = { ...db.settings, ...req.body };
  saveData(db);
  res.json({ success: true });
});

app.get('/api/articles', (req, res) => {
  const { page = 1, limit = 20, tag, search } = req.query;
  let articles = db.articles.filter(a => a.published);

  if (tag) articles = articles.filter(a => a.tags && a.tags.includes(tag));
  if (search) {
    const q = search.toLowerCase();
    articles = articles.filter(a => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q));
  }

  articles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const total = articles.length;
  const offset = (Number(page) - 1) * Number(limit);
  articles = articles.slice(offset, offset + Number(limit));

  res.json({ articles, total, page: Number(page), limit: Number(limit) });
});

app.get('/api/articles/all', (req, res) => {
  const articles = [...db.articles].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(articles);
});

app.get('/api/articles/:slug', (req, res) => {
  const article = db.articles.find(a => a.slug === req.params.slug);
  if (!article) return res.status(404).json({ error: 'Article not found' });
  article.views = (article.views || 0) + 1;
  saveData(db);
  res.json({ ...article, html: marked(article.content) });
});

app.post('/api/articles', (req, res) => {
  const { title, slug, content, summary, cover_image, tags, published } = req.body;
  if (!title || !slug) return res.status(400).json({ error: 'Title and slug are required' });
  if (db.articles.find(a => a.slug === slug)) return res.status(400).json({ error: 'Slug already exists' });

  const article = {
    id: db.nextId++,
    title,
    slug,
    content: content || '',
    summary: summary || '',
    cover_image: cover_image || '',
    tags: tags || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    views: 0,
    published: published !== undefined ? published : true
  };
  db.articles.push(article);
  saveData(db);
  res.json({ id: article.id });
});

app.put('/api/articles/:id', (req, res) => {
  const idx = db.articles.findIndex(a => a.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Article not found' });

  const { title, slug, content, summary, cover_image, tags, published } = req.body;
  db.articles[idx] = {
    ...db.articles[idx],
    title, slug,
    content: content || '',
    summary: summary || '',
    cover_image: cover_image || '',
    tags: tags || '',
    published: published !== undefined ? published : true,
    updated_at: new Date().toISOString()
  };
  saveData(db);
  res.json({ success: true });
});

app.delete('/api/articles/:id', (req, res) => {
  db.articles = db.articles.filter(a => a.id !== Number(req.params.id));
  saveData(db);
  res.json({ success: true });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.get('/article/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'article.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
