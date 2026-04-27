/**
 * 支付回调联调测试脚本
 * 模拟微信支付回调，验证分账逻辑
 */

const crypto = require('crypto');

// 模拟回调数据
const mockNotifyData = {
  id: 'wx2026042500000000000000000000',
  create_time: '2026-04-25T10:00:00+08:00',
  event_type: 'TRANSACTION.SUCCESS',
  resource_type: 'encrypt_certificate',
  summary: '支付成功',
  resource: {
    algorithm: 'AEAD_AES_256_GCM',
    ciphertext: '', // 实际加密内容
    nonce: 'random_nonce_16bytes',
    associated_data: 'transaction'
  }
};

/**
 * 模拟支付回调处理
 */
async function mockPayNotify(orderNo, gemsAmount, userId) {
  console.log(`\n=== 模拟支付回调 ===`);
  console.log(`订单号: ${orderNo}`);
  console.log(`用户ID: ${userId}`);
  console.log(`天命币: ${gemsAmount}`);
  
  // 模拟验证签名
  const signature = generateMockSignature(orderNo);
  console.log(`签名: ${signature}`);
  
  // 模拟分账处理
  console.log(`\n--- 分账计算 ---`);
  const commission = calculateCommission(gemsAmount);
  console.log(`分账明细:`, JSON.stringify(commission, null, 2));
  
  return {
    success: true,
    orderNo,
    gemsAmount,
    commission
  };
}

/**
 * 生成模拟签名
 */
function generateMockSignature(orderNo) {
  const message = `${orderNo}|${Date.now()}`;
  return crypto.createHash('sha256').update(message).digest('hex').substring(0, 32);
}

/**
 * 计算分账金额
 */
function calculateCommission(gemsAmount) {
  const rechargeRate = 0.10; // 10%
  const level1Rate = 0.6;
  const level2Rate = 0.3;
  const level3Rate = 0.1;
  
  const totalCommission = Math.floor(gemsAmount * rechargeRate);
  
  return {
    gemsAmount,
    rechargeRate: `${rechargeRate * 100}%`,
    totalCommission,
    breakdown: {
      level1: Math.floor(totalCommission * level1Rate),
      level2: Math.floor(totalCommission * level2Rate),
      level3: Math.floor(totalCommission * level3Rate)
    },
    maxCommissionPerTx: 100
  };
}

/**
 * 测试用例
 */
async function runTests() {
  console.log('========================================');
  console.log('   天命阁 - 支付回调联调测试');
  console.log('========================================');
  
  const testCases = [
    { orderNo: 'TM001', gemsAmount: 100, userId: 1 },
    { orderNo: 'TM002', gemsAmount: 320, userId: 2 },
    { orderNo: 'TM003', gemsAmount: 730, userId: 3 },
    { orderNo: 'TM004', gemsAmount: 1400, userId: 4 },
    { orderNo: 'TM005', gemsAmount: 100, userId: 5 }, // 最小分账
    { orderNo: 'TM006', gemsAmount: 10, userId: 6 },  // 低于阈值不分账
  ];
  
  for (const tc of testCases) {
    await mockPayNotify(tc.orderNo, tc.gemsAmount, tc.userId);
  }
  
  console.log('\n========================================');
  console.log('   测试完成');
  console.log('========================================');
}

runTests().catch(console.error);
