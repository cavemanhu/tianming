/**
 * 师徒分账服务
 * 徒弟充值/消费时，师傅获得奖励
 */

const db = require('../config/database');
const { query } = require('../config/database');

// 分账配置
const COMMISSION_CONFIG = {
  // 徒弟充值时，师傅获得的比例 (%)
  rechargeRate: 10,
  
  // 徒弟消费算命时，师傅获得的比例 (%)
  fortuneConsumeRate: 5,
  
  // 单次最大分账金额
  maxCommissionPerTx: 100,
  
  // 最大师徒层级深度
  maxApprenticeLevel: 3,
  
  // 每级徒弟比例分配
  // Level 1: 60%, Level 2: 30%, Level 3: 10%
  levelDistribution: {
    1: 0.6,
    2: 0.3,
    3: 0.1
  }
};

/**
 * 处理充值分账
 * @param {number} userId 充值用户ID
 * @param {number} gemsAmount 充值的天命币数量
 */
async function processRechargeCommission(userId, gemsAmount) {
  const user = await getUserWithReferrer(userId);
  if (!user || !user.referrer_id) {
    return { success: false, reason: 'No referrer' };
  }

  const totalCommission = Math.floor(gemsAmount * COMMISSION_CONFIG.rechargeRate / 100);
  if (totalCommission <= 0) {
    return { success: false, reason: 'Amount too small' };
  }

  // 逐级向上分账
  await distributeCommission(user.referrer_id, totalCommission, userId, 'recharge');

  return {
    success: true,
    totalCommission,
    distributed: true
  };
}

/**
 * 处理消费分账（算命等业务）
 * @param {number} userId 消费用户ID
 * @param {number} gemsAmount 消费的天命币数量
 * @param {string} bizType 业务类型 fortune/yinyuan/naming
 */
async function processConsumeCommission(userId, gemsAmount, bizType = 'fortune') {
  const user = await getUserWithReferrer(userId);
  if (!user || !user.referrer_id) {
    return { success: false, reason: 'No referrer' };
  }

  const rate = bizType === 'recharge' 
    ? COMMISSION_CONFIG.rechargeRate 
    : COMMISSION_CONFIG.fortuneConsumeRate;
  
  const totalCommission = Math.floor(gemsAmount * rate / 100);
  if (totalCommission <= 0) {
    return { success: false, reason: 'Amount too small' };
  }

  // 逐级向上分账
  await distributeCommission(user.referrer_id, totalCommission, userId, bizType);

  return {
    success: true,
    totalCommission,
    distributed: true
  };
}

/**
 * 逐级向上分账
 */
async function distributeCommission(currentMasterId, amount, sourceUserId, bizType) {
  let remainingAmount = amount;
  let currentLevel = 1;
  let currentMaster = currentMasterId;

  while (remainingAmount > 0 && currentLevel <= COMMISSION_CONFIG.maxApprenticeLevel && currentMaster) {
    // 计算本级分账金额
    const levelRatio = COMMISSION_CONFIG.levelDistribution[currentLevel] || 0;
    const levelAmount = Math.floor(remainingAmount * levelRatio);
    
    if (levelAmount <= 0) break;

    // 更新师傅的天命币
    await addCommission(currentMaster, levelAmount, sourceUserId, currentLevel, bizType);

    // 获取当前师傅的师傅
    const master = await getUserWithReferrer(currentMaster);
    if (!master || !master.referrer_id) {
      break;
    }

    currentMaster = master.referrer_id;
    currentLevel++;
  }
}

/**
 * 添加分账记录
 */
async function addCommission(masterId, amount, sourceUserId, level, bizType) {
  // 限制单次最大金额
  const actualAmount = Math.min(amount, COMMISSION_CONFIG.maxCommissionPerTx);

  // 记录分账日志
  await query(
    `INSERT INTO commission_logs 
     (user_id, source_user_id, amount, level, biz_type, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [masterId, sourceUserId, actualAmount, level, bizType]
  );

  // 增加用户天命币
  await query(
    'UPDATE users SET gems = gems + ? WHERE id = ?',
    [actualAmount, masterId]
  );

  // 发送通知（可选）
  // await sendCommissionNotify(masterId, actualAmount, sourceUserId, bizType);

  return actualAmount;
}

/**
 * 获取用户及其师傅信息
 */
async function getUserWithReferrer(userId) {
  const [rows] = await db.query(
    'SELECT id, nickname, referrer_id FROM users WHERE id = ?',
    [userId]
  );
  return rows[0] || null;
}

/**
 * 获取用户的师徒链
 */
async function getApprenticeChain(userId) {
  const chain = [];
  let currentId = userId;

  for (let i = 0; i < COMMISSION_CONFIG.maxApprenticeLevel; i++) {
    const user = await getUserWithReferrer(currentId);
    if (!user || !user.referrer_id) break;
    
    const master = await getUserWithReferrer(user.referrer_id);
    if (master) {
      chain.push({
        level: i + 1,
        userId: master.id,
        nickname: master.nickname,
        gems: master.gems || 0
      });
      currentId = master.id;
    }
  }

  return chain;
}

/**
 * 获取用户的累计分账收益
 */
async function getTotalCommission(userId) {
  const [rows] = await db.query(
    `SELECT 
       SUM(CASE WHEN level = 1 THEN amount ELSE 0 END) as level1,
       SUM(CASE WHEN level = 2 THEN amount ELSE 0 END) as level2,
       SUM(CASE WHEN level = 3 THEN amount ELSE 0 END) as level3,
       SUM(amount) as total
     FROM commission_logs 
     WHERE user_id = ?`,
    [userId]
  );
  
  return {
    level1: rows[0].level1 || 0,
    level2: rows[0].level2 || 0,
    level3: rows[0].level3 || 0,
    total: rows[0].total || 0
  };
}

/**
 * 获取徒弟列表（带分账信息）
 */
async function getApprenticesWithCommission(masterId) {
  const [rows] = await db.query(
    `SELECT 
       u.id, u.nickname, u.avatar_url, u.created_at,
       COALESCE(SUM(cl.amount), 0) as total_commission,
       COUNT(DISTINCT CASE WHEN cl.biz_type = 'recharge' THEN cl.id END) as recharge_count
     FROM users u
     LEFT JOIN commission_logs cl ON u.id = cl.source_user_id AND cl.user_id = ?
     WHERE u.referrer_id = ?
     GROUP BY u.id
     ORDER BY u.created_at DESC`,
    [masterId, masterId]
  );
  
  return rows;
}

/**
 * 获取分账记录列表
 */
async function getCommissionLogs(userId, { page = 1, pageSize = 20 } = {}) {
  const offset = (page - 1) * pageSize;
  
  const [rows] = await db.query(
    `SELECT 
       cl.*, u.nickname as source_nickname
     FROM commission_logs cl
     LEFT JOIN users u ON cl.source_user_id = u.id
     WHERE cl.user_id = ?
     ORDER BY cl.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, Number(pageSize), offset]
  );
  
  const [[{ total }]] = await db.query(
    'SELECT COUNT(*) as total FROM commission_logs WHERE user_id = ?',
    [userId]
  );
  
  return {
    list: rows,
    pagination: { page: Number(page), pageSize: Number(pageSize), total }
  };
}

module.exports = {
  COMMISSION_CONFIG,
  processRechargeCommission,
  processConsumeCommission,
  getApprenticeChain,
  getTotalCommission,
  getApprenticesWithCommission,
  getCommissionLogs
};
