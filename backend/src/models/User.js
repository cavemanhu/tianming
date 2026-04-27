/**
 * 用户模型
 */

const db = require('../config/database');
const { generateInviteCode } = require('../utils/codeGen');

class UserModel {
  /**
   * 根据openid查找用户
   */
  static async findByOpenid(openid) {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE openid = ? AND status != 0',
      [openid]
    );
    return rows[0] || null;
  }

  /**
   * 根据id查找用户
   */
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, openid, nickname, avatar_url, phone, invite_code, referrer_id, gems, level, status, last_login_at, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * 根据邀请码查找用户
   */
  static async findByInviteCode(code) {
    const [rows] = await db.query(
      'SELECT id, nickname FROM users WHERE invite_code = ? AND status = 1',
      [code]
    );
    return rows[0] || null;
  }

  /**
   * 创建新用户
   */
  static async create({ openid, nickname = '', avatar_url = '', referrer_code = null }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 生成唯一邀请码
      let inviteCode;
      let isUnique = false;
      while (!isUnique) {
        inviteCode = generateInviteCode();
        const [existing] = await conn.query(
          'SELECT id FROM users WHERE invite_code = ?',
          [inviteCode]
        );
        isUnique = existing.length === 0;
      }

      // 处理师徒关系
      let referrerId = null;
      if (referrer_code) {
        const [referrerRows] = await conn.query(
          'SELECT id FROM users WHERE invite_code = ? AND status = 1',
          [referrer_code]
        );
        if (referrerRows.length > 0) {
          referrerId = referrerRows[0].id;
        }
      }

      const [result] = await conn.query(
        `INSERT INTO users (openid, nickname, avatar_url, invite_code, referrer_id, referrer_code, gems, last_login_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [openid, nickname, avatar_url, inviteCode, referrerId, referrer_code, 100] // 新用户送100天命币
      );

      await conn.commit();
      return { id: result.insertId, invite_code: inviteCode };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * 更新用户最后登录时间
   */
  static async updateLastLogin(id) {
    await db.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [id]
    );
  }

  /**
   * 更新用户信息
   */
  static async updateInfo(id, { nickname, avatar_url, phone }) {
    const fields = [];
    const values = [];
    if (nickname !== undefined) { fields.push('nickname = ?'); values.push(nickname); }
    if (avatar_url !== undefined) { fields.push('avatar_url = ?'); values.push(avatar_url); }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
    
    if (fields.length === 0) return;

    values.push(id);
    await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * 获取徒弟列表
   */
  static async getApprentices(masterId, { page = 1, pageSize = 20 }) {
    const offset = (page - 1) * pageSize;
    const [rows] = await db.query(
      `SELECT id, nickname, avatar_url, gems, level, created_at 
       FROM users WHERE referrer_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [masterId, Number(pageSize), offset]
    );
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) as total FROM users WHERE referrer_id = ?',
      [masterId]
    );
    return { list: rows, total };
  }

  /**
   * 增减天命币
   */
  static async updateGems(id, amount) {
    await db.query(
      'UPDATE users SET gems = gems + ? WHERE id = ? AND gems + ? >= 0',
      [amount, id, amount]
    );
  }
}

module.exports = UserModel;
