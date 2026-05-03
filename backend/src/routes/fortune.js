/**
 * 算命路由
 */

const express = require('express');
const router = express.Router();
const fortuneController = require('../controllers/fortuneController');
const exportController = require('../controllers/exportController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// 算命记录列表
router.get('/records', fortuneController.getRecords);

// 创建算命任务
router.post('/create', fortuneController.createTask);

// 查询算命结果
router.get('/result/:task_id', fortuneController.getResult);

// 导出PDF报告
router.get('/export/:id', exportController.exportPDF);

module.exports = router;
