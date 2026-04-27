<template>
  <view class="index-page">
    <!-- 顶部区域 -->
    <view class="header-section">
      <view class="user-greeting">
        <text class="greeting-text">{{ greeting }}</text>
        <text class="user-name" v-if="userStore.isLogin">{{ userStore.nickname }}</text>
        <text class="user-name" v-else @tap="goToLogin">点击登录</text>
      </view>
      <view class="header-date">
        <text class="date-text">{{ lunarDate }}</text>
      </view>
    </view>

    <!-- Logo区域 -->
    <view class="hero-section">
      <view class="logo-container">
        <text class="logo-char">天</text>
        <text class="logo-char">命</text>
        <text class="logo-char">阁</text>
      </view>
      <text class="hero-slogan">知命而为，顺势而行</text>
    </view>

    <!-- 算命类型选择 -->
    <view class="fortune-types">
      <view class="section-title">
        <text>探索命运</text>
      </view>
      
      <view class="type-grid">
        <view 
          v-for="(type, index) in fortuneTypes" 
          :key="type.value"
          class="type-card"
          :class="'type-' + type.value"
          @tap="selectFortuneType(type.value)"
        >
          <view class="type-icon">{{ type.icon }}</view>
          <view class="type-info">
            <text class="type-name">{{ type.label }}</text>
            <text class="type-desc">{{ type.desc }}</text>
          </view>
          <view class="type-arrow">→</view>
        </view>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-actions">
      <view class="action-item" @tap="goToHistory">
        <text class="action-icon">📜</text>
        <text class="action-text">历史记录</text>
      </view>
      <view class="action-item" @tap="goToProfile">
        <text class="action-icon">👤</text>
        <text class="action-text">个人中心</text>
      </view>
      <view class="action-item" @tap="showShareGuide">
        <text class="action-icon">🎁</text>
        <text class="action-text">邀请好友</text>
      </view>
    </view>

    <!-- 最新算命结果 -->
    <view class="latest-result" v-if="latestResult" @tap="goToResult">
      <FortuneCard 
        :title="latestResult.title"
        :score="latestResult.score"
        :level="latestResult.level"
        :level-name="latestResult.levelName"
        :shadow="true"
        :decorative="true"
      >
        <template #header>
          <text class="card-tag">最近算命</text>
          <LevelBadge :level="latestResult.level" />
        </template>
        <template #footer>
          <view class="result-footer">
            <text class="view-detail">查看详情 →</text>
          </view>
        </template>
      </FortuneCard>
    </view>

    <!-- Loading状态 -->
    <view class="loading-container" v-if="isLoading">
      <LoadingSpinner text="命盘中..." size="large" />
    </view>
  </view>
</template>

<script>
import { useUserStore } from '@/store/user'
import { useFortuneStore } from '@/store/fortune'
import FortuneCard from '@/components/FortuneCard/FortuneCard.vue'
import LevelBadge from '@/components/LevelBadge/LevelBadge.vue'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.vue'

export default {
  components: {
    FortuneCard,
    LevelBadge,
    LoadingSpinner
  },
  
  data() {
    return {
      fortuneTypes: [
        { value: 'year', label: '年运', icon: '📅', desc: '全年运势分析' },
        { value: 'month', label: '月运', icon: '🌙', desc: '本月运势预测' },
        { value: 'love', label: '爱情', icon: '💕', desc: '情感姻缘分析' },
        { value: 'career', label: '事业', icon: '💼', desc: '职场发展指导' }
      ]
    }
  },
  
  computed: {
    userStore() {
      return useUserStore()
    },
    
    fortuneStore() {
      return useFortuneStore()
    },
    
    isLoading() {
      return this.fortuneStore.isLoading || this.fortuneStore.isPredicting
    },
    
    latestResult() {
      return this.fortuneStore.currentResult
    },
    
    greeting() {
      const hour = new Date().getHours()
      if (hour < 6) return '夜深了'
      if (hour < 9) return '早安'
      if (hour < 12) return '上午好'
      if (hour < 14) return '中午好'
      if (hour < 18) return '下午好'
      if (hour < 22) return '傍晚好'
      return '晚上好'
    },
    
    lunarDate() {
      // 简化版，实际应使用农历转换库
      const now = new Date()
      const month = now.getMonth() + 1
      const date = now.getDate()
      return `${month}月${date}日`
    }
  },
  
  onLoad() {
    this.checkLogin()
    this.loadLatestResult()
  },
  
  onShow() {
    this.checkLogin()
  },
  
  onPullDownRefresh() {
    this.loadLatestResult().finally(() => {
      uni.stopPullDownRefresh()
    })
  },
  
  methods: {
    checkLogin() {
      this.userStore.checkLogin()
    },
    
    loadLatestResult() {
      // 从缓存加载最新结果
      const cached = uni.getStorageSync('fortune_cache')
      if (cached) {
        this.fortuneStore.currentResult = cached
      }
    },
    
    goToLogin() {
      uni.navigateTo({ url: '/pages/login/index' })
    },
    
    goToHistory() {
      uni.switchTab({ url: '/pages/history/index' })
    },
    
    goToProfile() {
      uni.switchTab({ url: '/pages/profile/index' })
    },
    
    goToResult() {
      const id = this.latestResult?.id
      if (id) {
        uni.navigateTo({ url: `/pages/fortune/index?id=${id}` })
      }
    },
    
    selectFortuneType(type) {
      if (!this.userStore.isLogin) {
        uni.navigateTo({ url: '/pages/login/index' })
        return
      }
      
      uni.navigateTo({ 
        url: `/pages/fortune/index?type=${type}&mode=predict` 
      })
    },
    
    showShareGuide() {
      uni.showModal({
        title: '邀请好友',
        content: '小程序码和分享链接即将上线',
        showCancel: false
      })
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.index-page {
  min-height: 100vh;
  background: linear-gradient(180deg, $color-bg-primary 0%, $color-bg-secondary 100%);
  padding-bottom: 120rpx; // TabBar高度
}

// 顶部区域
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 80rpx $page-padding-h 32rpx;
  
  .user-greeting {
    .greeting-text {
      font-size: $font-size-sm;
      color: $color-text-secondary;
    }
    
    .user-name {
      display: block;
      font-size: $font-size-lg;
      color: $color-text-primary;
      font-weight: $font-weight-semibold;
      margin-top: 8rpx;
    }
  }
  
  .header-date {
    text-align: right;
    
    .date-text {
      font-size: $font-size-sm;
      color: $color-text-tertiary;
    }
  }
}

// Logo区域
.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0;
  
  .logo-container {
    display: flex;
    gap: 24rpx;
    
    .logo-char {
      font-size: 80rpx;
      font-weight: $font-weight-bold;
      color: $color-accent;
      text-shadow: 0 0 40rpx rgba($color-accent, 0.4);
    }
  }
  
  .hero-slogan {
    margin-top: 16rpx;
    font-size: $font-size-sm;
    color: $color-text-secondary;
    letter-spacing: 4rpx;
  }
}

// 算命类型选择
.fortune-types {
  padding: 0 $page-padding-h;
  
  .section-title {
    font-size: $font-size-lg;
    color: $color-text-primary;
    font-weight: $font-weight-semibold;
    margin-bottom: 24rpx;
  }
  
  .type-grid {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    
    .type-card {
      display: flex;
      align-items: center;
      padding: 24rpx;
      background: $color-bg-card;
      border-radius: $border-radius-base;
      border: 1rpx solid $color-border;
      
      .type-icon {
        font-size: 48rpx;
        margin-right: 20rpx;
      }
      
      .type-info {
        flex: 1;
        
        .type-name {
          font-size: $font-size-base;
          color: $color-text-primary;
          font-weight: $font-weight-medium;
        }
        
        .type-desc {
          font-size: $font-size-sm;
          color: $color-text-tertiary;
          margin-top: 4rpx;
        }
      }
      
      .type-arrow {
        font-size: $font-size-base;
        color: $color-text-tertiary;
      }
      
      &:active {
        background: $color-bg-hover;
      }
    }
  }
}

// 快捷入口
.quick-actions {
  display: flex;
  justify-content: space-around;
  padding: 48rpx $page-padding-h;
  margin-top: 32rpx;
  
  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    
    .action-icon {
      font-size: 48rpx;
    }
    
    .action-text {
      font-size: $font-size-sm;
      color: $color-text-secondary;
    }
    
    &:active {
      opacity: 0.7;
    }
  }
}

// 最新结果
.latest-result {
  margin: 32rpx $page-padding-h;
  
  .card-tag {
    font-size: $font-size-xs;
    color: $color-text-tertiary;
    background: $color-bg-hover;
    padding: 4rpx 12rpx;
    border-radius: $border-radius-xs;
  }
  
  .result-footer {
    display: flex;
    justify-content: flex-end;
    
    .view-detail {
      font-size: $font-size-sm;
      color: $color-accent;
    }
  }
}

// Loading
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80rpx;
}
</style>