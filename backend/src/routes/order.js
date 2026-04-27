/**
 * 订单路由
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// 充值
router.post('/recharge', orderController.recharge);

// 订单列表
router.get('/list', orderController.getList);

module.exports = router;
