/**
 * Pinia Store 导出
 */

import { createPinia } from 'pinia'

// 创建Pinia实例
const pinia = createPinia()

// 导出store
export { useUserStore } from './user'
export { useFortuneStore } from './fortune'

// 默认导出
export default pinia