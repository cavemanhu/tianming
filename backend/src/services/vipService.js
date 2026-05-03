/**
 * VIP服务
 */

const db = require('../config/database');

/**
 * VIP套餐定义
 */
const VIP_PACKAGES = {
  1: { level: 1, name: '青铜会员', months: 1, price: 9.9, gems: 0, discount: 0 },
  2: { level: 2, name: '白银会员', months: 3, price: 25.9, gems: 50, discount: 0.1 },
  3: { level: 3, name: '黄金会员', months: 12, price: 89.9, gems: 200, discount: 0.2 }
};

/**
 * 获取用户VIP状态
 */
async function getVipStatus(userId) {
  const [rows] = await db.query(
    `SELECT v.*, u.nickname 
     FROM vip_memberships v 
     JOIN users u ON v.user_id = u.id 
     WHERE v.user_id = ?`,
    [userId]
  );
  
  if (!rows[0]) {
    return { is_vip: false, level: 0, expire_time: null };
  }
  
  const vip = rows[0];
  const now = new Date();
  const expireTime = new Date(vip.expire_time);
  const isVip = expireTime > now;
  
  return {
    is_vip: isVip,
    level: vip.vip_level,
    level_name: VIP_PACKAGES[vip.vip_level]?.name || '未知',
    expire_time: vip.expire_time,
    days_left: isVip ? Math.ceil((expireTime - now) / (1000 * 60 * 60 * 24)) : 0
  };
}

/**
 * 开通/续费VIP
 */
async function createVipOrder(userId, packageId) {
  const pkg = VIP_PACKAGES[packageId];
  if (!pkg) {
    throw new Error('无效的VIP套餐');
  }
  
  // 生成订单号
  const orderNo = 'VIP' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
  
  // 计算到期时间
  const now = new Date();
  let expireTime = new Date(now);
  expireTime.setMonth(expireTime.getMonth() + pkg.months);
  
  // 如果已有VIP，顺延
  const currentVip = await getVipStatus(userId);
  if (currentVip.is_vip && currentVip.expire_time) {
    expireTime = new Date(currentVip.expire_time);
    expireTime.setMonth(expireTime.getMonth() + pkg.months);
  }
  
  // 创建订单
  await db.query(
    `INSERT INTO orders (order_no, user_id, order_type, product_id, amount, gems_amount, pay_status)
     VALUES (?, ?, 'vip', ?, ?, ?, 'pending')`,
    [orderNo, userId, `vip_package_${packageId}`, pkg.price, pkg.gems]
  );
  
  return {
    order_no: orderNo,
    package_id: packageId,
    package_name: pkg.name,
    amount: pkg.price,
    gems_bonus: pkg.gems,
    expire_time: expireTime.toISOString()
  };
}

/**
 * VIP支付成功回调
 */
async function handleVipPayment(orderNo, notifyData) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    
    // 查询订单
    const [orders] = await conn.query(
      'SELECT * FROM orders WHERE order_no = ? AND pay_status = ?',
      [orderNo, 'pending']
    );
    
    if (!orders[0]) {
      throw new Error('订单不存在或已处理');
    }
    
    const order = orders[0];
    const userId = order.user_id;
    const productId = order.product_id;
    const packageId = parseInt(productId.replace('vip_package_', ''));
    const pkg = VIP_PACKAGES[packageId];
    
    // 计算新到期时间
    const now = new Date();
    let expireTime = new Date(now);
    expireTime.setMonth(expireTime.getMonth() + pkg.months);
    
    // 如果已有VIP，顺延
    const [existingVip] = await conn.query(
      'SELECT * FROM vip_memberships WHERE user_id = ?',
      [userId]
    );
    
    if (existingVip[0]) {
      const currentExpire = new Date(existingVip[0].expire_time);
      if (currentExpire > now) {
        expireTime = currentExpire;
        expireTime.setMonth(expireTime.getMonth() + pkg.months);
      }
      
      await conn.query(
        `UPDATE vip_memberships SET vip_level = ?, expire_time = ?, updated_at = NOW() WHERE user_id = ?`,
        [pkg.level, expireTime, userId]
      );
    } else {
      await conn.query(
        `INSERT INTO vip_memberships (user_id, vip_level, expire_time) VALUES (?, ?, ?)`,
        [userId, pkg.level, expireTime]
      );
    }
    
    // 如果有赠送天命币，添加到用户账户
    if (pkg.gems > 0) {
      await conn.query(
        'UPDATE users SET gems = gems + ? WHERE id = ?',
        [pkg.gems, userId]
      );
    }
    
    // 更新订单状态
    await conn.query(
      `UPDATE orders SET pay_status = 'paid', pay_time = NOW(), notify_data = ? WHERE order_no = ?`,
      [JSON.stringify(notifyData || {}), orderNo]
    );
    
    await conn.commit();
    
    return {
      success: true,
      expire_time: expireTime.toISOString(),
      vip_level: pkg.level,
      gems_granted: pkg.gems
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * 获取VIP套餐列表
 */
function getPackages() {
  return Object.entries(VIP_PACKAGES).map(([id, pkg]) => ({
    id: parseInt(id),
    level: pkg.level,
    name: pkg.name,
    months: pkg.months,
    price: pkg.price,
    gems_bonus: pkg.gems,
    discount: pkg.discount,
    original_price: pkg.level === 1 ? 9.9 : pkg.level === 2 ? 29.9 : 99.9
  }));
}

module.exports = {
  VIP_PACKAGES,
  getVipStatus,
  createVipOrder,
  handleVipPayment,
  getPackages
};
