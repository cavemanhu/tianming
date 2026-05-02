<template>
  <view class="fortune-page">
    <!-- Loading状态 -->
    <view class="loading-wrapper" v-if="isLoading">
      <LoadingSpinner text="命盘中..." size="large" />
    </view>

    <!-- 结果内容 -->
    <view class="result-content" v-else>
      <!-- 顶部导航 -->
      <view class="nav-bar" :class="{ 'nav-animated': navVisible }">
        <view class="nav-back" @tap="goBack">
          <text class="nav-icon">←</text>
        </view>
        <text class="nav-title">{{ result.title || '命格详情' }}</text>
        <view class="nav-actions">
          <text class="action-icon" @tap="shareResult">📤</text>
        </view>
      </view>

      <!-- 主卡片 - 分数 -->
      <view class="main-score-card" :class="{ 'card-animated': contentVisible }">
        <view class="score-display">
          <view class="score-wrapper">
            <text class="score-value" ref="scoreValue">{{ displayScore }}</text>
            <text class="score-unit">分</text>
          </view>
        </view>
        <view class="score-info">
          <LevelBadge :level="result.level" :name="result.levelName" />
          <text class="score-label">命格评分</text>
        </view>
      </view>

      <!-- 八字命盘 -->
      <view class="section" v-if="result.bazi" :class="{ 'section-animated': contentVisible }">
        <view class="section-delay-1">
          <BaziChart 
            :bazi="result.bazi"
            :class="{ 'gpu-accelerated': true }"
            @share="shareResult"
          />
        </view>
      </view>

      <!-- 五行分布 -->
      <view class="section" v-if="result.wuxing" :class="{ 'section-animated': contentVisible }">
        <view class="section-delay-2">
          <view class="section-card">
            <view class="card-header">
              <text class="card-title">五行分布</text>
            </view>
            <WuxingChart 
              :data="wuxingData"
              :show-legend="true"
            />
          </view>
        </view>
      </view>

      <!-- 姻缘配对结果 -->
      <view class="section" v-if="result.loveMatch" :class="{ 'section-animated': contentVisible }">
        <view class="section-delay-3">
          <view class="section-card">
            <LoveMatchCard
              :male-info="result.loveMatch.maleInfo"
              :female-info="result.loveMatch.femaleInfo"
              :match-score="result.loveMatch.score"
              :result-type="result.loveMatch.resultType"
              @share="shareResult"
            />
          </view>
        </view>
      </view>

      <!-- 运势摘要 -->
      <view class="section" v-if="result.summary" :class="{ 'section-animated': contentVisible }">
        <view class="section-delay-4">
          <view class="section-card summary-card">
            <view class="card-header">
              <text class="card-title">运势摘要</text>
            </view>
            <view class="card-content">
              <text class="content-text fade-in-text">{{ result.summary }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 详细分析 -->
      <view class="section" v-if="result.details" :class="{ 'section-animated': contentVisible }">
        <view class="section-delay-5">
          <view class="section-card">
            <view class="card-header">
              <text class="card-title">详细解读</text>
            </view>
            <view class="card-content">
              <text class="content-text fade-in-text">{{ result.details }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 幸运时间 -->
      <view class="section lucky-section" v-if="result.luckyMonth || result.unluckyMonth" :class="{ 'section-animated': contentVisible }">
        <view class="section-delay-6">
          <view class="lucky-item lucky-good">
            <view class="lucky-icon float">🎉</view>
            <view class="lucky-info">
              <text class="lucky-label">幸运月</text>
              <text class="lucky-value">{{ result.luckyMonth || '待定' }}</text>
            </view>
          </view>
          <view class="lucky-item unlucky-bad">
            <view class="lucky-icon float" style="animation-delay: 0.5s">⚠️</view>
            <view class="lucky-info">
              <text class="lucky-label">注意月</text>
              <text class="lucky-value">{{ result.unluckyMonth || '待定' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-section" :class="{ 'action-animated': contentVisible }">
        <button class="btn-share" @tap="shareResult">
          <text>📤</text>
          <text>分享结果</text>
        </button>
        <button class="btn-again" @tap="predictAgain">
          <text>🔄</text>
          <text>再次测算</text>
        </button>
      </view>
    </view>

    <!-- 成功弹窗 -->
    <view class="success-modal" v-if="showSuccessModal" @tap="closeModal">
      <view class="modal-content bounce-in">
        <text class="success-icon success-check">✓</text>
        <text class="success-text">分享成功</text>
      </view>
    </view>
  </view>
</template>

<script>
import { useFortuneStore } from '@/store/fortune'
import LevelBadge from '@/components/LevelBadge/LevelBadge.vue'
import WuxingChart from '@/components/WuxingChart/WuxingChart.vue'
import BaziChart from '@/components/BaziChart/BaziChart.vue'
import LoveMatchCard from '@/components/LoveMatchCard/LoveMatchCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.vue'

export default {
  components: {
    FortuneCard,
    LevelBadge,
    WuxingChart,
    BaziChart,
    LoveMatchCard,
    LoadingSpinner
  },
  
  data() {
    return {
      navVisible: false,
      contentVisible: false,
      displayScore: 0,
      showSuccessModal: false,
      
      result: {}
    }
  },
  
  computed: {
    fortuneStore() {
      return useFortuneStore()
    },
    
    isLoading() {
      return this.fortuneStore.isLoading
    },
    
    wuxingData() {
      if (!this.result.wuxing) return []
      const wuxing = this.result.wuxing
      return [
        { name: '金', percent: wuxing.jin || 20, color: '#FFD700' },
        { name: '木', percent: wuxing.mu || 20, color: '#4CAF50' },
        { name: '水', percent: wuxing.shui || 20, color: '#2196F3' },
        { name: '火', percent: wuxing.huo || 20, color: '#F44336' },
        { name: '土', percent: wuxing.tu || 20, color: '#8B4513' }
      ]
    }
  },
  
  onLoad(options) {
    this.loadResult(options)
  },
  
  onReady() {
    this.playEntryAnimations()
  },
  
  methods: {
    async loadResult(options) {
      const fortuneStore = useFortuneStore()
      
      // 从store获取结果（从input页面跳转过来）
      if (fortuneStore.currentResult) {
        this.result = fortuneStore.currentResult
        this.updateDisplayScore()
        return
      }
      
      // 如果有task_id参数，调用API获取结果
      if (options.id || options.task_id) {
        const taskId = options.id || options.task_id
        try {
          await fortuneStore.fetchResult(taskId)
          if (fortuneStore.currentResult) {
            this.result = fortuneStore.currentResult
            this.updateDisplayScore()
          }
        } catch (e) {
          console.error('Load result error:', e)
          uni.showToast({ title: '获取结果失败', icon: 'none' })
        }
        return
      }
      
      // 如果是predict模式但没有结果，显示空状态
      if (options.mode === 'predict' && !fortuneStore.currentResult) {
        this.result = { title: '命格详情', type: options.type || 'year' }
      }
    },
    
    updateDisplayScore() {
      // 动画更新分数
      const targetScore = this.result.score || 0
      let current = 0
      const step = targetScore / 30
      const timer = setInterval(() => {
        current += step
        if (current >= targetScore) {
          this.displayScore = targetScore
          clearInterval(timer)
        } else {
          this.displayScore = Math.floor(current)
        }
      }, 30)
    },
    
    playEntryAnimations() {
      // 导航入场
      setTimeout(() => {
        this.navVisible = true
      }, 100)
      
      // 主卡片入场
      setTimeout(() => {
        this.contentVisible = true
        this.animateScore()
      }, 300)
    },
    
    animateScore() {
      // 分数滚动动画
      const targetScore = this.result.score || 0
      const duration = 1500
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // 缓动函数
        const easeOut = 1 - Math.pow(1 - progress, 3)
        this.displayScore = Math.round(targetScore * easeOut)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      animate()
    },
    
    goBack() {
      uni.navigateBack()
    },
    
    shareResult() {
      uni.showShareMenu({
        withShareTicket: true,
        success: () => {
          this.showSuccessModal = true
          setTimeout(() => {
            this.closeModal()
          }, 1500)
        }
      })
    },
    
    closeModal() {
      this.showSuccessModal = false
    },
    
    predictAgain() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/animations.scss';

.fortune-page {
  min-height: 100vh;
  background: $color-bg-primary;
  padding-bottom: 120rpx;
}

.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

// 导航动画
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 80rpx $page-padding-h 32rpx;
  opacity: 0;
  transform: translateY(-20rpx);
  transition: all 0.4s ease;
  
  &.nav-animated {
    opacity: 1;
    transform: translateY(0);
  }
  
  .nav-back,
  .nav-placeholder {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    color: $color-text-primary;
  }
  
  .nav-title {
    flex: 1;
    font-size: $font-size-lg;
    color: $color-text-primary;
    font-weight: $font-weight-semibold;
    text-align: center;
  }
  
  .nav-actions {
    .action-icon {
      font-size: 48rpx;
    }
  }
}

// 主卡片动画
.main-score-card {
  margin: 0 $page-padding-h 32rpx;
  padding: 48rpx 32rpx;
  background: linear-gradient(135deg, $color-bg-card 0%, rgba($color-accent, 0.1) 100%);
  border-radius: $border-radius-lg;
  border: 1rpx solid $color-border;
  text-align: center;
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  &.card-animated {
    opacity: 1;
    transform: scale(1);
  }
  
  .score-display {
    .score-wrapper {
      display: flex;
      align-items: baseline;
      justify-content: center;
      
      .score-value {
        font-size: 120rpx;
        color: $color-accent;
        font-weight: $font-weight-bold;
        line-height: 1;
      }
      
      .score-unit {
        font-size: $font-size-xl;
        color: $color-text-secondary;
        margin-left: 8rpx;
      }
    }
  }
  
  .score-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 24rpx;
    
    .score-label {
      font-size: $font-size-sm;
      color: $color-text-tertiary;
      margin-top: 12rpx;
    }
  }
}

// 内容区动画
.section {
  margin-bottom: 24rpx;
  padding: 0 $page-padding-h;
  opacity: 0;
  transform: translateY(30rpx);
  transition: all 0.5s ease;
  
  &.section-animated {
    opacity: 1;
    transform: translateY(0);
  }
  
  .section-delay-1 { transition-delay: 100ms; }
  .section-delay-2 { transition-delay: 200ms; }
  .section-delay-3 { transition-delay: 300ms; }
  .section-delay-4 { transition-delay: 400ms; }
  .section-delay-5 { transition-delay: 500ms; }
  .section-delay-6 { transition-delay: 600ms; }
}

.section-card {
  background: $color-bg-card;
  border-radius: $border-radius-base;
  border: 1rpx solid $color-border;
  overflow: hidden;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1rpx solid $color-border-light;
    
    .card-title {
      font-size: $font-size-base;
      color: $color-text-primary;
      font-weight: $font-weight-medium;
    }
  }
  
  .card-content {
    padding: 24rpx;
    
    .content-text {
      font-size: $font-size-sm;
      color: $color-text-secondary;
      line-height: 1.8;
    }
  }
}

// 幸运区域
.lucky-section {
  display: flex;
  gap: 24rpx;
  
  .lucky-item {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 24rpx;
    background: $color-bg-card;
    border-radius: $border-radius-base;
    
    .lucky-icon {
      font-size: 48rpx;
      margin-right: 16rpx;
    }
    
    .lucky-info {
      .lucky-label {
        display: block;
        font-size: $font-size-xs;
        color: $color-text-tertiary;
      }
      
      .lucky-value {
        font-size: $font-size-base;
        font-weight: $font-weight-medium;
      }
    }
    
    &.lucky-good .lucky-value {
      color: $color-success;
    }
    
    &.unlucky-bad .lucky-value {
      color: $color-error;
    }
  }
}

// 操作按钮动画
.action-section {
  display: flex;
  gap: 24rpx;
  padding: 48rpx $page-padding-h;
  opacity: 0;
  transform: translateY(30rpx);
  transition: all 0.5s ease;
  transition-delay: 700ms;
  
  &.action-animated {
    opacity: 1;
    transform: translateY(0);
  }
  
  button {
    flex: 1;
    height: 96rpx;
    border-radius: $border-radius-base;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    font-size: $font-size-base;
    transition: all 0.2s ease;
    
    &::after { border: none; }
    
    &:active {
      transform: scale(0.96);
    }
    
    text {
      font-weight: $font-weight-medium;
    }
  }
  
  .btn-share {
    background: $color-bg-card;
    border: 1rpx solid $color-border;
    
    text {
      color: $color-text-primary;
    }
  }
  
  .btn-again {
    background: linear-gradient(135deg, $color-accent 0%, #FFA500 100%);
    
    text {
      color: #000;
      font-weight: $font-weight-semibold;
    }
  }
}

// 成功弹窗
.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  .modal-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60rpx 80rpx;
    background: $color-bg-card;
    border-radius: $border-radius-lg;
    
    .success-icon {
      font-size: 80rpx;
      color: $color-success;
    }
    
    .success-text {
      font-size: $font-size-lg;
      color: $color-text-primary;
      margin-top: 24rpx;
    }
  }
}
</style>