/**
 * 算命API路由
 */
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../models/database');
const baziService = require('../services/baziService');
const yinyuanService = require('../services/yinyuanService');

// 算八字
router.post('/bazi', (req, res) => {
  try {
    const { name, gender, birthYear, birthMonth, birthDay, birthHour, birthMinute, openid } = req.body;
    
    if (!name || !birthYear || !birthMonth || !birthDay || !birthHour) {
      return res.json({ code: -1, message: '参数不完整', data: null });
    }
    
    const bazi = baziService.calculateBazi(name, gender, birthYear, birthMonth, birthDay, birthHour, birthMinute || 0);
    const interpretations = baziService.getBaziInterpretation(bazi);
    
    const recordId = uuidv4();
    const db = getDb();
    
    // 查找用户
    let userId = null;
    if (openid) {
      const user = db.prepare('SELECT id FROM users WHERE openid = ?').get(openid);
      if (user) userId = user.id;
    }
    
    db.prepare(`
      INSERT INTO fortune_records (id, user_id, type, input_json, result_json, status)
      VALUES (?, ?, ?, ?, ?, 'done')
    `).run(recordId, userId, 'bazi', JSON.stringify(req.body), JSON.stringify({ bazi, interpretations }));
    
    res.json({
      code: 0,
      message: 'ok',
      data: {
        id: recordId,
        bazi,
        interpretations,
        createdAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('bazi error:', err);
    res.json({ code: -3, message: '系统错误', data: err.message });
  }
});

// 获取算命结果
router.get('/result/:id', (req, res) => {
  try {
    const db = getDb();
    const record = db.prepare('SELECT * FROM fortune_records WHERE id = ?').get(req.params.id);
    
    if (!record) {
      return res.json({ code: -1, message: '记录不存在', data: null });
    }
    
    res.json({
      code: 0,
      message: 'ok',
      data: {
        id: record.id,
        type: record.type,
        result: JSON.parse(record.result_json || '{}'),
        status: record.status,
        createdAt: record.created_at
      }
    });
  } catch (err) {
    res.json({ code: -3, message: '系统错误', data: err.message });
  }
});

// 姻缘配对
router.post('/yinyuan', (req, res) => {
  try {
    const { personA, personB } = req.body;
    
    if (!personA || !personB) {
      return res.json({ code: -1, message: '参数不完整', data: null });
    }
    
    const result = yinyuanService.calculateYinyuan(personA, personB);
    
    const recordId = uuidv4();
    const db = getDb();
    
    db.prepare(`
      INSERT INTO yinyuan_records (id, user_a_data, user_b_data, result_json)
      VALUES (?, ?, ?, ?)
    `).run(recordId, JSON.stringify(personA), JSON.stringify(personB), JSON.stringify(result));
    
    res.json({
      code: 0,
      message: 'ok',
      data: { id: recordId, ...result }
    });
  } catch (err) {
    console.error('yinyuan error:', err);
    res.json({ code: -3, message: '系统错误', data: err.message });
  }
});

// 获取算命历史
router.get('/history', (req, res) => {
  try {
    const { openid, page = 1, pageSize = 20 } = req.query;
    const db = getDb();
    
    let records;
    if (openid) {
      const user = db.prepare('SELECT id FROM users WHERE openid = ?').get(openid);
      if (user) {
        records = db.prepare(`
          SELECT * FROM fortune_records WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
        `).all(user.id, parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));
      }
    }
    
    records = records || [];
    res.json({
      code: 0,
      message: 'ok',
      data: { records, page: parseInt(page), pageSize: parseInt(pageSize) }
    });
  } catch (err) {
    res.json({ code: -3, message: '系统错误', data: err.message });
  }
});

module.exports = router;
