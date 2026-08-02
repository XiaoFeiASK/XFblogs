// siteConfig.ts - 你的全站“控制中心”

export const siteConfig = {
  // 1. 网站标题与博主信息
  title: "XiaoFei の 宝藏之地",
  faviconUrl: "https://img.cdn1.vip/i/6a6f0de71da3b_1785662951.webp",
  authorName: "XiaoFei",
  bio: "专注于后端开发与Agent/大模型应用开发的初学者，我期待任意形式的实习机会~",

  navTitle: "XiaoFei",

  // 👇 【新增】导航栏中间的那个后缀/分隔符（默认是 の）
  navSuffix: "の",

  navAfter: "宝藏之地",

  // 2. 头像设置 (支持网络链接，或将图片放入 public 文件夹后使用 "/me.jpg")
  avatarUrl: "https://img.cdn1.vip/i/6a6f0de71da3b_1785662951.webp",

  // 3. 网站背景设置 (二选一)
  // 如果想用纯图片背景，请在下面 bgImage 写路径，并将 useGradient 设为 false
  useGradient: false,
  themeColors: ["#a18cd1", "#fbc2eb", "#a1c4fd", "#c2e9fb"], // 呼吸流动的颜色组合
// 修改这里：变成图片数组
  bgImages: ["https://bu.dusays.com/2026/03/24/69c26fe4acdb5.jpg", "https://img.cdn1.vip/i/6a6f14c8b6601_1785664712.webp", "https://img.cdn1.vip/i/6a6f1af4b6cdb_1785666292.webp"],

  // 4. 文章默认封面图 (当 Markdown 没写 cover 时显示)
  defaultPostCover: "https://bu.dusays.com/2026/03/24/69c1e38b346cb.jpg",

  // 5. 首页照片墙预览图
  photoWallImage: "https://bu.dusays.com/2026/03/24/69c1e38b4c370.jpg",
  cloudMusicIds: ["1809646618", "3361076230", "1859390262"],
  social: {
    github: "https://github.com/XiaoFeiASK",
    gitee: "https://github.com/XiaoFeiASK",
    csdn: "https://blog.csdn.net/Xiao_FeiA?type=blog",
    email: "2017382524@qq.com",
    qq: "2017382524",
    wechat: "qq2017382524",
  },
  counts: {
    photos: 128, // 照片墙数量可以手动写死或动态计算
  },
  // 👇 【新增】：图床核心配置 (PicBed Configuration)
  picBedName: "图床",
  picBedUrl: "", // 默认的 Lsky Pro API 地址
  picBedToken: "", // 留空，等你能在后台填入并覆写

  // 👇 【新增】：全局背景弹幕配置
  danmakuList: ["在干嘛呢？", "有笨蛋嘛？", "前方高能反应！", "GROMACS 跑起来了吗？", "MD 模拟什么时候才能出图啊", "Graph Neural Networks 炼丹中...", "BUG 修复进度 99%", "今天背单词了吗？", "Tailwind CSS 拯救前端", "写算法中", "睡大觉中", "到底在干嘛？"],
  gitalkConfig: {
    clientID: "",
    clientSecret: "",
    repo: "",
    owner: "",
    admin: [""],
  },
  buildDate: "2026-03-23T00:00:00", // 建站日期
  footerBadges: [{"name": "Agent", "color": "text-indigo-500", "svg": "<path d=\"M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z\"/>"}, {"name": "Golang", "color": "text-teal-400", "svg": "<path d=\"M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z\"/>"}, {"name": "Java", "color": "text-cyan-400", "svg": "<path d=\"M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z\"/>"}, {"name": "Python", "color": "text-sky-500", "svg": "<path d=\"M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z\"/>"}],
  icpConfig: {
    name: "萌ICP备 20260240号",
    link: "https://icp.gov.moe/?keyword=20260240",
  },
  friendLinkApplyFormat: "名称：XingHuiSamaの宝藏之地\n简介：今天也可以学计算机吗？\n链接：https://www.xinghuisama.top\n头像：https://bu.dusays.com/2026/03/24/69c1e38ac1846.jpg",
  enableLevelSystem: true,
};
