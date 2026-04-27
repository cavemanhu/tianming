/**
 * 认证工具
 * 处理Token和用户信息
 */

import { getStorageSync, setStorageSync, removeStorageSync } from './storage'

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'

/**
 * 获取Token
 */
export const getToken = () => {
  return getStorageSync(TOKEN_KEY) || ''
}

/**
 * 设置Token
 */
export const setToken = (token) => {
  setStorageSync(TOKEN_KEY, token)
}

/**
 * 清除Token
 */
export const clearToken = () => {
  removeStorageSync(TOKEN_KEY)
}

/**
 * 获取用户信息
 */
export const getUserInfo = () => {
  return getStorageSync(USER_INFO_KEY) || null
}

/**
 * 设置用户信息
 */
export const setUserInfo = (userInfo) => {
  setStorageSync(USER_INFO_KEY, userInfo)
}

/**
 * 清除用户信息
 */
export const clearUserInfo = () => {
  removeStorageSync(USER_INFO_KEY)
}

/**
 * 检查是否已登录
 */
export const isLogin = () => {
  const token = getToken()
  const userInfo = getUserInfo()
  return !!(token && userInfo)
}

/**
 * 获取登录后的重定向页面
 */
export const getLoginRedirect = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    const currentPage = pages[pages.length - 1]
    return `/${currentPage.route}`
  }
  return '/pages/index/index'
}

/**
 * 跳转到登录页
 */
export const goToLogin = (redirect) => {
  const url = redirect 
    ? `/pages/login/index?redirect=${encodeURIComponent(redirect)}` 
    : '/pages/login/index'
  uni.reLaunch({ url })
}

/**
 * 检查登录状态，未登录则跳转
 */
export const requireLogin = (callback) => {
  if (isLogin()) {
    callback && callback()
  } else {
    goToLogin(getLoginRedirect())
  }
}

export default {
  getToken,
  setToken,
  clearToken,
  getUserInfo,
  setUserInfo,
  clearUserInfo,
  isLogin,
  getLoginRedirect,
  goToLogin,
  requireLogin
}