<template>
  <view class="callback-page">
    <!-- Loading状态 -->
    <view class="loading-wrapper" v-if="isLoading">
      <LoadingSpinner :text="loadingText" size="large" />
      <text class="loading-hint">{{ loadingHint }}</text>
    </view>

    <!-- 成功状态 -->
    <view class="success-wrapper" v-else-if="status === 'success'">
      <view class="success-icon bounce-in">🎉</view>
      <text class="success-title">绑定成功</text>
      <text class="success-desc">{{ successDesc }}</text>
      <view class="reward-info">
        <text class="reward-icon">🎁</text>
        <text class="reward-text">您已获得1次免费算命机会</text>
      </view>
      <button class="btn-start" @tap="goToPredict">开始测算</button>
    </view>

    <!-- 失败状态 -->
    <view class="fail-wrapper" v-else-if="status === 'failed'">
      <view class="fail-icon">😢</view>
      <text class="fail-title">绑定失败</text>
      <text class="fail-desc">{{ failDesc }}</text>
      <button class="btn-retry" @tap="retry">重新尝试</button>
      <button class="btn-skip" @tap="goToPredict">跳过绑定</button>
    </view>
  </view>
</template>

<script>
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.vue'

export default {
  components: {
    LoadingSpinner
  },
  
  data() {
    return {
      isLoading: true,
      status: '', // '', 'success', 'failed'
      loadingText: '处理中...',
      loadingHint: '正在绑定邀请关系',
      successDesc: '您已成功绑定邀请关系',
      failDesc: '邀请关系绑定失败，但不影响使用',
      inviteCode: '',
      inviterId: ''
    }
  },
  
  onLoad(options) {
    // 获取邀请码
    this.inviteCode = options.inviteCode || ''
    this.inviterId = options.inviterId || ''
    
    // 解析URL参数
    if (options.scene) {
      // 扫描二维码场景
      try {
        const params = JSON.parse(decodeURIComponent(options.scene))
        this.inviteCode = params.inviteCode || ''
        this.inviterId = params.inviterId || ''
      } catch (e) {
        console.error('Parse scene failed:', e)
      }
    }
    
    // 执行绑定
    if (this.inviteCode) {
      this.bindInvite()
    } else {
      this.status = 'failed'
      this.failDesc = '未获取到邀请码信息'
      this.isLoading = false
    }
  },
  
  methods: {
    async bindInvite() {
      try {
        this.isLoading = true
        this.loadingText = '绑定中...'
        this.loadingHint = '正在建立邀请关系'
        
        // TODO: 调用后端API绑定邀请关系
        // const res = await post('/api/invite/bind', {
        //   inviteCode: this.inviteCode,
        //   inviterId: this.inviterId
        // })
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // 模拟成功
        this.status = 'success'
        
        // 保存邀请信息到本地
        uni.setStorageSync('invite_bind', {
          inviteCode: this.inviteCode,
          inviterId: this.inviterId,
          bindTime: Date.now()
        })
        
      } catch (e) {
        console.error('Bind invite failed:', e)
        this.status = 'failed'
        this.failDesc = e.message || '绑定失败，请稍后重试'
      } finally {
        this.isLoading = false
      }
    },
    
    retry() {
      this.isLoading = true
      this.status = ''
      this.bindInvite()
    },
    
    goToPredict() {
      uni.switchTab({ url: '/pages/index/index' })
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.callback-page {
  min-height: 100vh;
  background: $color-bg-primary;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $page-padding-h;
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .loading-hint {
    margin-top: 24rpx;
    font-size: $font-size-sm;
    color: $color-text-secondary;
  }
}

.success-wrapper,
.fail-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.success-icon,
.fail-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.success-title,
.fail-title {
  font-size: $font-size-xl;
  color: $color-text-primary;
  font-weight: $font-weight-bold;
  margin-bottom: 16rpx;
}

.success-desc,
.fail-desc {
  font-size: $font-size-base;
  color: $color-text-secondary;
  margin-bottom: 48rpx;
  line-height: 1.6;
}

.reward-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx 48rpx;
  background: rgba($color-accent, 0.1);
  border-radius: $border-radius-base;
  margin-bottom: 48rpx;
  
  .reward-icon {
    font-size: 40rpx;
  }
  
  .reward-text {
    font-size: $font-size-base;
    color: $color-accent;
  }
}

.btn-start,
.btn-retry {
  width: 100%;
  max-width: 400rpx;
  height: 96rpx;
  background: linear-gradient(135deg, $color-accent 0%, #FFA500 100%);
  border-radius: 48rpx;
  font-size: $font-size-base;
  color: #000;
  font-weight: $font-weight-semibold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  
  &::after { border: none; }
}

.btn-skip {
  width: 100%;
  max-width: 400rpx;
  height: 80rpx;
  background: transparent;
  border: 1rpx solid $color-border;
  border-radius: 40rpx;
  font-size: $font-size-sm;
  color: $color-text-tertiary;
  
  &::after { border: none; }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

.bounce-in {
  animation: bounceIn 0.5s ease forwards;
}
</style>