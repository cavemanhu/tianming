/**
 * 订单控制器
 */

const { success, error, CODE } = require('../utils/response');
const { generateOrderNo } = require('../utils/codeGen');

/**
 * 充值
 */
async function recharge(req, res) {
  try {
    const { amount, pay_method, product_id } = req.body;
    
    if (!amount || !pay_method) {
      return res.status(400).json(error(CODE.BAD_REQUEST, '参数不完整'));
    }

    const orderNo = generateOrderNo();
    // 创建订单记录
    // const order = await OrderModel.create({ order_no: orderNo, user_id: req.userId, ... });

    // TODO: 调用支付接口获取支付二维码/链接
    const payUrl = `https://api.example.com/pay?order=${orderNo}`;

    res.json(success({ order_no: orderNo, pay_url: payUrl }));
  } catch (err) {
    res.status(500).json(error(CODE.SERVER_ERROR, '创建订单失败'));
  }
}

/**
 * 获取订单列表
 */
async function getList(req, res) {
  try {
    const { page = 1, pageSize = 20, order_type, pay_status } = req.query;
    // const orders = await OrderModel.findByUser(req.userId, { page, pageSize, order_type, pay_status });
    res.json(success({
      list: [],
      pagination: { page: Number(page), pageSize: Number(pageSize), total: 0 }
    }));
  } catch (err) {
    res.status(500).json(error(CODE.SERVER_ERROR, '获取订单失败'));
  }
}

module.exports = { recharge, getList };
