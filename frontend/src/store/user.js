/**
 * 用户状态管理 (Pinia)
 */

import { defineStore } from 'pinia'
import { getToken, setToken, clearToken, getUserInfo, setUserInfo, clearUserInfo } from '@/utils/auth'
import { logout as logoutApi } from '@/services/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken() || '',
    userInfo: getUserInfo() || null,
    isLogin: !!(getToken() && getUserInfo())
  }),
  
  getters: {
    // 用户ID
    userId: (state) => state.userInfo?.userId || '',
    
    // 用户昵称
    nickname: (state) => state.userInfo?.nickname || '未设置',
    
    // 用户等级
    level: (state) => state.userInfo?.level || 1,
    
    // 用户头像
    avatar: (state) => state.userInfo?.avatar || '',
    
    // 是否有头像
    hasAvatar: (state) => !!state.userInfo?.avatar
  },
  
  actions: {
    /**
     * 设置登录信息
     */
    setLogin(token, userInfo) {
      this.token = token
      this.userInfo = userInfo
      this.isLogin = true
      
      // 持久化
      setToken(token)
      setUserInfo(userInfo)
    },
    
    /**
     * 更新用户信息
     */
    updateUserInfo(userInfo) {
      this.userInfo = { ...this.userInfo, ...userInfo }
      setUserInfo(this.userInfo)
    },
    
    /**
     * 退出登录
     */
    async logout() {
      try {
        await logoutApi()
      } catch (e) {
        console.log('Logout API failed, continue local logout')
      }
      
      this.token = ''
      this.userInfo = null
      this.isLogin = false
      
      // 清除持久化
      clearToken()
      clearUserInfo()
    },
    
    /**
     * 检查登录状态
     */
    checkLogin() {
      const token = getToken()
      const userInfo = getUserInfo()
      this.isLogin = !!(token && userInfo)
      return this.isLogin
    }
  }
})