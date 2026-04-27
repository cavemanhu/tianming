/**
 * 天命阁服务端入口
 */

const express = require('express');
const routes = require('./src/routes');

const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 统一响应处理
app.use((req, res, next) => {
  res.success = (data) => res.json({ code: 0, message: 'success', data });
  res.error = (code, message, data = null) => 
    res.json({ code, message, data });
  next();
});

// 路由
app.use('/api', routes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'tianming-dimis' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`天命阁服务已启动: http://localhost:${PORT}`);
});

module.exports = app;
