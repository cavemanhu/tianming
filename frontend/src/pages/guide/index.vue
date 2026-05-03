<template>
  <view class="guide-page">
    <!-- 引导步骤指示器 -->
    <view class="step-indicators">
      <view 
        v-for="i in 4" 
        :key="i" 
        class="indicator"
        :class="{ active: currentStep === i, completed: currentStep > i }"
      />
    </view>

    <!-- 引导内容 -->
    <swiper class="guide-swiper" :current="currentStep - 1" @change="onSwiperChange" :disable-touch="true">
      <!-- Step 1: 欢迎 -->
      <swiper-item>
        <view class="guide-content">
          <view class="guide-icon">🔮</view>
          <text class="guide-title">欢迎来到天命阁</text>
          <text class="guide-desc">在这里，您将探索命运的奥秘，解读八字命理的深层含义</text>
        </view>
      </swiper-item>

      <!-- Step 2: 功能介绍 -->
      <swiper-item>
        <view class="guide-content">
          <view class="guide-icon">📊</view>
          <text class="guide-title">三大核心功能</text>
          <view class="feature-list">
            <view class="feature-item">
              <text class="feature-icon">🎯</text>
              <view class="feature-text">
                <text class="feature-name">八字年运</text>
                <text class="feature-desc">分析您今年的运势走向</text>
              </view>
            </view>
            <view class="feature-item">
              <text class="feature-icon">💕</text>
              <view class="feature-text">
                <text class="feature-name">姻缘配对</text>
                <text class="feature-desc">测算您与TA的缘分指数</text>
              </view>
            </view>
            <view class="feature-item">
              <text class="feature-icon">✨</text>
              <view class="feature-text">
                <text class="feature-name">智能取名</text>
                <text class="feature-desc">根据八字五行补足吉祥</text>
              </view>
            </view>
          </view>
        </view>
      </swiper-item>

      <!-- Step 3: 如何使用 -->
      <swiper-item>
        <view class="guide-content">
          <view class="guide-icon">📝</view>
          <text class="guide-title">使用步骤</text>
          <view class="step-list">
            <view class="step-item">
              <text class="step-num">1</text>
              <text class="step-text">填写您的出生信息（年月日时）</text>
            </view>
            <view class="step-item">
              <text class="step-num">2</text>
              <text class="step-text">选择您想要的测算类型</text>
            </view>
            <view class="step-item">
              <text class="step-num">3</text>
              <text class="step-text">获取专属命理分析报告</text>
            </view>
            <view class="step-item">
              <text class="step-num">4</text>
              <text class="step-text">分享给好友，一起探索命运</text>
            </view>
          </view>
        </view>
      </swiper-item>

      <!-- Step 4: 开始使用 -->
      <swiper-item>
        <view class="guide-content">
          <view class="guide-icon">🚀</view>
          <text class="guide-title">准备好了吗？</text>
          <text class="guide-desc">命运的大门已经为您敞开</text>
          <view class="bonus-card">
            <text class="bonus-title">新用户福利</text>
            <text class="bonus-content">注册即送100天命币，可免费进行多次测算</text>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <!-- 底部按钮 -->
    <view class="guide-footer">
      <button v-if="currentStep < 4" class="btn-next" @tap="nextStep">
        <text>下一步</text>
        <text>→</text>
      </button>
      <button v-else class="btn-start" @tap="startUse">
        <text>开始探索</text>
      </button>
      <view class="skip-btn" @tap="skipGuide" v-if="currentStep < 4">
        <text>跳过</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentStep: 1
    }
  },

  onLoad() {
    // 检查是否已看过引导
    const hasSeenGuide = uni.getStorageSync('hasSeenGuide')
    if (hasSeenGuide) {
      this.goHome()
    }
  },

  methods: {
    nextStep() {
      if (this.currentStep < 4) {
        this.currentStep++
      }
    },

    onSwiperChange(e) {
      this.currentStep = e.detail.current + 1
    },

    skipGuide() {
      this.finishGuide()
    },

    startUse() {
      this.finishGuide()
    },

    finishGuide() {
      uni.setStorageSync('hasSeenGuide', true)
      this.goHome()
    },

    goHome() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.guide-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1A1A2E 0%, #16213E 100%);
  display: flex;
  flex-direction: column;
  padding-top: 80rpx;
}

.step-indicators {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  padding: 40rpx 0;

  .indicator {
    width: 24rpx;
    height: 6rpx;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3rpx;
    transition: all 0.3s ease;

    &.active {
      width: 48rpx;
      background: #FFD700;
    }

    &.completed {
      background: rgba(255, 215, 0, 0.5);
    }
  }
}

.guide-swiper {
  flex: 1;
  height: 600rpx;
}

.guide-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 80rpx;
  height: 100%;

  .guide-icon {
    font-size: 160rpx;
    margin-bottom: 48rpx;
  }

  .guide-title {
    font-size: 48rpx;
    color: #FFFFFF;
    font-weight: bold;
    margin-bottom: 24rpx;
  }

  .guide-desc {
    font-size: 28rpx;
    color: #B8B8D0;
    text-align: center;
    line-height: 1.6;
  }
}

.feature-list {
  width: 100%;
  margin-top: 40rpx;

  .feature-item {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;

    .feature-icon {
      font-size: 48rpx;
      margin-right: 20rpx;
    }

    .feature-text {
      flex: 1;
      display: flex;
      flex-direction: column;

      .feature-name {
        font-size: 30rpx;
        color: #FFFFFF;
        font-weight: 500;
      }

      .feature-desc {
        font-size: 24rpx;
        color: #B8B8D0;
        margin-top: 6rpx;
      }
    }
  }
}

.step-list {
  width: 100%;
  margin-top: 40rpx;

  .step-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);

    &:last-child {
      border-bottom: none;
    }

    .step-num {
      width: 48rpx;
      height: 48rpx;
      background: rgba(255, 215, 0, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      color: #FFD700;
      margin-right: 20rpx;
    }

    .step-text {
      flex: 1;
      font-size: 28rpx;
      color: #FFFFFF;
    }
  }
}

.bonus-card {
  margin-top: 60rpx;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.15) 100%);
  border: 1rpx solid rgba(255, 215, 0, 0.3);
  border-radius: 20rpx;
  padding: 32rpx;
  text-align: center;

  .bonus-title {
    display: block;
    font-size: 32rpx;
    color: #FFD700;
    font-weight: bold;
    margin-bottom: 12rpx;
  }

  .bonus-content {
    font-size: 26rpx;
    color: #B8B8D0;
  }
}

.guide-footer {
  padding: 40rpx 60rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;

  .btn-next,
  .btn-start {
    width: 100%;
    height: 96rpx;
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    border-radius: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    box-shadow: 0 8rpx 32rpx rgba(255, 215, 0, 0.3);

    &::after { border: none; }

    text {
      font-size: 32rpx;
      color: #1A1A2E;
      font-weight: bold;
    }
  }

  .skip-btn {
    padding: 16rpx 32rpx;

    text {
      font-size: 26rpx;
      color: #6B6B80;
    }
  }
}
</style>
