/**
 * 取名API路由
 * 天命阁 v2.0
 */
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../models/database');
const fatenameService = require('../services/fatename');

// 生成名字
router.post('/generate', (req, res) => {
  try {
    const { birthYear, birthMonth, birthDay, birthHour, gender, surname } = req.body;
    
    if (!birthYear || !birthMonth || !birthDay || !gender || !surname) {
      return res.json({ code: -1, message: '参数不完整', data: null });
    }
    
    const result = fatenameService.generate(
      parseInt(birthYear),
      parseInt(birthMonth),
      parseInt(birthDay),
      gender,
      surname
    );
    
    const recordId = uuidv4();
    const db = getDb();
    
    db.prepare(`
      INSERT INTO fortune_records (id, type, input_json, result_json, status)
      VALUES (?, ?, ?, ?, 'done')
    `).run(recordId, 'fatename', JSON.stringify(req.body), JSON.stringify(result));
    
    res.json({
      code: 0,
      message: 'ok',
      data: {
        id: recordId,
        ...result
      }
    });
  } catch (err) {
    console.error('fatename error:', err);
    res.json({ code: -3, message: '系统错误', data: err.message });
  }
});

// 获取名字典故
router.get('/poetry/:name', (req, res) => {
  try {
    const { name } = req.params;
    const { matchPoetry } = require('../services/fatename');
    const poetry = matchPoetry(name);
    res.json({
      code: 0,
      message: 'ok',
      data: poetry
    });
  } catch (err) {
    res.json({ code: -3, message: '系统错误', data: err.message });
  }
});

module.exports = router;
