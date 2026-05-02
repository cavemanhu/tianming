/**
 * API服务导出
 */

export * from './user'
export * from './fortune'

import userApi from './user'
import fortuneApi from './fortune'

export default {
  user: userApi,
  fortune: fortuneApi
}