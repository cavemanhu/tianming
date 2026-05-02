/**
 * 天命阁后端API服务
 * 主入口文件
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./models/database');
const fortuneRouter = require('./routes/fortune');
const userRouter = require('./routes/user');
const yijingRouter = require('./routes/yijing');
const fatenameRouter = require('./routes/fatename');

// 初始化数据库
initDb();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: 'ok', data: { status: 'healthy', timestamp: Date.now() } });
});

// 路由
app.use('/api/fortune', fortuneRouter);
app.use('/api/user', userRouter);
app.use('/api/yijing', yijingRouter);
app.use('/api/fatename', fatenameRouter);

// 分享卡
app.get('/api/share/:type/:id', (req, res) => {
  res.json({
    code: 0,
    message: 'ok',
    data: {
      shareUrl: `https://tianming.app/pages/share/index?id=${req.params.id}`,
      title: '我的命格分析 - 天命阁',
      desc: '快来看看你的八字命格！'
    }
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ code: -404, message: '接口不存在', data: null });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ code: -3, message: '服务器内部错误', data: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 天命阁后端服务已启动: http://localhost:${PORT}`);
  console.log(`📋 API文档:`);
  console.log(`   GET  /api/health          - 健康检查`);
  console.log(`   POST /api/fortune/bazi    - 算八字`);
  console.log(`   GET  /api/fortune/result/:id - 获取结果`);
  console.log(`   POST /api/fortune/yinyuan - 姻缘配对`);
  console.log(`   GET  /api/fortune/history - 历史记录`);
  console.log(`   POST /api/user/login      - 微信登录`);
  console.log(`   GET  /api/user/info      - 用户信息`);
  console.log(`   POST /api/user/invite     - 邀请绑定`);
  console.log(`   POST /api/yijing/divine   - 易经占卜`);
  console.log(`   GET  /api/yijing/hexagrams - 所有卦象`);
  console.log(`   POST /api/fatename/generate - 智能取名`);
  console.log(`   GET  /api/fatename/poetry/:name - 名字典故`);
});

module.exports = app;
