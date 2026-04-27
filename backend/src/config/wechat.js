/**
 * 微信服务 - 微信登录相关
 */

const axios = require('axios');

const WECHAT_APPID = process.env.WECHAT_APPID;
const WECHAT_SECRET = process.env.WECHAT_SECRET;

/**
 * 小程序端：通过code获取openid
 * @param {string} code 小程序wx.login()返回的code
 * @returns {Promise<{openid: string, session_key: string}>}
 */
async function getOpenidByCode(code) {
  const url = 'https://api.weixin.qq.com/sns/jscode2session';
  const params = {
    appid: WECHAT_APPID,
    secret: WECHAT_SECRET,
    js_code: code,
    grant_type: 'authorization_code'
  };

  const response = await axios.get(url, { params });
  const data = response.data;

  if (data.errcode) {
    throw new Error(`微信登录失败: ${data.errmsg}`);
  }

  return {
    openid: data.openid,
    session_key: data.session_key
  };
}

/**
 * 获取用户手机号
 * @param {string} code 手机号获取的code（动态令牌）
 * @param {string} access_token 
 */
async function getPhoneNumber(code, access_token) {
  const url = 'https://api.weixin.qq.com/wxa/business/getuserphonenumber';
  const response = await axios.post(url, { code }, {
    headers: { 'Content-Type': 'application/json' },
    params: { access_token }
  });
  return response.data;
}

module.exports = {
  getOpenidByCode,
  getPhoneNumber
};
