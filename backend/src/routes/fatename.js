/**
 * 取名路由
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const namingService = require('../services/namingService');
const { success, error, CODE } = require('../utils/response');

// 取名记录列表（需要登录）
router.get('/records', authMiddleware, async (req, res) => {
  try {
    // TODO: 从数据库获取取名记录
    res.json(success({ list: [] }));
  } catch (err) {
    console.error('getNamingRecords error:', err);
    res.status(500).json(error(CODE.SERVER_ERROR, '获取记录失败'));
  }
});

/**
 * 创建取名任务
 * POST /api/fatename/create
 */
router.post('/create', async (req, res) => {
  try {
    const { birth_year, birth_month, birth_day, birth_hour, gender, surname, name_style } = req.body;
    
    if (!birth_year || !birth_month || !birth_day) {
      return res.status(400).json(error(CODE.BAD_REQUEST, '出生日期不完整'));
    }
    
    if (!gender) {
      return res.status(400).json(error(CODE.BAD_REQUEST, '缺少性别参数'));
    }
    
    // 调用取名服务
    const result = namingService.generateNames({
      birthYear: birth_year,
      birthMonth: birth_month,
      birthDay: birth_day,
      birthTime: birth_hour || '子时',
      gender: gender === 1 ? 1 : 2, // 1=男 2=女
      surname: surname || '',
      nameStyle: name_style || 'modern'
    });
    
    res.json(success({
      task_id: `naming_${Date.now()}`,
      status: 'completed',
      result_data: result
    }));
  } catch (err) {
    console.error('createNaming error:', err);
    res.status(500).json(error(CODE.SERVER_ERROR, '取名服务异常'));
  }
});

/**
 * 获取单条取名结果
 * GET /api/fatename/result/:task_id
 */
router.get('/result/:task_id', async (req, res) => {
  try {
    const { task_id } = req.params;
    
    // 取名是同步的，直接返回
    res.json(success({
      task_id,
      task_status: 'completed',
      result_data: null // 结果在create时已返回
    }));
  } catch (err) {
    console.error('getNamingResult error:', err);
    res.status(500).json(error(CODE.SERVER_ERROR, '查询失败'));
  }
});

module.exports = router;
