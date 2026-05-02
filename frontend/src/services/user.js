/**
 * 用户相关API服务
 */

import { get, post } from '@/utils/request'

/**
 * 发送验证码
 * @param {string} phone 手机号
 */
export const sendCode = (phone) => {
  return post('/api/user/send-code', { phone })
}

/**
 * 手机号登录
 * @param {string} phone 手机号
 * @param {string} code 验证码
 */
export const phoneLogin = (phone, code) => {
  return post('/api/user/phone-login', { phone, code })
}

/**
 * 微信登录
 * @param {string} code 微信授权码
 * @param {string} iv 加密偏移量
 * @param {string} encryptedData 加密数据
 */
export const wxLogin = (code, iv, encryptedData) => {
  return post('/api/user/wx-login', { code, iv, encryptedData })
}

/**
 * 获取用户信息
 */
export const getUserInfo = () => {
  return get('/api/user/info')
}

/**
 * 更新用户信息
 * @param {Object} data 更新数据 { nickname, avatar, ... }
 */
export const updateUserInfo = (data) => {
  return post('/api/user/update', data)
}

/**
 * 退出登录
 */
export const logout = () => {
  return post('/api/user/logout')
}

export default {
  sendCode,
  phoneLogin,
  wxLogin,
  getUserInfo,
  updateUserInfo,
  logout
}