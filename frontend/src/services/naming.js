/**
 * 取名相关API服务
 */

import { post, get } from '@/utils/request'

/**
 * 创建取名任务
 * @param {Object} params 取名参数
 */
export const createNaming = (params = {}) => {
  return post('/api/fatename/create', params)
}

/**
 * 获取取名结果
 * @param {string} taskId 任务ID
 */
export const getNamingResult = (taskId) => {
  return get(`/api/fatename/result/${taskId}`)
}

/**
 * 获取取名历史记录
 * @param {number} page 页码
 * @param {number} pageSize 每页数量
 */
export const getNamingRecords = (page = 1, pageSize = 20) => {
  return get('/api/fatename/records', { page, pageSize })
}

export default {
  createNaming,
  getNamingResult,
  getNamingRecords
}
