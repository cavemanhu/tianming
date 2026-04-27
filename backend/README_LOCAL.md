# 天命阁后端 - 本地部署说明

## 📁 文件位置
```
C:\tianming_backend\
```

---

## 🗄️ 第一步：安装MySQL（Windows）

### 方法1：使用phpStudy（推荐，简单快速）
1. 下载 phpStudy：https://www.xp.cn/
2. 安装后启动
3. 切换到 MySQL 版本（选择 8.0 或 5.7）
4. 点击「启动」

### 方法2：单独安装MySQL
1. 下载 MySQL 8.0：https://dev.mysql.com/downloads/mysql/
2. 选择 Windows (x86, 64-bit), MSI Installer
3. 安装时选择「Standalone MySQL Server」
4. 设置 root 密码为：`tianming_local_2026`
5. 端口保持默认 3306

### 验证MySQL安装成功
```bash
# 打开 CMD 或 PowerShell
mysql -u root -p
# 输入密码：tianming_local_2026
# 如果进入 mysql 界面说明成功
```

---

## 🗄️ 第二步：初始化数据库

### 创建数据库和表
打开 MySQL 命令行或 phpStudy 的数据库管理界面，执行：

```sql
CREATE DATABASE IF NOT EXISTS tianming_dimis DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE tianming_dimis;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  openid VARCHAR(64) NOT NULL UNIQUE,
  nickname VARCHAR(32) DEFAULT '',
  avatar_url VARCHAR(512) DEFAULT '',
  phone VARCHAR(20) DEFAULT NULL,
  invite_code VARCHAR(8) NOT NULL UNIQUE,
  referrer_id BIGINT UNSIGNED DEFAULT NULL,
  gems INT UNSIGNED DEFAULT 0,
  level TINYINT UNSIGNED DEFAULT 1,
  status TINYINT UNSIGNED DEFAULT 1,
  last_login_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_openid (openid),
  INDEX idx_invite_code (invite_code),
  INDEX idx_referrer (referrer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 算命记录表
CREATE TABLE IF NOT EXISTS fortune_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  fate_type VARCHAR(32) NOT NULL,
  input_data JSON NOT NULL,
  result_data JSON NOT NULL,
  gems_cost INT UNSIGNED DEFAULT 0,
  fate_level VARCHAR(16) DEFAULT 'normal',
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_fate_type (fate_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 异步任务表
CREATE TABLE IF NOT EXISTS async_tasks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  task_id VARCHAR(64) NOT NULL UNIQUE,
  user_id BIGINT UNSIGNED NOT NULL,
  task_type VARCHAR(32) NOT NULL,
  task_status VARCHAR(16) DEFAULT 'pending',
  progress TINYINT UNSIGNED DEFAULT 0,
  input_data JSON DEFAULT NULL,
  result_data JSON DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_task_id (task_id),
  INDEX idx_user_task (user_id, task_type),
  INDEX idx_status (task_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 因缘记录表
CREATE TABLE IF NOT EXISTS yinyuan_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  yinyuan_type VARCHAR(32) NOT NULL,
  target_name VARCHAR(64) DEFAULT '',
  target_gender TINYINT DEFAULT 0,
  answer_data JSON DEFAULT NULL,
  gems_cost INT UNSIGNED DEFAULT 0,
  status TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 名号记录表
CREATE TABLE IF NOT EXISTS fatename_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  fatename_type VARCHAR(32) NOT NULL,
  base_name VARCHAR(64) NOT NULL,
  gender TINYINT DEFAULT 0,
  birth_time VARCHAR(32) DEFAULT '',
  elements JSON DEFAULT NULL,
  result_data JSON DEFAULT NULL,
  gems_cost INT UNSIGNED DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 充值记录表
CREATE TABLE IF NOT EXISTS recharge_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  order_no VARCHAR(64) NOT NULL UNIQUE,
  amount INT UNSIGNED NOT NULL,
  gems INT UNSIGNED NOT NULL,
  pay_status VARCHAR(16) DEFAULT 'pending',
  paid_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_order (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 师徒分账表
CREATE TABLE IF NOT EXISTS commission_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  source_user_id BIGINT UNSIGNED NOT NULL,
  amount INT UNSIGNED NOT NULL,
  level TINYINT UNSIGNED NOT NULL,
  biz_type VARCHAR(32) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 📦 第三步：安装Node.js依赖

1. 打开 PowerShell 或 CMD
2. 进入后端目录：
```bash
cd C:\tianming_backend
```
3. 安装依赖：
```bash
npm install
```

---

## ▶️ 第四步：启动后端服务

```bash
npm start
```

看到以下信息说明启动成功：
```
天命阁服务已启动: http://localhost:3000
```

---

## ✅ 第五步：验证服务

打开浏览器访问：
```
http://localhost:3000/health
```

应该返回：
```json
{"status":"ok","service":"tianming-dimis"}
```

---

## 📱 第六步：配置前端连接

修改 `C:\tianming_frontend\src\utils\request.js`：
```javascript
const BASE_URL = 'http://localhost:3000'
```

---

## 🔧 常见问题

### 问题1：MySQL连接失败
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
解决：
1. 确认 MySQL 服务已启动（phpStudy 点击启动）
2. 检查 .env 中的密码是否正确

### 问题2：端口被占用
```
Error: listen EADDRINUSE :::3000
```
解决：
1. 确认没有其他程序占用 3000 端口
2. 或修改 .env 中 PORT=3001

### 问题3：数据库表不存在
```
Error: Table 'tianming_dimis.xxx' doesn't exist
```
解决：执行上面的 SQL 建表语句

---

## 📝 配置说明

编辑 `C:\tianming_backend\.env`：

| 配置项 | 当前值 | 说明 |
|--------|--------|------|
| DB_HOST | localhost | 数据库地址 |
| DB_PORT | 3306 | 数据库端口 |
| DB_USER | root | 数据库用户名 |
| DB_PASSWORD | tianming_local_2026 | 数据库密码 |
| WECHAT_APPID | wx_your_real_appid | 填写你的真实AppID |
| WECHAT_SECRET | your_wechat_secret | 填写你的真实Secret |

---

## 🎯 下一步

后端本地运行起来后：
1. 打开微信开发者工具
2. 编译项目
3. 测试登录等功能

---

更新时间：2026-04-26 23:00
