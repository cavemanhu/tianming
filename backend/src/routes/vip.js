/**
 * VIP路由
 */

const express = require('express');
const router = express.Router();
const vipController = require('../controllers/vipController');
const authMiddleware = require('../middleware/auth');

// 获取VIP套餐列表 (不需要登录)
router.get('/packages', vipController.getPackages);

// 获取VIP状态 (需要登录)
router.get('/status', authMiddleware, vipController.getStatus);

// 创建VIP订单 (需要登录)
router.post('/order', authMiddleware, vipController.createOrder);

// VIP支付回调 (不需要登录，微信支付回调)
router.post('/notify', vipController.notify);

module.exports = router;
