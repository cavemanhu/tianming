/**
 * 算命控制器
 */

const { success, error, CODE } = require('../utils/response');
const { generateTaskId } = require('../utils/codeGen');
const asyncTaskService = require('../services/asyncTaskService');
const baziService = require('../services/baziService');
const fortuneAnalysisService = require('../services/fortuneAnalysisService');
const yinyuanService = require('../services/yinyuanService');
const notifyService = require('../services/notifyService');
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
      const { birth_year, birth_month, birth_day, birth_hour, gender, fate_type, partner_birth } = input;
      
      let result;
      
      if (fate_type === 'yinyuan' && partner_birth) {
        // 姻缘配对分析
        const matchResult = yinyuanService.calculateMatch(
          { name: '男', gender: 'male', birthYear: birth_year, birthMonth: birth_month, birthDay: birth_day, birthTime: birth_hour || '子时' },
          { name: '女', gender: 'female', birthYear: partner_birth.year, birthMonth: partner_birth.month, birthDay: partner_birth.day, birthTime: partner_birth.hour || '子时' }
        );
        result = {
          type: 'yinyuan',
          score: matchResult.score,
          level: matchResult.level,
          details: matchResult.details,
          report: matchResult.report,
          info: matchResult.info
        };
      } else {
        // 年运分析
        const yearResult = fortuneAnalysisService.analyzeYearFortune({
          year: birth_year,
          month: birth_month,
          day: birth_day,
          time: birth_hour || '子时',
          gender: gender === 1 ? 'male' : 'female'
        });
        result = {
          type: 'bazi',
          score: yearResult.score,
          level: yearResult.level,
          levelName: yearResult.levelName,
          summary: yearResult.summary,
          details: yearResult.details,
          luckyMonth: yearResult.luckyMonth,
          unluckyMonth: yearResult.unluckyMonth,
          wuxing: yearResult.wuxing,
          bazi: yearResult.bazi,
          monthlyFortunes: yearResult.monthlyFortunes
        };
      }
      
      // 保存记录
      await FortuneRecordModel.create({
        userId: ctx.userId,
        fateType: fate_type || 'bazi',
        inputData: input,
        resultData: result,
        gemsCost: 0,
        fateLevel: result.level >= 4 ? 'great' : result.level >= 2 ? 'good' : 'normal'
      });
      
      // 发送任务完成通知
      try {
        const fateTypeName = fate_type === 'yinyuan' ? '姻缘配对' : fate_type === 'naming' ? '取名测算' : '年运分析';
        await notifyService.sendTaskCompleteNotify(ctx.userId, ctx.taskId, fateTypeName);
      } catch (notifyErr) {
        console.error('发送通知失败:', notifyErr);
      }
      
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
