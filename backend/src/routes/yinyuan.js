/**
 * 因缘路由
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/records', (req, res) => res.json({ code: 0, data: { list: [] } }));
router.post('/create', (req, res) => res.json({ code: 0, data: { id: 1 } }));

module.exports = router;
