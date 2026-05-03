/**
 * 路由汇总
 */

const express = require('express');
const router = express.Router();

router.use('/user', require('./user'));
router.use('/fortune', require('./fortune'));
router.use('/yinyuan', require('./yinyuan'));
router.use('/fatename', require('./fatename'));
router.use('/order', require('./order'));
router.use('/vip', require('./vip'));

module.exports = router;
