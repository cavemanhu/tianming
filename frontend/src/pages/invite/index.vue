<template>
  <view class="invite-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text>←</text>
      </view>
      <text class="nav-title">邀请好友</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 顶部装饰 -->
    <view class="hero-section">
      <view class="hero-icon float">🎁</view>
      <text class="hero-title">邀请好友 得免费算命</text>
      <text class="hero-subtitle">每成功邀请1位好友，您将获得1次免费算命机会</text>
    </view>

    <!-- 邀请码 -->
    <view class="invite-code-section">
      <view class="section-card">
        <view class="card-header">
          <text class="card-title">我的邀请码</text>
          <view class="share-btn" @tap="shareInviteCode">
            <text>📤</text>
          </view>
        </view>
        <view class="code-display">
          <text class="invite-code">{{ inviteCode }}</text>
          <view class="copy-btn" :class="{ copied: isCopied }" @tap="copyInviteCode">
            <text v-if="!isCopied">📋 复制</text>
            <text v-else>✓ 已复制</text>
          </view>
        </view>
        <view class="code-hint">
          <text>好友注册时填写此邀请码即可</text>
        </view>
      </view>
    </view>

    <!-- 二维码 -->
    <view class="qrcode-section">
      <view class="section-card">
        <view class="card-header">
          <text class="card-title">扫码邀请</text>
        </view>
        <view class="qrcode-display">
          <canvas canvas-id="qrcodeCanvas" class="qrcode-canvas" />
        </view>
        <view class="qrcode-hint">
          <text>保存二维码发给好友扫描</text>
        </view>
        <view class="qrcode-actions">
          <button class="btn-save" @tap="saveQRCode">
            <text>💾</text>
            <text>保存图片</text>
          </button>
          <button class="btn-share" open-type="share">
            <text>📤</text>
            <text>分享二维码</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 邀请统计 -->
    <view class="stats-section">
      <view class="section-card">
        <view class="card-header">
          <text class="card-title">邀请统计</text>
        </view>
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-value">{{ stats.invitedCount }}</text>
            <text class="stat-label">已邀请</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ stats.usedCount }}</text>
            <text class="stat-label">已使用</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ stats.remainCount }}</text>
            <text class="stat-label">剩余次数</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 邀请排行榜 -->
    <view class="rank-section">
      <view class="section-card">
        <view class="card-header">
          <text class="card-title">邀请排行榜</text>
        </view>
        <view class="rank-list">
          <view 
            v-for="(item, index) in rankList" 
            :key="index"
            class="rank-item"
            :class="'rank-' + (index + 1)"
          >
            <view class="rank-position">
              <text v-if="index < 3" class="position-medal">{{ ['🥇', '🥈', '🥉'][index] }}</text>
              <text v-else class="position-number">{{ index + 1 }}</text>
            </view>
            <view class="rank-avatar">
              <text class="avatar-icon">{{ item.avatar }}</text>
            </view>
            <view class="rank-info">
              <text class="rank-name">{{ item.nickname }}</text>
              <text class="rank-count">{{ item.inviteCount }}次邀请</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 活动规则 -->
    <view class="rules-section">
      <view class="section-card">
        <view class="card-header">
          <text class="card-title">活动规则</text>
        </view>
        <view class="rules-list">
          <view class="rule-item">
            <text class="rule-number">1</text>
            <text class="rule-text">每成功邀请1位新用户注册，双方各获得1次免费算命机会</text>
          </view>
          <view class="rule-item">
            <text class="rule-number">2</text>
            <text class="rule-text">被邀请人需在72小时内完成注册并填写邀请码</text>
          </view>
          <view class="rule-item">
            <text class="rule-number">3</text>
            <text class="rule-text">免费算命机会有效期为30天，不可折现</text>
          </view>
          <view class="rule-item">
            <text class="rule-number">4</text>
            <text class="rule-text">如有作弊行为，将取消活动资格</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <button class="btn-share-invite" open-type="share">
        <text>📤</text>
        <text>邀请微信好友</text>
      </button>
    </view>
  </view>
</template>

<script>
import { drawQRCode } from '@/utils/qrcode'

export default {
  data() {
    return {
      inviteCode: 'TM20260425ABC',
      isCopied: false,
      
      stats: {
        invitedCount: 5,
        usedCount: 3,
        remainCount: 2
      },
      
      rankList: [
        { nickname: '命运达人', inviteCount: 128, avatar: '👑' },
        { nickname: '算命高手', inviteCount: 86, avatar: '🎯' },
        { nickname: '天命之人', inviteCount: 65, avatar: '🔮' },
        { nickname: '福运满满', inviteCount: 42, avatar: '🌟' },
        { nickname: '吉祥如意', inviteCount: 38, avatar: '✨' }
      ]
    }
  },
  
  onLoad() {
    this.loadInviteData()
  },
  
  onReady() {
    this.drawQRCode()
  },
  
  onShareAppMessage() {
    return {
      title: '探索你的命运 | 天命阁',
      path: `/pages/callback/index?inviteCode=${this.inviteCode}`,
      imageUrl: '/static/share-cover.png'
    }
  },
  
  methods: {
    loadInviteData() {
      // TODO: 从后端获取邀请数据
      // const res = await get('/api/user/invite')
      // this.inviteCode = res.data.inviteCode
      // this.stats = res.data.stats
      
      // 模拟获取邀请码
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.inviteCode = `TM${Date.now().toString(36).toUpperCase()}`
      }
    },
    
    drawQRCode() {
      const ctx = uni.createCanvasContext('qrcodeCanvas', this)
      
      const shareUrl = `https://tianming.com/callback?inviteCode=${this.inviteCode}`
      drawQRCode(ctx, shareUrl, 0, 0, 200, {
        backgroundColor: '#ffffff',
        foregroundColor: '#000000'
      })
    },
    
    copyInviteCode() {
      uni.setClipboardData({
        data: this.inviteCode,
        success: () => {
          this.isCopied = true
          uni.showToast({ title: '邀请码已复制', icon: 'success' })
          setTimeout(() => {
            this.isCopied = false
          }, 2000)
        }
      })
    },
    
    shareInviteCode() {
      uni.showShareMenu({
        withShareTicket: true
      })
    },
    
    async saveQRCode() {
      try {
        uni.showLoading({ title: '保存中...' })
        
        const res = await new Promise((resolve, reject) => {
          uni.canvasToTempFilePath({
            canvasId: 'qrcodeCanvas',
            success: resolve,
            fail: reject,
            this: this
          })
        })
        
        await new Promise((resolve, reject) => {
          uni.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: resolve,
            fail: reject
          })
        })
        
        uni.hideLoading()
        uni.showToast({ title: '保存成功', icon: 'success' })
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    },
    
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.invite-page {
  min-height: 100vh;
  background: $color-bg-primary;
  padding-bottom: 140rpx;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 80rpx $page-padding-h 32rpx;
  
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
    font-size: $font-size-lg;
    color: $color-text-primary;
    font-weight: $font-weight-semibold;
  }
}

.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx $page-padding-h;
  text-align: center;
  
  .hero-icon {
    font-size: 100rpx;
    margin-bottom: 24rpx;
  }
  
  .hero-title {
    font-size: $font-size-xl;
    color: $color-text-primary;
    font-weight: $font-weight-bold;
    margin-bottom: 12rpx;
  }
  
  .hero-subtitle {
    font-size: $font-size-sm;
    color: $color-text-secondary;
  }
}

.section-card {
  margin: 0 $page-padding-h 24rpx;
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
    
    .share-btn {
      width: 48rpx;
      height: 48rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
    }
  }
}

.invite-code-section {
  .code-display {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32rpx;
    gap: 24rpx;
    
    .invite-code {
      font-size: 44rpx;
      color: $color-accent;
      font-weight: $font-weight-bold;
      letter-spacing: 4rpx;
    }
    
    .copy-btn {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 12rpx 24rpx;
      background: rgba($color-accent, 0.1);
      border-radius: $border-radius-sm;
      
      text {
        font-size: $font-size-sm;
        color: $color-accent;
      }
      
      &.copied {
        background: rgba($color-success, 0.1);
        text {
          color: $color-success;
        }
      }
    }
  }
  
  .code-hint {
    text-align: center;
    padding-bottom: 24rpx;
    
    text {
      font-size: $font-size-xs;
      color: $color-text-tertiary;
    }
  }
}

.qrcode-section {
  .qrcode-display {
    display: flex;
    justify-content: center;
    padding: 32rpx;
    
    .qrcode-canvas {
      width: 200px;
      height: 200px;
      border-radius: $border-radius-sm;
    }
  }
  
  .qrcode-hint {
    text-align: center;
    padding-bottom: 16rpx;
    
    text {
      font-size: $font-size-xs;
      color: $color-text-tertiary;
    }
  }
  
  .qrcode-actions {
    display: flex;
    gap: 24rpx;
    padding: 0 24rpx 24rpx;
    
    button {
      flex: 1;
      height: 72rpx;
      border-radius: $border-radius-sm;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
      
      &::after { border: none; }
      
      text {
        font-size: $font-size-sm;
      }
    }
    
    .btn-save {
      background: $color-bg-hover;
      border: 1rpx solid $color-border;
      
      text {
        color: $color-text-primary;
      }
    }
    
    .btn-share {
      background: rgba($color-accent, 0.1);
      border: 1rpx solid rgba($color-accent, 0.3);
      
      text {
        color: $color-accent;
      }
    }
  }
}

.stats-section {
  .stats-grid {
    display: flex;
    justify-content: space-around;
    padding: 32rpx 24rpx;
    
    .stat-item {
      text-align: center;
      
      .stat-value {
        display: block;
        font-size: $font-size-xxl;
        color: $color-accent;
        font-weight: $font-weight-bold;
      }
      
      .stat-label {
        font-size: $font-size-xs;
        color: $color-text-tertiary;
        margin-top: 8rpx;
      }
    }
    
    .stat-divider {
      width: 1rpx;
      height: 60rpx;
      background: $color-border-light;
    }
  }
}

.rank-section {
  .rank-list {
    padding: 16rpx 24rpx;
    
    .rank-item {
      display: flex;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid $color-border-light;
      
      &:last-child {
        border-bottom: none;
      }
      
      .rank-position {
        width: 48rpx;
        text-align: center;
        
        .position-medal {
          font-size: 32rpx;
        }
        
        .position-number {
          font-size: $font-size-base;
          color: $color-text-tertiary;
        }
      }
      
      .rank-avatar {
        width: 60rpx;
        height: 60rpx;
        margin: 0 16rpx;
        background: $color-bg-hover;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .avatar-icon {
          font-size: 32rpx;
        }
      }
      
      .rank-info {
        flex: 1;
        
        .rank-name {
          display: block;
          font-size: $font-size-sm;
          color: $color-text-primary;
        }
        
        .rank-count {
          font-size: $font-size-xs;
          color: $color-text-tertiary;
          margin-top: 4rpx;
        }
      }
      
      &.rank-1 .rank-name { color: #FFD700; }
      &.rank-2 .rank-name { color: #C0C0C0; }
      &.rank-3 .rank-name { color: #CD7F32; }
    }
  }
}

.rules-section {
  .rules-list {
    padding: 16rpx 24rpx 24rpx;
    
    .rule-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16rpx;
      
      .rule-number {
        width: 36rpx;
        height: 36rpx;
        background: rgba($color-accent, 0.1);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: $font-size-xs;
        color: $color-accent;
        flex-shrink: 0;
        margin-right: 16rpx;
      }
      
      .rule-text {
        flex: 1;
        font-size: $font-size-sm;
        color: $color-text-secondary;
        line-height: 1.6;
      }
    }
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx $page-padding-h 40rpx;
  background: linear-gradient(180deg, transparent, $color-bg-primary 30%);
  
  .btn-share-invite {
    width: 100%;
    height: 96rpx;
    background: linear-gradient(135deg, $color-accent 0%, #FFA500 100%);
    border-radius: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    font-size: $font-size-base;
    color: #000;
    font-weight: $font-weight-semibold;
    box-shadow: 0 8rpx 32rpx rgba($color-accent, 0.3);
    
    &::after { border: none; }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20rpx);
  }
}

.float {
  animation: float 3s ease-in-out infinite;
}
</style>