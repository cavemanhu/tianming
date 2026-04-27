/**
 * 用户路由
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// 微信登录
router.post('/login', userController.login);

// 验证邀请码 (需要登录)
router.get('/check-invite-code', authMiddleware, userController.checkInviteCode);

// 获取用户信息
router.get('/info', authMiddleware, userController.getInfo);

// 更新用户信息
router.put('/info', authMiddleware, userController.updateInfo);

// 获取我的邀请码
router.get('/invite-code', authMiddleware, userController.getInviteCode);

// 获取徒弟列表
router.get('/apprentices', authMiddleware, userController.getApprentices);

module.exports = router;
