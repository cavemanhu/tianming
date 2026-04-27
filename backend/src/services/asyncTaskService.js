/**
 * 异步任务队列服务 - 完善版
 * 支持长时间计算任务入队、状态查询、Worker模式
 */

const db = require('../config/database');
const { generateTaskId } = require('../utils/codeGen');

// 任务状态
const TASK_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// 任务类型
const TASK_TYPES = {
  FORTUNE: 'fortune',              // 算命
  YINYUAN_MATCH: 'yinyuan_match',  // 姻缘配对
  FENGSHUI: 'fengshui',            // 风水计算
  NAMING: 'naming',                // 取名
  REPORT: 'report',                // 报告生成
  EMAIL: 'email'                   // 邮件发送
};

// 任务处理器注册表
const TASK_HANDLERS = {};

/**
 * 注册任务处理器
 */
function registerHandler(taskType, handler) {
  TASK_HANDLERS[taskType] = handler;
}

/**
 * 创建异步任务
 */
async function createTask({ userId, taskType, inputData, priority = 0 }) {
  const taskId = generateTaskId();
  
  await db.query(
    `INSERT INTO async_tasks 
     (task_id, user_id, task_type, task_status, progress, input_data, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [taskId, userId, taskType, TASK_STATUS.PENDING, 0, JSON.stringify(inputData)]
  );
  
  return { taskId, status: TASK_STATUS.PENDING };
}

/**
 * 领取任务（Worker调用）
 * 使用 FOR UPDATE SKIP LOCKED 实现原子性领取
 */
async function claimTask(workerId = 'default') {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    
    const [rows] = await conn.query(
      `SELECT * FROM async_tasks 
       WHERE task_status = ? 
       ORDER BY created_at ASC 
       LIMIT 1 
       FOR UPDATE SKIP LOCKED`,
      [TASK_STATUS.PENDING]
    );
    
    if (rows.length === 0) {
      await conn.commit();
      return null;
    }
    
    const task = rows[0];
    
    await conn.query(
      `UPDATE async_tasks 
       SET task_status = ?, started_at = NOW() 
       WHERE task_id = ?`,
      [TASK_STATUS.RUNNING, task.task_id]
    );
    
    await conn.commit();
    
    return {
      taskId: task.task_id,
      userId: task.user_id,
      taskType: task.task_type,
      inputData: typeof task.input_data === 'string' ? JSON.parse(task.input_data) : task.input_data
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * 更新任务进度
 */
async function updateProgress(taskId, progress) {
  await db.query(
    'UPDATE async_tasks SET progress = ? WHERE task_id = ?',
    [Math.min(100, Math.max(0, progress)), taskId]
  );
}

/**
 * 完成任务
 */
async function completeTask(taskId, resultData) {
  await db.query(
    `UPDATE async_tasks 
     SET task_status = ?, progress = 100, result_data = ?, completed_at = NOW() 
     WHERE task_id = ?`,
    [TASK_STATUS.COMPLETED, JSON.stringify(resultData), taskId]
  );
}

/**
 * 标记任务失败
 */
async function failTask(taskId, errorMsg) {
  await db.query(
    `UPDATE async_tasks 
     SET task_status = ?, error_msg = ?, completed_at = NOW() 
     WHERE task_id = ?`,
    [TASK_STATUS.FAILED, errorMsg, taskId]
  );
}

/**
 * 查询任务状态
 */
async function getTaskStatus(taskId, userId) {
  const [rows] = await db.query(
    `SELECT task_id, user_id, task_type, task_status, progress, 
            result_data, error_msg, created_at, started_at, completed_at
     FROM async_tasks 
     WHERE task_id = ? AND user_id = ?`,
    [taskId, userId]
  );
  
  if (rows.length === 0) {
    return null;
  }
  
  const task = rows[0];
  return {
    taskId: task.task_id,
    taskType: task.task_type,
    status: task.task_status,
    progress: task.progress,
    resultData: task.result_data ? JSON.parse(task.result_data) : null,
    errorMsg: task.error_msg,
    createdAt: task.created_at,
    startedAt: task.started_at,
    completedAt: task.completed_at
  };
}

/**
 * 获取用户的所有任务列表
 */
async function getUserTasks(userId, { page = 1, pageSize = 20, status = null, taskType = null } = {}) {
  const conditions = ['user_id = ?'];
  const params = [userId];
  
  if (status) {
    conditions.push('task_status = ?');
    params.push(status);
  }
  if (taskType) {
    conditions.push('task_type = ?');
    params.push(taskType);
  }
  
  const offset = (page - 1) * pageSize;
  const whereClause = conditions.join(' AND ');
  
  const [rows] = await db.query(
    `SELECT task_id, task_type, task_status, progress, created_at, completed_at
     FROM async_tasks 
     WHERE ${whereClause}
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [...params, Number(pageSize), offset]
  );
  
  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) as total FROM async_tasks WHERE ${whereClause}`,
    params
  );
  
  return {
    list: rows,
    pagination: {
      page: Number(page),
      pageSize: Number(pageSize),
      total
    }
  };
}

/**
 * 取消任务（仅允许取消pending状态的任务）
 */
async function cancelTask(taskId, userId) {
  const [result] = await db.query(
    `UPDATE async_tasks 
     SET task_status = ? 
     WHERE task_id = ? AND user_id = ? AND task_status = ?`,
    [TASK_STATUS.FAILED, taskId, userId, TASK_STATUS.PENDING]
  );
  return result.affectedRows > 0;
}

/**
 * 清理过期任务（默认保留7天）
 */
async function cleanupOldTasks(daysToKeep = 7) {
  const [result] = await db.query(
    `DELETE FROM async_tasks 
     WHERE task_status IN (?, ?) 
     AND completed_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [TASK_STATUS.COMPLETED, TASK_STATUS.FAILED, daysToKeep]
  );
  return result.affectedRows;
}

/**
 * 获取队列统计
 */
async function getQueueStats() {
  const [rows] = await db.query(
    `SELECT task_status, COUNT(*) as count 
     FROM async_tasks 
     GROUP BY task_status`
  );
  
  const stats = {
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
    total: 0
  };
  
  rows.forEach(row => {
    stats[row.task_status] = row.count;
    stats.total += row.count;
  });
  
  return stats;
}

/**
 * Worker运行器
 */
async function runWorker(workerId = 'default') {
  console.log(`[Worker ${workerId}] 启动`);
  
  while (true) {
    try {
      const task = await claimTask(workerId);
      
      if (!task) {
        await sleep(1000); // 无任务时休眠1秒
        continue;
      }
      
      console.log(`[Worker ${workerId}] 处理任务: ${task.taskId} (${task.taskType})`);
      
      const handler = TASK_HANDLERS[task.taskType];
      if (!handler) {
        console.error(`[Worker ${workerId}] 未找到处理器: ${task.taskType}`);
        await failTask(task.taskId, `Unknown task type: ${task.taskType}`);
        continue;
      }
      
      try {
        await updateProgress(task.taskId, 10);
        
        // 执行处理函数
        const result = await handler(task.inputData, {
          updateProgress: (p) => updateProgress(task.taskId, p),
          userId: task.userId
        });
        
        await updateProgress(task.taskId, 90);
        await completeTask(task.taskId, result);
        
        console.log(`[Worker ${workerId}] 任务完成: ${task.taskId}`);
      } catch (err) {
        console.error(`[Worker ${workerId}] 任务失败: ${task.taskId}`, err);
        await failTask(task.taskId, err.message);
      }
    } catch (err) {
      console.error(`[Worker ${workerId}] 异常:`, err);
      await sleep(5000); // 出错时休眠5秒
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  TASK_STATUS,
  TASK_TYPES,
  registerHandler,
  createTask,
  claimTask,
  updateProgress,
  completeTask,
  failTask,
  getTaskStatus,
  getUserTasks,
  cancelTask,
  cleanupOldTasks,
  getQueueStats,
  runWorker
};
