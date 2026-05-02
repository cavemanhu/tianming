/**
 * 算命控制器
 */

const { success, error, CODE } = require('../utils/response');
const { generateTaskId } = require('../utils/codeGen');
const asyncTaskService = require('../services/asyncTaskService');
const baziService = require('../services/baziService');
const FortuneRecordModel = require('../models/FortuneRecord');

/**
 * 获取算命记录列表
 */
async function getRecords(req, res) {
  try {
    const { page = 1, pageSize = 20, fate_type } = req.query;
    const userId = req.userId || 1; // 测试用，实际从auth中间件获取
    
    const result = await FortuneRecordModel.findByUser(userId, { page, pageSize, fateType: fate_type || null });
    
    res.json(success(result));
  } catch (err) {
    console.error('getRecords error:', err);
    res.status(500).json(error(CODE.SERVER_ERROR, '获取记录失败'));
  }
}

/**
 * 创建算命任务
 */
async function createTask(req, res) {
  try {
    const { fate_type, birth_year, birth_month, birth_day, birth_hour, gender, partner_birth } = req.body;
    
    if (!fate_type || !birth_year || !birth_month || !birth_day) {
      return res.status(400).json(error(CODE.BAD_REQUEST, '参数不完整'));
    }

    const userId = req.userId || 1; // 测试用
    const inputData = {
      fate_type,
      birth_year,
      birth_month,
      birth_day,
      birth_hour: birth_hour || 0,
      gender: gender || 0,
      partner_birth: partner_birth || null
    };

    // 使用异步任务服务创建任务
    const { taskId, status } = await asyncTaskService.createTask({
      userId,
      taskType: 'fortune',
      inputData
    });

    // 注册处理函数
    asyncTaskService.registerHandler('fortune', async (input, ctx) => {
      const { birth_year, birth_month, birth_day, birth_hour, gender, fate_type } = input;
      
      // 调用八字服务计算
      const bazi = baziService.calculateBazi(birth_year, birth_month, birth_day, birth_hour);
      
      // 模拟运势分析（实际应调用fortuneAnalysisService）
      const result = {
        bazi,
        score: Math.floor(Math.random() * 30) + 70,
        level: 3,
        levelName: '中吉',
        summary: '流年运势平稳，需要把握时机',
        wuxing: { jin: 20, mu: 25, shui: 20, huo: 15, tu: 20 },
        luckyMonth: '三月',
        unluckyMonth: '九月'
      };
      
      // 保存记录
      await FortuneRecordModel.create({
        userId: ctx.userId,
        fateType: fate_type || 'bazi',
        inputData: input,
        resultData: result,
        gemsCost: 0,
        fateLevel: result.level >= 4 ? 'great' : result.level >= 2 ? 'good' : 'normal'
      });
      
      return result;
    });

    res.json(success({ task_id: taskId, status }));
  } catch (err) {
    console.error('createTask error:', err);
    res.status(500).json(error(CODE.SERVER_ERROR, '创建任务失败'));
  }
}

/**
 * 查询算命结果
 */
async function getResult(req, res) {
  try {
    const { task_id } = req.params;
    const userId = req.userId || 1;
    
    const task = await asyncTaskService.getTaskStatus(task_id, userId);
    
    if (!task) {
      return res.status(404).json(error(CODE.NOT_FOUND, '任务不存在'));
    }
    
    res.json(success({
      task_id: task.taskId,
      task_status: task.status,
      progress: task.progress,
      result_data: task.resultData,
      error_msg: task.errorMsg
    }));
  } catch (err) {
    console.error('getResult error:', err);
    res.status(500).json(error(CODE.SERVER_ERROR, '查询失败'));
  }
}

/**
 * 获取单条记录详情
 */
async function getRecordById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId || 1;
    
    const record = await FortuneRecordModel.findById(id, userId);
    
    if (!record) {
      return res.status(404).json(error(CODE.NOT_FOUND, '记录不存在'));
    }
    
    res.json(success(record));
  } catch (err) {
    console.error('getRecordById error:', err);
    res.status(500).json(error(CODE.SERVER_ERROR, '查询失败'));
  }
}

module.exports = {
  getRecords,
  createTask,
  getResult,
  getRecordById
};