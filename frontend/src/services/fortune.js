/**
 * 算命相关API服务
 */

import { get, post } from '@/utils/request'

/**
 * 发起算命预测
 * @param {string} type 算命类型: year | month | love | career
 * @param {Object} params 额外参数
 */
export const predict = (type, params = {}) => {
  return post('/api/fortune/predict', { type, ...params })
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
  return get('/api/fortune/history', { page, pageSize })
}

/**
 * 获取分享数据
 * @param {string} id 结果ID
 */
export const getShareData = (id) => {
  return get(`/api/fortune/share/${id}`)
}

/**
 * 删除算命记录
 * @param {string} id 记录ID
 */
export const deleteRecord = (id) => {
  return post('/api/fortune/delete', { id })
}

/**
 * 获取算命类型列表
 */
export const getTypes = () => {
  return get('/api/fortune/types')
}

export default {
  predict,
  getResult,
  getHistory,
  getShareData,
  deleteRecord,
  getTypes
}