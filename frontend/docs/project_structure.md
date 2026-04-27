# 天命阁小程序 - UniApp项目结构

**版本**: v1.0  
**日期**: 2026-04-24  
**状态**: ✅ 初始化完成

---

## 项目结构

```
tianming-app/
├── src/
│   ├── pages/                    # 页面目录
│   │   ├── login/               # 登录页
│   │   │   └── index.vue
│   │   ├── index/               # 首页
│   │   │   └── index.vue
│   │   ├── fortune/             # 算命结果页
│   │   │   └── index.vue
│   │   ├── history/             # 历史记录
│   │   │   └── index.vue
│   │   ├── profile/             # 个人中心
│   │   │   └── index.vue
│   │   └── share/               # 分享页
│   │       └── index.vue
│   │
│   ├── components/              # 组件目录
│   │   ├── FortuneCard/         # 算命结果卡片
│   │   │   └── FortuneCard.vue
│   │   ├── WuxingChart/         # 五行分布图
│   │   │   └── WuxingChart.vue
│   │   ├── ShareCard/           # 分享卡片
│   │   │   └── ShareCard.vue
│   │   ├── LevelBadge/          # 等级徽章
│   │   │   └── LevelBadge.vue
│   │   └── LoadingSpinner/       # 加载动画
│   │       └── LoadingSpinner.vue
│   │
│   ├── static/                   # 静态资源
│   │   ├── images/              # 图片资源
│   │   ├── icons/               # 图标资源
│   │   │   ├── tab-bar/         # TabBar图标
│   │   │   └── common/          # 通用图标
│   │   └── tabs/                # TabBar专用图片
│   │       ├── home.png
│   │       ├── home-active.png
│   │       ├── history.png
│   │       ├── history-active.png
│   │       ├── profile.png
│   │       └── profile-active.png
│   │
│   ├── styles/                  # 样式目录
│   │   ├── variables.scss       # CSS变量
│   │   ├── mixins.scss          # 混入
│   │   └── common.scss          # 公共样式
│   │
│   ├── utils/                    # 工具函数
│   │   ├── request.js           # 请求封装
│   │   ├── auth.js             # 认证工具
│   │   └── storage.js          # 本地存储
│   │
│   ├── store/                   # Pinia状态管理
│   │   ├── index.js
│   │   ├── user.js             # 用户状态
│   │   └── fortune.js          # 算命状态
│   │
│   ├── services/               # API服务层
│   │   ├── user.js             # 用户相关API
│   │   ├── fortune.js          # 算命相关API
│   │   └── index.js            # API导出
│   │
│   ├── pages.json              # 页面路由配置
│   ├── manifest.json           # 应用配置
│   ├── uni.scss                # UniApp全局样式
│   └── App.vue                 # 应用入口
│
├── static/                      # 微信小程序静态资源(根目录)
│
├── docs/                        # 设计文档
│   ├── tianming_ui_spec.md     # UI设计规范
│   ├── login_page_design.md    # 登录页设计
│   └── api_spec.md            # API接口规范(待完善)
│
├── package.json
├── vite.config.js              # Vite配置
└── README.md
```

---

## 页面配置 (pages.json)

```json
{
  "pages": [
    {
      "path": "pages/login/index",
      "style": {
        "navigationBarTitleText": "登录",
        "navigationStyle": "custom"
      }
    },
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "天命阁",
        "navigationBarBackgroundColor": "#1A1A2E"
      }
    },
    {
      "path": "pages/fortune/index",
      "style": {
        "navigationBarTitleText": "命格详情"
      }
    },
    {
      "path": "pages/history/index",
      "style": {
        "navigationBarTitleText": "历史记录"
      }
    },
    {
      "path": "pages/profile/index",
      "style": {
        "navigationBarTitleText": "个人中心"
      }
    },
    {
      "path": "pages/share/index",
      "style": {
        "navigationBarTitleText": "分享命运"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "white",
    "navigationBarBackgroundColor": "#1A1A2E",
    "backgroundColor": "#0D0D1A"
  },
  "tabBar": {
    "color": "#6B6B80",
    "selectedColor": "#FFD700",
    "backgroundColor": "#1A1A2E",
    "list": [
      { "pagePath": "pages/index/index", "text": "首页", "iconPath": "static/tabs/home.png", "selectedIconPath": "static/tabs/home-active.png" },
      { "pagePath": "pages/history/index", "text": "记录", "iconPath": "static/tabs/history.png", "selectedIconPath": "static/tabs/history-active.png" },
      { "pagePath": "pages/profile/index", "text": "我的", "iconPath": "static/tabs/profile.png", "selectedIconPath": "static/tabs/profile-active.png" }
    ]
  }
}
```

---

## 多端适配策略

### 微信小程序 (#ifdef MP-WEIXIN)
- 使用`rpx`单位实现自适应
- 调用微信专属API (open-type, open-type="share")
- 使用微信登录组件

### H5 (#ifdef H5)
- 响应式布局，1rem = 16px
- 使用history路由模式
- 跨域处理

### APP (#ifdef APP-PLUS)
- 原生交互体验
- 可隐藏TabBar
- 使用NVue提升性能

---

## 环境配置

| 环境 | 域名/地址 | 说明 |
|------|----------|------|
| 开发环境 | http://localhost:8080 | 本地开发 |
| 测试环境 | https://api-dev.tianming.com | 戴密斯科后端 |
| 生产环境 | https://api.tianming.com | 正式服务器 |

---

## 安装与运行

```bash
# 安装依赖
npm install

# 开发微信小程序
npm run dev:mp-weixin

# 开发H5
npm run dev:h5

# 构建H5
npm run build:h5
```

---

_版本: v1.0 | 2026-04-24_