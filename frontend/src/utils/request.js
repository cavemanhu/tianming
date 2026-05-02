/**
 * HTTP请求封装
 * 基于UniApp请求API
 */

import { getToken, clearToken } from './auth'

// API基础地址 (本地后端) - 支持环境变量切换
const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) 
  ? import.meta.env.VITE_API_BASE_URL 
  : 'http://localhost:3000'

// 请求超时时间 (ms)
const TIMEOUT = 30000

// 状态码白名单 (不弹出错误提示)
const SUCCESS_CODES = [0, 200, 201]

/**
 * 请求拦截器
 */
const requestInterceptor = (options) => {
  // 添加loading提示
  if (options.showLoading !== false) {
    uni.showLoading({ title: options.loadingText || '加载中...', mask: true })
  }
  
  // 添加认证token
  const token = getToken()
  if (token) {
    options.header = {
      ...options.header,
      'Authorization': `Bearer ${token}`
    }
  }
  
  // 添加时间戳防止缓存
  if (options.method === 'GET') {
    options.url = options.url + (options.url.includes('?') ? '&' : '?') + `_t=${Date.now()}`
  }
  
  return options
}

/**
 * 响应拦截器
 */
const responseInterceptor = (response, options) => {
  // 关闭loading
  if (options.showLoading !== false) {
    uni.hideLoading()
  }
  
  const statusCode = response.statusCode
  const data = response.data
  
  // HTTP状态码检查
  if (statusCode >= 200 && statusCode < 300) {
    // 业务错误码检查
    if (data.code !== undefined && !SUCCESS_CODES.includes(data.code)) {
      // 业务错误处理
      handleBusinessError(data)
      return Promise.reject(data)
    }
    return Promise.resolve(data)
  }
  
  // HTTP错误处理
  handleHttpError(statusCode, data)
  return Promise.reject({ statusCode, ...data })
}

/**
 * 业务错误处理
 */
const handleBusinessError = (data) => {
  const messageMap = {
    401: '登录已过期，请重新登录',
    403: '无权限访问',
    404: '请求的资源不存在',
    500: '服务器错误，请稍后再试',
    1001: '验证码错误',
    1002: '验证码已过期',
    1003: '手机号格式不正确',
    1004: '用户不存在',
    1005: '密码错误'
  }
  
  const message = messageMap[data.code] || data.message || '请求失败'
  uni.showToast({ title: message, icon: 'none', duration: 2000 })
  
  // token过期，跳转登录
  if (data.code === 401) {
    setTimeout(() => {
      clearToken()
      uni.reLaunch({ url: '/pages/login/index' })
    }, 1500)
  }
}

/**
 * HTTP错误处理
 */
const handleHttpError = (statusCode, data) => {
  const messageMap = {
    400: '请求参数错误',
    401: '登录已过期，请重新登录',
    403: '无权限访问',
    404: '请求的资源不存在',
    500: '服务器错误，请稍后再试',
    502: '网关错误',
    503: '服务暂时不可用',
    504: '网关超时'
  }
  
  const message = messageMap[statusCode] || '网络请求失败'
  uni.showToast({ title: message, icon: 'none', duration: 2000 })
}

/**
 * 发起请求
 * @param {Object} options 请求配置
 * @returns {Promise}
 */
export const request = (options) => {
  return new Promise((resolve, reject) => {
    // 执行请求拦截
    options = requestInterceptor(options)
    
    const requestOptions = {
      url: options.url.startsWith('http') ? options.url : BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: options.header || {},
      timeout: options.timeout || TIMEOUT,
      success: (res) => {
        resolve(responseInterceptor(res, options))
      },
      fail: (err) => {
        uni.hideLoading()
        uni.showToast({ title: '网络连接失败', icon: 'none' })
        reject(err)
      }
    }
    
    uni.request(requestOptions)
  })
}

/**
 * GET请求
 */
export const get = (url, data, options = {}) => {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  })
}

/**
 * POST请求
 */
export const post = (url, data, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT请求
 */
export const put = (url, data, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE请求
 */
export const del = (url, data, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

/**
 * 上传文件
 */
export const upload = (filePath, formData = {}, options = {}) => {
  return new Promise((resolve, reject) => {
    uni.showLoading({ title: '上传中...', mask: true })
    
    const token = getToken()
    const header = token ? { 'Authorization': `Bearer ${token}` } : {}
    
    uni.uploadFile({
      url: options.url || BASE_URL + '/api/upload',
      filePath,
      name: options.name || 'file',
      formData,
      header,
      success: (res) => {
        uni.hideLoading()
        const data = JSON.parse(res.data)
        if (data.code === 0) {
          resolve(data)
        } else {
          uni.showToast({ title: data.message || '上传失败', icon: 'none' })
          reject(data)
        }
      },
      fail: (err) => {
        uni.hideLoading()
        uni.showToast({ title: '上传失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

export default {
  request,
  get,
  post,
  put,
  del,
  upload
}