# 天命阁 - 智能取名与命理预测平台

> 知命而为，顺势而行

## 📖 项目概述

**天命阁**是一款基于中国传统文化的微信小程序，融合五行八卦、易经占卜、智能取名等功能，结合古典文学（诗经、楚辞、唐诗、宋词）为用户提供专业的命理服务。

### 核心功能

| 功能 | 描述 |
|------|------|
| 🔮 算命 | 年运/月运/姻缘/事业八字分析 |
| ☯️ 易经占卜 | 64卦铜钱摇卦，自动生成爻象与解读 |
| ✍️ 智能取名 | 八字五行+诗经典故+三才五格评分 |
| 🎁 邀请裂变 | 社交分享获取更多算命次数 |
| 👤 个人中心 | 用户等级、算命记录、充值管理 |

## 🏗️ 技术架构

```
天命阁/
├── backend/                 # Express + SQLite 后端
│   ├── src/
│   │   ├── app.js          # 主入口
│   │   ├── routes/         # API 路由
│   │   │   ├── index.js     # 主路由
│   │   │   ├── yijing.js    # 易经路由
│   │   │   └── fatename.js  # 取名路由
│   │   └── services/       # 业务服务
│   │       ├── yijing.js    # 易经64卦服务
│   │       ├── fatename.js  # 智能取名服务
│   │       ├── baziService.js
│   │       └── yinyuanService.js
│   └── data/               # SQLite 数据库
│       └── tianming.db
│
├── frontend/               # UniApp + Vue3 前端
│   ├── src/
│   │   ├── pages/          # 页面组件
│   │   │   ├── index/       # 首页（6大功能入口）
│   │   │   ├── fortune/     # 算命模块
│   │   │   ├── fatename/    # 智能取名页
│   │   │   ├── yijing/      # 易经占卜页
│   │   │   ├── history/     # 历史记录
│   │   │   └── profile/     # 个人中心
│   │   └── services/        # API 调用
│   └── pages.json           # 路由配置
│
└── docs/                    # 项目文档
```

## 🔧 技术栈

### 后端
- **运行时**: Node.js 18+
- **框架**: Express 4.x
- **数据库**: SQLite (better-sqlite3)
- **端口**: 3000

### 前端
- **框架**: UniApp + Vue 3
- **构建**: Vite
- **样式**: SCSS
- **发布**: 微信小程序 / H5

### 设计
- **风格**: 新中式（深墨色 + 古铜金）
- **配色**: 五行色彩系统

## 🚀 快速启动

### 后端启动

```bash
cd backend
npm install
node src/app.js
# 服务运行在 http://localhost:3000
```

### 前端启动（H5模式）

```bash
cd frontend
npm install
npm run dev:h5
# 访问 http://localhost:8080
```

### API 测试

```bash
# 健康检查
curl http://localhost:3000/api/health

# 易经摇卦
curl -X POST http://localhost:3000/api/yijing/divine

# 智能取名
curl -X POST http://localhost:3000/api/fatename/generate \
  -H "Content-Type: application/json" \
  -d '{"birthYear":2026,"birthMonth":5,"birthDay":2,"birthHour":12,"gender":"male","surname":"李"}'
```

## 📊 功能详情

### 易经占卜 (64卦)

```javascript
// API: POST /api/yijing/divine
// 返回: 卦象 + 爻象 + 解读 + 变卦

{
  "code": 0,
  "data": {
    "hexagram": { "id": 1, "name": "乾", "gua": "☰☰", "meaning": "元亨利贞" },
    "yaoDescriptions": [
      { "position": "初爻：...", "type": "阳爻" },
      ...
    ],
    "changedHexagram": { "name": "坤", "id": 2 },
    "dongYao": ["二爻"]
  }
}
```

### 智能取名

```javascript
// API: POST /api/fatename/generate
// 返回: 五行分析 + 名字列表 + 评分

{
  "code": 0,
  "data": {
    "wuxingCount": { "金": 1, "木": 0, "水": 0, "火": 2, "土": 2 },
    "wuxingLack": ["木", "水"],
    "surname": "李",
    "names": [
      {
        "name": "李润",
        "wuxing": "水",
        "meaning": "润泽万物，寓意恩惠",
        "poetry": "润物细无声，随风潜入夜。——杜甫",
        "score": 90
      }
    ]
  }
}
```

## 🎨 设计规范

### 色彩系统

| 名称 | 色值 | 用途 |
|------|------|------|
| 深墨背景 | `#0A0A14` | 主背景 |
| 夜色蓝 | `#1C1C35` | 卡片背景 |
| 古铜金 | `#D4AF37` | 主色调 |
| 亮金色 | `#FFD700` | 高亮/按钮 |
| 五行金 | `#FFD700` | 金行标识 |
| 五行木 | `#228B22` | 木行标识 |
| 五行水 | `#0000CD` | 水行标识 |
| 五行火 | `#DC143C` | 火行标识 |
| 五行土 | `#8B4513` | 土行标识 |

### 字体

- **Logo**: Ma Shan Zheng / 楷体
- **正文**: -apple-system, Roboto, sans-serif

## 📁 项目结构

```
tianming/
├── backend/src/services/     # 后端服务
│   ├── yijing.js            # 易经64卦完整数据 + 摇卦算法
│   ├── fatename.js          # 五行分析 + 名字生成
│   ├── baziService.js       # 八字排盘
│   └── yinyuanService.js    # 姻缘匹配
├── frontend/src/pages/      # 前端页面
│   ├── index/               # 首页（6功能入口）
│   ├── fatename/            # 取名页（五行+名字列表）
│   └── yijing/              # 易经页（摇卦+爻象）
└── docs/                    # 设计文档
```

## 🔄 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v2.0 | 2026-05-02 | 新增易经64卦、智能取名功能 |
| v1.0 | 2026-04-25 | 初始版本，算命基础功能 |

## 📝 License

MIT License