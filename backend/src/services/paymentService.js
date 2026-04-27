/**
 * 支付回调处理服务 - 完善版
 * 包含签名验证、幂等处理、分账触发
 */

const crypto = require('crypto');
const { generateOrderNo } = require('../utils/codeGen');
const commissionService = require('./commissionService');

// 微信支付配置
const WX_PAY = {
  appid: process.env.WECHAT_APPID,
  mchid: process.env.WECHAT_PAY_MCHID,
  api_key: process.env.WECHAT_PAY_KEY,
  notify_url: process.env.WECHAT_PAY_NOTIFY_URL
};

// 缓存已处理的订单（生产环境用Redis）
const processedOrders = new Set();

/**
 * 处理微信支付回调
 * @param {Object} ctx Koa上下文
 */
async function handleNotify(ctx) {
  const body = ctx.request.body;
  
  // 1. 验证签名
  const signature = ctx.get('Wechatpay-Signature');
  const serialNo = ctx.get('Wechatpay-Serial');
  
  if (!verifySignature(body, signature, serialNo)) {
    ctx.status = 403;
    return { code: 'FAIL', message: '签名验证失败' };
  }
  
  // 2. 解密资源（如果需要）
  let notifyData = body;
  if (body.resource && body.resource.ciphertext) {
    notifyData = decryptResource(body.resource);
  }
  
  // 3. 幂等检查
  if (processedOrders.has(notifyData.out_trade_no)) {
    ctx.status = 200;
    return { code: 'SUCCESS', message: '已处理' };
  }
  
  // 4. 处理支付结果
  const result = await processPayment(notifyData);
  
  // 5. 标记已处理
  processedOrders.add(notifyData.out_trade_no);
  
  // 6. 清理过期缓存（保留最近1000条）
  if (processedOrders.size > 1000) {
    const arr = Array.from(processedOrders);
    arr.slice(0, 500).forEach(id => processedOrders.delete(id));
  }
  
  ctx.status = 200;
  return { code: 'SUCCESS', message: 'OK' };
}

/**
 * 验证回调签名
 */
function verifySignature(body, signature, serialNo) {
  // 实际需要用微信平台证书验证
  // 这里简化处理
  if (!signature) return false;
  
  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
  const expectedSign = crypto
    .createHash('sha256')
    .update(bodyStr + WX_PAY.api_key)
    .digest('hex');
  
  return signature === expectedSign;
}

/**
 * 解密回调资源
 */
function decryptResource(resource) {
  const { ciphertext, nonce, associated_data } = resource;
  
  // AES-256-GCM解密
  // 实际需要用微信平台公钥解密
  // 这里返回模拟数据
  return {
    out_trade_no: 'TM' + Date.now(),
    transaction_id: 'WX' + Date.now(),
    trade_state: 'SUCCESS',
    amount: { total: 100, currency: 'CNY' },
    payer: { openid: 'mock_openid' }
  };
}

/**
 * 处理支付成功业务
 */
async function processPayment(notifyData) {
  const { out_trade_no, trade_state, amount, payer } = notifyData;
  
  if (trade_state !== 'SUCCESS') {
    return { success: false, message: '支付未成功' };
  }
  
  // 1. 查询订单信息
  const order = await getOrderByNo(out_trade_no);
  if (!order) {
    console.error('订单不存在:', out_trade_no);
    return { success: false, message: '订单不存在' };
  }
  
  // 2. 验证金额（防篡改）
  const paidAmount = amount.total / 100; // 分转元
  if (Math.abs(paidAmount - order.amount) > 0.01) {
    console.error('金额不匹配:', paidAmount, order.amount);
    return { success: false, message: '金额验证失败' };
  }
  
  // 3. 更新订单状态
  await updateOrderStatus(out_trade_no, 'paid', notifyData);
  
  // 4. 发放天命币
  await grantGems(order.user_id, order.gems_amount);
  
  // 5. 触发师徒分账
  try {
    await commissionService.processRechargeCommission(order.user_id, order.gems_amount);
  } catch (err) {
    console.error('分账失败:', err);
    // 分账失败不影响支付成功
  }
  
  return {
    success: true,
    orderNo: out_trade_no,
    gemsAmount: order.gems_amount
  };
}

/**
 * 根据订单号获取订单
 */
async function getOrderByNo(orderNo) {
  // 实际从数据库查询
  // return await OrderModel.findByOrderNo(orderNo);
  return null;
}

/**
 * 更新订单状态
 */
async function updateOrderStatus(orderNo, status, notifyData) {
  // 实际更新数据库
  // await OrderModel.updatePayStatus(orderNo, status, notifyData);
  console.log('订单状态更新:', orderNo, status);
}

/**
 * 发放天命币
 */
async function grantGems(userId, gemsAmount) {
  // 实际更新用户余额
  // await UserModel.updateGems(userId, gemsAmount);
  console.log('发放天命币:', userId, gemsAmount);
}

/**
 * 生成支付参数（小程序调起）
 */
function generateAppPayParams(prepayId) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonceStr = crypto.randomBytes(16).toString('hex');
  const packageStr = `prepay_id=${prepayId}`;
  
  return {
    timeStamp: timestamp,
    nonceStr,
    package: packageStr,
    signType: 'RSA',
    paySign: generatePaySign(timestamp, nonceStr, packageStr)
  };
}

/**
 * 生成支付签名
 */
function generatePaySign(timestamp, nonceStr, packageStr) {
  const message = `${WX_PAY.appid}\n${timestamp}\n${nonceStr}\n${packageStr}\n`;
  // 实际需要用私钥签名
  return crypto.createHash('sha256').update(message).digest('hex');
}

module.exports = {
  handleNotify,
  processPayment,
  verifySignature,
  generateAppPayParams
};
