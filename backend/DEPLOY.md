# 天命阁部署指南

## 快速部署

### 1. 准备环境
```bash
# 安装Docker和docker-compose
sudo apt update && sudo apt install docker.io docker-compose -y

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. 配置环境变量
```bash
cd ~/tianming_dimis
cp .env.example .env

# 编辑.env文件，填写以下配置：
nano .env
```

**.env配置内容：**
```env
# 数据库
MYSQL_ROOT_PASSWORD=your_mysql_root_password
DB_PASSWORD=your_mysql_password

# 微信小程序
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret

# 微信支付
WECHAT_PAY_MCHID=your_mchid
WECHAT_PAY_KEY=your_pay_key
WECHAT_PAY_NOTIFY_URL=https://your-domain.com/wx/notify

# 域名（SSL证书自动续期用）
DOMAIN=api.tianming.com
```

### 3. 启动服务
```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app
```

### 4. 初始化数据库
```bash
# 数据库会在首次启动时自动初始化
# 如果需要手动执行：
docker exec -it tianming-mysql mysql -u root -p tianming_dimis < db/init.sql
```

## 服务架构

```
┌─────────────────────────────────────────────────────────┐
│                      用户端                              │
│                  (微信小程序)                             │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTPS
                  ▼
┌─────────────────────────────────────────────────────────┐
│                    Nginx (443)                          │
│               SSL Termination + Proxy                   │
└─────────────────┬───────────────────────────────────────┘
                  │ 
                  ▼
┌─────────────────────────────────────────────────────────┐
│                Node.js App (:3000)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ 用户模块  │ │ 算命模块  │ │ 支付模块  │ │ 分账模块  │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────┬───────────────────────────────────────┘
                  │
       ┌──────────┴──────────┐
       ▼                     ▼
┌──────────────┐      ┌──────────────┐
│    MySQL      │      │    Redis     │
│   (:3306)     │      │   (:6379)    │
└──────────────┘      └──────────────┘
```

## Nginx配置SSL（使用Let's Encrypt）

```bash
# 安装certbot
sudo apt install certbot python3-certbot-nginx -y

# 申请SSL证书
sudo certbot --nginx -d api.tianming.com

# 自动续期测试
sudo certbot renew --dry-run
```

## 常用运维命令

```bash
# 重启服务
docker-compose restart

# 更新代码后重新构建
git pull
docker-compose build app
docker-compose up -d

# 查看日志
docker-compose logs -f

# 进入容器
docker exec -it tianming-dimis sh

# 备份数据库
docker exec tianming-mysql mysqldump -u root -p tianming_dimis > backup.sql

# 停止服务
docker-compose down
```

## 健康检查

```bash
# 检查服务状态
curl https://api.tianming.com/health

# 预期响应
{"status":"ok","service":"tianming-dimis"}
```

## 分账配置

修改 `src/services/commissionService.js` 中的配置：

```javascript
const COMMISSION_CONFIG = {
  rechargeRate: 10,        // 充值分账比例%
  fortuneConsumeRate: 5,   // 消费分账比例%
  maxCommissionPerTx: 100, // 单次最大分账
  maxApprenticeLevel: 3,   // 最大师徒层级
  levelDistribution: {     // 各层级分配比例
    1: 0.6,  // 一级徒弟: 60%
    2: 0.3,  // 二级徒弟: 30%
    3: 0.1   // 三级徒弟: 10%
  }
};
```
