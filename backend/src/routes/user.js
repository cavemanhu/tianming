/**
 * 用户API路由
 */
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../models/database');

// 微信登录/注册
router.post('/login', (req, res) => {
  try {
    const { openid, nickname, avatar } = req.body;
    
    if (!openid) {
      return res.json({ code: -1, message: 'openid不能为空', data: null });
    }
    
    const db = getDb();
    let user = db.prepare('SELECT * FROM users WHERE openid = ?').get(openid);
    
    if (!user) {
      // 新用户注册
      const userId = uuidv4();
      db.prepare(`
        INSERT INTO users (id, openid, nickname, avatar, level, free_count)
        VALUES (?, ?, ?, ?, 1, 3)
      `).run(userId, openid, nickname || '天命用户', avatar || '');
      
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    } else {
      // 更新昵称头像
      if (nickname || avatar) {
        db.prepare('UPDATE users SET nickname = COALESCE(?, nickname), avatar = COALESCE(?, avatar), updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run(nickname, avatar, user.id);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
      }
    }
    
    res.json({
      code: 0,
      message: 'ok',
      data: {
        id: user.id,
        openid: user.openid,
        nickname: user.nickname,
        avatar: user.avatar,
        level: user.level,
        freeCount: user.free_count,
        inviteCount: user.invite_count
      }
    });
  } catch (err) {
    console.error('login error:', err);
    res.json({ code: -3, message: '系统错误', data: err.message });
  }
});

// 获取用户信息
router.get('/info', (req, res) => {
  try {
    const { openid } = req.query;
    if (!openid) {
      return res.json({ code: -1, message: 'openid不能为空', data: null });
    }
    
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE openid = ?').get(openid);
    
    if (!user) {
      return res.json({ code: -1, message: '用户不存在', data: null });
    }
    
    res.json({
      code: 0,
      message: 'ok',
      data: {
        id: user.id,
        openid: user.openid,
        nickname: user.nickname,
        avatar: user.avatar,
        level: user.level,
        freeCount: user.free_count,
        inviteCount: user.invite_count
      }
    });
  } catch (err) {
    res.json({ code: -3, message: '系统错误', data: err.message });
  }
});

// 邀请回调
router.post('/invite', (req, res) => {
  try {
    const { inviterOpenid, inviteeOpenid } = req.body;
    
    if (!inviterOpenid || !inviteeOpenid) {
      return res.json({ code: -1, message: '参数不完整', data: null });
    }
    
    const db = getDb();
    const inviter = db.prepare('SELECT * FROM users WHERE openid = ?').get(inviterOpenid);
    
    if (!inviter) {
      return res.json({ code: -1, message: '邀请人不存在', data: null });
    }
    
    // 检查是否已绑定
    const existing = db.prepare('SELECT * FROM invite_records WHERE invitee_openid = ?').get(inviteeOpenid);
    if (existing) {
      return res.json({ code: -2, message: '已绑定过邀请关系', data: null });
    }
    
    // 绑定邀请关系
    const recordId = uuidv4();
    db.prepare(`
      INSERT INTO invite_records (id, inviter_id, invitee_openid, reward_sent)
      VALUES (?, ?, ?, 0)
    `).run(recordId, inviter.id, inviteeOpenid);
    
    // 更新邀请者次数和计数
    db.prepare(`
      UPDATE users SET free_count = free_count + 3, invite_count = invite_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(inviter.id);
    
    res.json({
      code: 0,
      message: 'ok',
      data: { reward: 3, newFreeCount: inviter.free_count + 3 }
    });
  } catch (err) {
    res.json({ code: -3, message: '系统错误', data: err.message });
  }
});

module.exports = router;
