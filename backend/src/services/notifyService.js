/**
 * 微信订阅消息通知服务
 * 使用微信统一服务消息/订阅消息接口
 */

const axios = require('axios');
const UserModel = require('../models/User');

const WECHAT_APPID = process.env.WECHAT_APPID;
const WECHAT_SECRET = process.env.WECHAT_SECRET;

// 微信 access_token 缓存
let accessTokenCache = { token: null, expiresAt: 0 };

/**
 * 获取微信 access_token（带缓存）
 */
async function getAccessToken() {
  const now = Date.now();
  if (accessTokenCache.token && accessTokenCache.expiresAt > now + 60000) {
    return accessTokenCache.token;
  }

  const url = 'https://api.weixin.qq.com/cgi-bin/token';
  const params = {
    appid: WECHAT_APPID,
    secret: WECHAT_SECRET,
    grant_type: 'client_credential'
  };

  const response = await axios.get(url, { params });
  const data = response.data;

  if (data.errcode) {
    throw new Error(`获取access_token失败: ${data.errmsg}`);
  }

  accessTokenCache = {
    token: data.access_token,
    expiresAt: now + (data.expires_in - 120) * 1000
  };

  return accessTokenCache.token;
}

/**
 * 发送订阅消息
 * @param {string} openid 用户openid
 * @param {string} templateId 模板消息ID
 * @param {object} data 模板数据 { key1: { value: 'xxx', color: '#xxx' } }
 * @param {string} page 跳转页面路径
 */
async function sendSubscribeMessage(openid, templateId, data, page = '') {
  const accessToken = await getAccessToken();
  const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`;

  const payload = {
    touser: openid,
    template_id: templateId,
    data,
    page
  };

  const response = await axios.post(url, payload);
  const result = response.data;

  if (result.errcode && result.errcode !== 0) {
    console.error(`订阅消息发送失败: ${result.errmsg}`);
    return { success: false, error: result.errmsg };
  }

  return { success: true };
}

/**
 * 发送任务完成通知
 * 模板ID: 算命结果通知模板 (需要在微信后台配置)
 * @param {number} userId 用户ID
 * @param {string} taskId 任务ID
 * @param {string} fateType 测算类型 (年运/姻缘/取名)
 */
async function sendTaskCompleteNotify(userId, taskId, fateType) {
  try {
    const user = await UserModel.findById(userId);
    if (!user || !user.openid) {
      return { success: false, reason: '用户不存在或无openid' };
    }

    // 模板数据 - 算命结果通知
    // 注意: 实际template_id需要在微信公众平台配置
    const templateId = process.env.WX_TEMPLATE_FORTUNE_RESULT || 'FORTUNE_RESULT_TEMPLATE_ID';
    const templateData = {
      phrase1: { value: '测算完成', color: '#07c160' },  // 任务状态
      phrase2: { value: fateType, color: '#576b95' },    // 测算类型
      time3: { value: new Date().toLocaleString('zh-CN'), color: '#999999' }, // 完成时间
      content4: { value: `您的${fateType}分析报告已生成，点击查看详情`, color: '#333333' } // 备注
    };

    const result = await sendSubscribeMessage(
      user.openid,
      templateId,
      templateData,
      `/pages/fortune/index?id=${taskId}`
    );

    return result;
  } catch (err) {
    console.error('发送任务完成通知失败:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 发送佣金到账通知
 * @param {number} userId 用户ID
 * @param {number} amount 天命币数量
 * @param {string} sourceNickname 徒弟昵称
 */
async function sendCommissionEarnedNotify(userId, amount, sourceNickname) {
  try {
    const user = await UserModel.findById(userId);
    if (!user || !user.openid) {
      return { success: false, reason: '用户不存在或无openid' };
    }

    const templateId = process.env.WX_TEMPLATE_COMMISSION || 'COMMISSION_TEMPLATE_ID';
    const templateData = {
      name1: { value: '师徒奖励', color: '#FFD700' },
      amount2: { value: `+${amount}天命币`, color: '#07c160' },
      desc3: { value: `徒弟【${sourceNickname}】完成任务，您获得奖励`, color: '#999999' }
    };

    return await sendSubscribeMessage(user.openid, templateId, templateData, '/pages/profile/index');
  } catch (err) {
    console.error('发送佣金通知失败:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 发送VIP到期提醒
 * @param {number} userId 用户ID
 * @param {number} daysLeft 剩余天数
 */
async function sendVipExpireRemind(userId, daysLeft) {
  try {
    const user = await UserModel.findById(userId);
    if (!user || !user.openid) {
      return { success: false, reason: '用户不存在或无openid' };
    }

    const templateId = process.env.WX_TEMPLATE_VIP_EXPIRE || 'VIP_EXPIRE_TEMPLATE_ID';
    const templateData = {
      date3: { value: `${daysLeft}天`, color: daysLeft <= 3 ? '#ff0000' : '#FFA500' },
      thing5: { value: 'VIP会员', color: '#576b95' },
      thing4: { value: `您的VIP会员即将到期，续费可继续享受无限算命特权`, color: '#333333' }
    };

    return await sendSubscribeMessage(user.openid, templateId, templateData, '/pages/vip/index');
  } catch (err) {
    console.error('发送VIP到期提醒失败:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 发送验证码短信 (需要短信服务商，此处预留接口)
 */
async function sendSmsCode(phone, code) {
  // TODO: 接入短信服务商（如阿里云、腾讯云）
  console.log(`[SMS] 发送验证码到 ${phone}: ${code}`);
  return { success: true, mock: true };
}

module.exports = {
  sendTaskCompleteNotify,
  sendCommissionEarnedNotify,
  sendVipExpireRemind,
  sendSmsCode,
  getAccessToken
};
