/**
 * VIP控制器
 */

const vipService = require('../services/vipService');
const { success, error, CODE } = require('../utils/response');

/**
 * 获取VIP套餐列表
 * GET /api/vip/packages
 */
function getPackages(req, res) {
  const packages = vipService.getPackages();
  res.json(success({ list: packages }));
}

/**
 * 获取当前用户VIP状态
 * GET /api/vip/status
 */
async function getStatus(req, res) {
  try {
    const status = await vipService.getVipStatus(req.userId);
    res.json(success(status));
  } catch (err) {
    console.error('获取VIP状态失败:', err);
    res.status(500).json(error(CODE.SERVER_ERROR, '获取VIP状态失败'));
  }
}

/**
 * 创建VIP订单
 * POST /api/vip/order
 */
async function createOrder(req, res) {
  try {
    const { package_id } = req.body;
    
    if (!package_id) {
      return res.status(400).json(error(CODE.BAD_REQUEST, '缺少套餐ID'));
    }
    
    const order = await vipService.createVipOrder(req.userId, package_id);
    res.json(success(order));
  } catch (err) {
    console.error('创建VIP订单失败:', err);
    res.status(500).json(error(CODE.SERVER_ERROR, err.message || '创建订单失败'));
  }
}

/**
 * VIP支付回调
 * POST /api/vip/notify
 */
async function notify(req, res) {
  try {
    // 微信支付回调验证
    const { order_no, transaction_id, ...notifyData } = req.body;
    
    if (!order_no) {
      return res.status(400).json(error(CODE.BAD_REQUEST, '缺少订单号'));
    }
    
    // 处理支付回调
    const result = await vipService.handleVipPayment(order_no, { transaction_id, ...notifyData });
    
    res.json(success(result));
  } catch (err) {
    console.error('VIP支付回调处理失败:', err);
    res.status(500).json(error(CODE.SERVER_ERROR, '处理失败'));
  }
}

module.exports = {
  getPackages,
  getStatus,
  createOrder,
  notify
};
