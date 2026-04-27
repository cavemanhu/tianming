/**
 * 算命控制器
 */

const { success, error, CODE } = require('../utils/response');
const { generateTaskId } = require('../utils/codeGen');

/**
 * 获取算命记录列表
 */
async function getRecords(req, res) {
  try {
    const { page = 1, pageSize = 20, fate_type } = req.query;
    // const records = await FortuneRecordModel.findByUser(req.userId, { page, pageSize, fate_type });
    res.json(success({
      list: [],
      pagination: { page: Number(page), pageSize: Number(pageSize), total: 0 }
    }));
  } catch (err) {
    res.status(500).json(error(CODE.SERVER_ERROR, '获取记录失败'));
  }
}

/**
 * 创建算命任务
 */
async function createTask(req, res) {
  try {
    const { fate_type, input_data } = req.body;
    
    if (!fate_type || !input_data) {
      return res.status(400).json(error(CODE.BAD_REQUEST, '参数不完整'));
    }

    const taskId = generateTaskId();
    // 创建异步任务记录
    // const task = await AsyncTaskModel.create({ task_id: taskId, user_id: req.userId, task_type: 'fortune', input_data });
    
    res.json(success({ task_id: taskId }));
  } catch (err) {
    res.status(500).json(error(CODE.SERVER_ERROR, '创建任务失败'));
  }
}

/**
 * 查询算命结果
 */
async function getResult(req, res) {
  try {
    const { task_id } = req.params;
    // const task = await AsyncTaskModel.findByTaskId(task_id);
    const task = {
      task_id,
      task_status: 'completed',
      result_data: { message: '算命结果' }
    };
    res.json(success(task));
  } catch (err) {
    res.status(500).json(error(CODE.SERVER_ERROR, '查询失败'));
  }
}

module.exports = { getRecords, createTask, getResult };
