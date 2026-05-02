/**
 * 算命记录模型
 */

const db = require('../config/database');

class FortuneRecordModel {
  /**
   * 创建算命记录
   */
  static async create({ userId, fateType, inputData, resultData, gemsCost = 0, fateLevel = 'normal' }) {
    const [result] = await db.query(
      `INSERT INTO fortune_records (user_id, fate_type, input_data, result_data, gems_cost, fate_level, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`,
      [userId, fateType, JSON.stringify(inputData), JSON.stringify(resultData), gemsCost, fateLevel]
    );
    return { id: result.insertId };
  }

  /**
   * 根据用户查询记录列表
   */
  static async findByUser(userId, { page = 1, pageSize = 20, fateType = null } = {}) {
    const offset = (page - 1) * pageSize;
    let whereClause = 'user_id = ?';
    const params = [userId];
    
    if (fateType) {
      whereClause += ' AND fate_type = ?';
      params.push(fateType);
    }
    
    const [rows] = await db.query(
      `SELECT id, fate_type, input_data, result_data, gems_cost, fate_level, status, created_at
       FROM fortune_records 
       WHERE ${whereClause}
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, Number(pageSize), offset]
    );
    
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM fortune_records WHERE ${whereClause}`,
      params
    );
    
    return {
      list: rows.map(r => ({
        ...r,
        input_data: typeof r.input_data === 'string' ? JSON.parse(r.input_data) : r.input_data,
        result_data: typeof r.result_data === 'string' ? JSON.parse(r.result_data) : r.result_data
      })),
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total
      }
    };
  }

  /**
   * 根据ID查询记录
   */
  static async findById(id, userId) {
    const [rows] = await db.query(
      `SELECT * FROM fortune_records WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    if (rows.length === 0) return null;
    
    const r = rows[0];
    return {
      ...r,
      input_data: typeof r.input_data === 'string' ? JSON.parse(r.input_data) : r.input_data,
      result_data: typeof r.result_data === 'string' ? JSON.parse(r.result_data) : r.result_data
    };
  }
}

module.exports = FortuneRecordModel;