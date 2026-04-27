<template>
  <view class="history-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <text class="nav-title">历史记录</text>
    </view>

    <!-- Tab切换 -->
    <view class="tab-bar">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @tap="switchTab(tab.value)"
      >
        <text class="tab-text">{{ tab.label }}</text>
      </view>
    </view>

    <!-- 历史列表 -->
    <view class="history-list" v-if="historyList.length > 0">
      <view 
        v-for="(item, index) in historyList" 
        :key="item.id"
        class="history-item"
        @tap="viewDetail(item)"
      >
        <view class="item-header">
          <text class="item-type">{{ getTypeName(item.type) }}</text>
          <LevelBadge :level="item.level" />
        </view>
        <view class="item-body">
          <view class="item-score">
            <text class="score-value">{{ item.score }}</text>
            <text class="score-unit">分</text>
          </view>
          <view class="item-info">
            <text class="item-title">{{ item.title }}</text>
            <text class="item-date">{{ formatDate(item.createdAt) }}</text>
          </view>
        </view>
        <view class="item-arrow">→</view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="!isLoading">
      <text class="empty-icon">📜</text>
      <text class="empty-text">暂无历史记录</text>
      <button class="btn-predict" @tap="goToPredict">开始测算</button>
    </view>

    <!-- Loading -->
    <view class="loading-wrapper" v-if="isLoading">
      <LoadingSpinner text="加载中..." />
    </view>

    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore && !isLoading" @tap="loadMore">
      <text>加载更多</text>
    </view>
  </view>
</template>

<script>
import { useFortuneStore } from '@/store/fortune'
import LevelBadge from '@/components/LevelBadge/LevelBadge.vue'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.vue'

export default {
  components: {
    LevelBadge,
    LoadingSpinner
  },
  
  data() {
    return {
      tabs: [
        { label: '全部', value: 'all' },
        { label: '年运', value: 'year' },
        { label: '月运', value: 'month' },
        { label: '爱情', value: 'love' },
        { label: '事业', value: 'career' }
      ],
      currentTab: 'all',
      historyList: [],
      isLoading: false,
      hasMore: false,
      page: 1
    }
  },
  
  computed: {
    fortuneStore() {
      return useFortuneStore()
    }
  },
  
  onLoad() {
    this.loadHistory()
  },
  
  onPullDownRefresh() {
    this.refreshHistory().finally(() => {
      uni.stopPullDownRefresh()
    })
  },
  
  onReachBottom() {
    this.loadMore()
  },
  
  methods: {
    async loadHistory() {
      if (this.isLoading) return
      
      this.isLoading = true
      
      try {
        const res = await this.fortuneStore.loadHistory(this.page)
        
        let list = res.data?.list || []
        
        // Tab过滤
        if (this.currentTab !== 'all') {
          list = list.filter(item => item.type === this.currentTab)
        }
        
        if (this.page === 1) {
          this.historyList = list
        } else {
          this.historyList = [...this.historyList, ...list]
        }
        
        this.hasMore = res.data?.hasMore || false
      } catch (e) {
        console.error('Load history failed:', e)
      } finally {
        this.isLoading = false
      }
    },
    
    async refreshHistory() {
      this.page = 1
      this.historyList = []
      await this.loadHistory()
    },
    
    loadMore() {
      if (!this.hasMore || this.isLoading) return
      this.page++
      this.loadHistory()
    },
    
    switchTab(tab) {
      this.currentTab = tab
      this.page = 1
      this.historyList = []
      this.loadHistory()
    },
    
    getTypeName(type) {
      const map = {
        year: '年运',
        month: '月运',
        love: '爱情',
        career: '事业'
      }
      return map[type] || type
    },
    
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${month}月${day}日`
    },
    
    viewDetail(item) {
      uni.navigateTo({
        url: `/pages/fortune/index?id=${item.id}`
      })
    },
    
    goToPredict() {
      uni.switchTab({ url: '/pages/index/index' })
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.history-page {
  min-height: 100vh;
  background: $color-bg-primary;
  padding-bottom: 120rpx;
}

.nav-bar {
  padding: 80rpx $page-padding-h 32rpx;
  
  .nav-title {
    font-size: $font-size-xl;
    color: $color-text-primary;
    font-weight: $font-weight-semibold;
  }
}

.tab-bar {
  display: flex;
  padding: 0 $page-padding-h;
  gap: 24rpx;
  margin-bottom: 24rpx;
  
  .tab-item {
    padding: 12rpx 0;
    position: relative;
    
    .tab-text {
      font-size: $font-size-base;
      color: $color-text-tertiary;
    }
    
    &.active {
      .tab-text {
        color: $color-accent;
        font-weight: $font-weight-medium;
      }
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 4rpx;
        background: $color-accent;
        border-radius: 2rpx;
      }
    }
  }
}

.history-list {
  padding: 0 $page-padding-h;
  
  .history-item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    background: $color-bg-card;
    border-radius: $border-radius-base;
    margin-bottom: 16rpx;
    border: 1rpx solid $color-border;
    
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;
      
      .item-type {
        font-size: $font-size-sm;
        color: $color-text-secondary;
      }
    }
    
    .item-body {
      display: flex;
      align-items: center;
      flex: 1;
      
      .item-score {
        display: flex;
        align-items: baseline;
        margin-right: 24rpx;
        
        .score-value {
          font-size: $font-size-xxl;
          color: $color-accent;
          font-weight: $font-weight-bold;
        }
        
        .score-unit {
          font-size: $font-size-sm;
          color: $color-text-tertiary;
          margin-left: 4rpx;
        }
      }
      
      .item-info {
        flex: 1;
        
        .item-title {
          font-size: $font-size-base;
          color: $color-text-primary;
        }
        
        .item-date {
          font-size: $font-size-xs;
          color: $color-text-tertiary;
          margin-top: 4rpx;
        }
      }
    }
    
    .item-arrow {
      font-size: $font-size-base;
      color: $color-text-tertiary;
    }
    
    &:active {
      background: $color-bg-hover;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
  
  .empty-icon {
    font-size: 120rpx;
  }
  
  .empty-text {
    font-size: $font-size-base;
    color: $color-text-tertiary;
    margin-top: 24rpx;
  }
  
  .btn-predict {
    margin-top: 32rpx;
    padding: 24rpx 48rpx;
    background: linear-gradient(135deg, $color-accent 0%, #FFA500 100%);
    border-radius: $border-radius-lg;
    color: #000;
    font-weight: $font-weight-semibold;
    
    &::after { border: none; }
  }
}

.loading-wrapper {
  display: flex;
  justify-content: center;
  padding: 80rpx 0;
}

.load-more {
  text-align: center;
  padding: 32rpx;
  
  text {
    font-size: $font-size-sm;
    color: $color-text-tertiary;
  }
}
</style>