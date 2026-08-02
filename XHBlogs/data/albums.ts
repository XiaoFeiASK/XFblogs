// 🛡️ 本文件由 XingHuiSama 控制台自动生成，请勿手动修改
export interface Photo { url: string; caption?: string; }
export interface Album { id: string; title: string; description: string; cover: string; date: string; photos: Photo[]; }

export const albums: Album[] = [
  {
    "id": "history-tour",
    "title": "唐宋历史巡游",
    "description": "寻访千年前的长安与汴梁遗迹",
    "cover": "https://img.cdn1.vip/i/6a6f1809dc025_1785665545.webp",
    "date": "2025.10",
    "photos": [
      {
        "url": "https://img.cdn1.vip/i/6a6f14c8b6601_1785664712.webp"
      }
    ]
  }
];