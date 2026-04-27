/**
 * 算命相关API服务
 */

import { get, post } from '@/utils/request'

/**
 * 发起算命预测
 * @param {string} fate_type 算命类型: year | month | love | career
 * @param {Object} params 额外参数
 */
export const predict = (fate_type, params = {}) => {
  return post('/api/fortune/create', { fate_type, ...params })
}

/**
 * 获取算命结果
 * @param {string} id 结果ID
 */
export const getResult = (id) => {
  return get(`/api/fortune/result/${id}`)
}

/**
 * 获取算命历史记录
 * @param {number} page 页码
 * @param {number} pageSize 每页数量
 */
export const getHistory = (page = 1, pageSize = 20) => {
  return get('/api/fortune/records', { page, pageSize })
}

export default {
  predict,
  getResult,
  getHistory
}