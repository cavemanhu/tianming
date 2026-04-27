# 天命阁 - 命运预测微信小程序

<div align="center">

![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Platform](https://img.shields.io/badge/Platform-WeChat%20Mini%20Program-green)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-orange)
![Database](https://img.shields.io/badge/Database-MySQL%208.0-red)

</div>

## 📖 项目简介

天命阁是一款基于微信小程序的命运预测应用，提供八字算命、姻缘测算、起名等功能。

## 🏗️ 项目结构

```
tianming/
├── frontend/          # 微信小程序前端 (uni-app + Vue3 + Vite)
├── backend/           # Node.js 后端服务 (Express + MySQL)
├── docs/              # 项目文档
└── README.md
```

## 🚀 快速开始

### 后端部署

```bash
cd backend
npm install
cp .env.example .env   # 修改数据库配置
npm start
```

### 前端部署

1. 在微信开发者工具中导入 `frontend` 目录
2. 修改 `src/utils/request.js` 中的 API 地址
3. 编译预览

## 📋 技术栈

| 模块 | 技术 |
|------|------|
| 前端框架 | uni-app + Vue 3 + Vite |
| 后端框架 | Express.js |
| 数据库 | MySQL 8.0 |
| 认证 | 微信小程序登录 |
| API | RESTful |

## 📝 文档

- [本地部署指南](./frontend/README.md)
- [后端部署说明](./backend/README_LOCAL.md)
- [登录页面设计](./frontend/docs/login_page_design.md)
- [项目结构说明](./frontend/docs/project_structure.md)

---

*知命而为，顺势而行*
