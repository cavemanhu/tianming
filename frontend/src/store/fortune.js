/**
 * 算命状态管理 (Pinia)
 */

import { defineStore } from 'pinia'
import { predict, getResult, getHistory } from '@/services/fortune'
import { storage } from '@/utils/storage'

export const useFortuneStore = defineStore('fortune', {
  state: () => ({
    // 当前算命结果
    currentResult: null,
    
    // 算命历史列表
    historyList: [],
    
    // 历史分页
    historyPage: 1,
    historyHasMore: true,
    
    // 加载状态
    isLoading: false,
    isPredicting: false,
    
    // 算命类型选项
    types: [
      { value: 'year', label: '年运', icon: '📅', desc: '全年运势分析' },
      { value: 'month', label: '月运', icon: '🌙', desc: '本月运势预测' },
      { value: 'love', label: '爱情', icon: '💕', desc: '情感姻缘分析' },
      { value: 'career', label: '事业', icon: '💼', desc: '职场发展指导' }
    ]
  }),
  
  getters: {
    // 获取等级颜色
    getLevelColor: (state) => (level) => {
      const colors = ['', '#FFD700', '#90EE90', '#87CEEB', '#D3D3D3', '#B22222']
      return colors[level] || colors[3]
    },
    
    // 获取等级名称
    getLevelName: (state) => (level) => {
      const names = ['', '大吉', '吉', '中', '平', '凶']
      return names[level] || '中'
    },
    
    // 当前分数
    currentScore: (state) => state.currentResult?.score || 0,
    
    // 当前等级
    currentLevel: (state) => state.currentResult?.level || 3
  },
  
  actions: {
    /**
     * 发起算命预测
     */
    async doPredict(type, extraParams = {}) {
      if (this.isPredicting) return
      
      this.isPredicting = true
      this.isLoading = true
      
      try {
        const res = await predict(type, extraParams)
        
        if (res.code === 0) {
          this.currentResult = res.data
          // 缓存结果
          storage.setFortuneCache(res.data)
          return res.data
        } else {
          throw new Error(res.message || '预测失败')
        }
      } catch (e) {
        console.error('Predict error:', e)
        uni.showToast({ title: e.message || '预测失败', icon: 'none' })
        throw e
      } finally {
        this.isPredicting = false
        this.isLoading = false
      }
    },
    
    /**
     * 获取算命结果
     */
    async fetchResult(id) {
      this.isLoading = true
      
      try {
        const res = await getResult(id)
        
        if (res.code === 0) {
          this.currentResult = res.data
          return res.data
        } else {
          throw new Error(res.message || '获取结果失败')
        }
      } catch (e) {
        console.error('Fetch result error:', e)
        uni.showToast({ title: e.message || '获取结果失败', icon: 'none' })
        throw e
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * 加载历史记录
     */
    async loadHistory(page = 1, pageSize = 20) {
      this.isLoading = true
      
      try {
        const res = await getHistory(page, pageSize)
        
        if (res.code === 0) {
          if (page === 1) {
            this.historyList = res.data.list || []
          } else {
            this.historyList = [...this.historyList, ...(res.data.list || [])]
          }
          
          this.historyPage = page
          this.historyHasMore = res.data.hasMore || false
          
          return res.data
        } else {
          throw new Error(res.message || '获取历史失败')
        }
      } catch (e) {
        console.error('Load history error:', e)
        uni.showToast({ title: e.message || '获取历史失败', icon: 'none' })
        throw e
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * 加载更多历史
     */
    async loadMoreHistory() {
      if (!this.historyHasMore || this.isLoading) return
      return this.loadHistory(this.historyPage + 1)
    },
    
    /**
     * 清除当前结果
     */
    clearCurrentResult() {
      this.currentResult = null
    },
    
    /**
     * 清除历史
     */
    clearHistory() {
      this.historyList = []
      this.historyPage = 1
      this.historyHasMore = true
    }
  }
})