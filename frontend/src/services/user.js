/**
 * 用户相关API服务
 */

import { get, post } from '@/utils/request'

/**
 * 微信登录
 * @param {string} code 微信授权码
 * @param {string} invite_code 邀请码 (可选)
 */
export const wxLogin = (code, invite_code = '') => {
  return post('/api/user/login', { code, invite_code })
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
  wxLogin,
  getUserInfo,
  updateUserInfo,
  logout
}