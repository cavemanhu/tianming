/**
 * 易经占卜API路由
 * 天命阁 v2.0
 */
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { divineFull, getAllHexagrams, getHexagramById, searchHexagram } = require('../services/yijing');

// 摇卦占卜
router.post('/divine', (req, res) => {
  try {
    const result = divineFull();
    res.json({
      code: 0,
      message: 'ok',
      data: result
    });
  } catch (err) {
    console.error('yijing divine error:', err);
    res.json({ code: -3, message: '系统错误', data: err.message });
  }
});

// 获取所有卦象
router.get('/hexagrams', (req, res) => {
  try {
    const hexagrams = getAllHexagrams();
    res.json({
      code: 0,
      message: 'ok',
      data: { hexagrams }
    });
  } catch (err) {
    res.json({ code: -3, message: '系统错误', data: err.message });
  }
});

// 获取单个卦象详情
router.get('/hexagram/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const hexagram = getHexagramById(id);
    if (!hexagram) {
      return res.json({ code: -1, message: '卦象不存在', data: null });
    }
    res.json({
      code: 0,
      message: 'ok',
      data: hexagram
    });
  } catch (err) {
    res.json({ code: -3, message: '系统错误', data: err.message });
  }
});

// 搜索卦象
router.get('/search', (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.json({ code: -1, message: '请提供卦名', data: null });
    }
    const results = searchHexagram(name);
    res.json({
      code: 0,
      message: 'ok',
      data: { results }
    });
  } catch (err) {
    res.json({ code: -3, message: '系统错误', data: err.message });
  }
});

module.exports = router;
