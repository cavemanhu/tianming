/**
 * 本地存储工具
 * 统一封装UniApp Storage API
 */

/**
 * 同步存储
 */
export const setStorageSync = (key, value) => {
  try {
    uni.setStorageSync(key, value)
    return true
  } catch (e) {
    console.error('setStorageSync error:', e)
    return false
  }
}

/**
 * 同步读取
 */
export const getStorageSync = (key, defaultValue = null) => {
  try {
    const value = uni.getStorageSync(key)
    return value !== '' ? value : defaultValue
  } catch (e) {
    console.error('getStorageSync error:', e)
    return defaultValue
  }
}

/**
 * 同步删除
 */
export const removeStorageSync = (key) => {
  try {
    uni.removeStorageSync(key)
    return true
  } catch (e) {
    console.error('removeStorageSync error:', e)
    return false
  }
}

/**
 * 清理所有存储
 */
export const clearStorageSync = () => {
  try {
    uni.clearStorageSync()
    return true
  } catch (e) {
    console.error('clearStorageSync error:', e)
    return false
  }
}

/**
 * 获取存储信息
 */
export const getStorageInfoSync = () => {
  try {
    return uni.getStorageInfoSync()
  } catch (e) {
    console.error('getStorageInfoSync error:', e)
    return { currentSize: 0, limitSize: 0 }
  }
}

/**
 * 异步存储
 */
export const setStorage = (key, value) => {
  return new Promise((resolve, reject) => {
    uni.setStorage({
      key,
      data: value,
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 异步读取
 */
export const getStorage = (key) => {
  return new Promise((resolve, reject) => {
    uni.getStorage({
      key,
      success: (res) => resolve(res.data),
      fail: reject
    })
  })
}

/**
 * 异步删除
 */
export const removeStorage = (key) => {
  return new Promise((resolve, reject) => {
    uni.removeStorage({
      key,
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 清理所有存储
 */
export const clearStorage = () => {
  return new Promise((resolve, reject) => {
    uni.clearStorage({
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 获取存储信息
 */
export const getStorageInfo = () => {
  return new Promise((resolve, reject) => {
    uni.getStorageInfo({
      success: resolve,
      fail: reject
    })
  })
}

// ========== 业务存储封装 ==========

const USER_TOKEN_KEY = 'user_token'
const USER_INFO_KEY = 'user_info'
const FORTUNE_CACHE_KEY = 'fortune_cache'
const SEARCH_HISTORY_KEY = 'search_history'

export const storage = {
  // Token操作
  setToken: (token) => setStorageSync(USER_TOKEN_KEY, token),
  getToken: () => getStorageSync(USER_TOKEN_KEY),
  removeToken: () => removeStorageSync(USER_TOKEN_KEY),
  
  // 用户信息操作
  setUserInfo: (info) => setStorageSync(USER_INFO_KEY, info),
  getUserInfo: () => getStorageSync(USER_INFO_KEY),
  removeUserInfo: () => removeStorageSync(USER_INFO_KEY),
  
  // 算命缓存
  setFortuneCache: (data) => setStorageSync(FORTUNE_CACHE_KEY, data),
  getFortuneCache: () => getStorageSync(FORTUNE_CACHE_KEY),
  removeFortuneCache: () => removeStorageSync(FORTUNE_CACHE_KEY),
  
  // 搜索历史
  addSearchHistory: (keyword) => {
    const history = getStorageSync(SEARCH_HISTORY_KEY) || []
    const filtered = history.filter(h => h !== keyword)
    filtered.unshift(keyword)
    setStorageSync(SEARCH_HISTORY_KEY, filtered.slice(0, 20))
  },
  getSearchHistory: () => getStorageSync(SEARCH_HISTORY_KEY) || [],
  clearSearchHistory: () => removeStorageSync(SEARCH_HISTORY_KEY)
}

export default {
  setStorageSync,
  getStorageSync,
  removeStorageSync,
  clearStorageSync,
  getStorageInfoSync,
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  getStorageInfo,
  storage
}