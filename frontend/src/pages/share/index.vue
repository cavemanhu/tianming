<template>
  <view class="share-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-close" @tap="closePage">
        <text>✕</text>
      </view>
      <text class="nav-title">分享命运</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 分享卡片预览 -->
    <view class="share-preview">
      <view class="preview-container">
        <canvas 
          canvas-id="shareCanvas" 
          class="share-canvas"
          :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
        />
      </view>
      <text class="preview-hint">长按保存图片或直接分享</text>
    </view>

    <!-- 分享选项 -->
    <view class="share-options">
      <view class="section-title">
        <text>分享方式</text>
      </view>
      
      <view class="option-grid">
        <view class="option-item" @tap="shareToWechat">
          <view class="option-icon green">💬</view>
          <text class="option-name">微信好友</text>
        </view>
        <view class="option-item" @tap="shareToMoments">
          <view class="option-icon green">🖼️</view>
          <text class="option-name">朋友圈</text>
        </view>
        <view class="option-item" @tap="saveToAlbum">
          <view class="option-icon blue">💾</view>
          <text class="option-name">保存图片</text>
        </view>
        <view class="option-item" @tap="copyLink">
          <view class="option-icon gray">🔗</view>
          <text class="option-name">复制链接</text>
        </view>
      </view>
    </view>

    <!-- 分享海报模板 -->
    <view class="share-templates">
      <view class="section-title">
        <text>海报模板</text>
      </view>
      
      <scroll-view class="template-scroll" scroll-x>
        <view 
          v-for="(template, index) in templates" 
          :key="index"
          class="template-item"
          :class="{ active: selectedTemplate === index }"
          @tap="selectTemplate(index)"
        >
          <view class="template-preview" :class="'template-' + template.style">
            <text class="template-icon">{{ template.icon }}</text>
          </view>
          <text class="template-name">{{ template.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 分享说明 -->
    <view class="share-tips">
      <view class="section-title">
        <text>分享说明</text>
      </view>
      <view class="tips-list">
        <view class="tip-item">
          <text class="tip-number">1</text>
          <text class="tip-text">点击上方按钮保存图片或直接分享</text>
        </view>
        <view class="tip-item">
          <text class="tip-number">2</text>
          <text class="tip-text">好友扫描二维码即可查看您的命格分析</text>
        </view>
        <view class="tip-item">
          <text class="tip-number">3</text>
          <text class="tip-text">每成功邀请1位好友，您将获得1次免费算命机会</text>
        </view>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-actions">
      <button class="btn-invite" @tap="goToInvite">
        <text>🎁</text>
        <text>邀请好友得免费次数</text>
      </button>
    </view>

    <!-- Toast提示 -->
    <view class="toast" :class="{ visible: showToast }">
      <text>{{ toastMessage }}</text>
    </view>
  </view>
</template>

<script>
import { drawShareCard } from '@/utils/qrcode'

export default {
  data() {
    return {
      canvasWidth: 320,
      canvasHeight: 520,
      selectedTemplate: 0,
      showToast: false,
      toastMessage: '',
      
      templates: [
        { name: '经典', icon: '📜', style: 'classic', bgColor: '#1A1A2E' },
        { name: '金色', icon: '✨', style: 'gold', bgColor: '#2A2520' },
        { name: '神秘', icon: '🌙', style: 'mystic', bgColor: '#0D1A2E' },
        { name: '喜庆', icon: '🎉', style: 'festive', bgColor: '#2E1A1A' }
      ],
      
      shareData: {
        type: '年运',
        title: '2026年运势分析',
        score: 88,
        level: 1,
        nickname: '命运探索者',
        wuxing: [
          { name: '金', percent: 20 },
          { name: '木', percent: 25 },
          { name: '水', percent: 15 },
          { name: '火', percent: 20 },
          { name: '土', percent: 20 }
        ]
      }
    }
  },
  
  onLoad(options) {
    if (options.data) {
      try {
        this.shareData = JSON.parse(decodeURIComponent(options.data))
      } catch (e) {
        console.error('Parse share data failed:', e)
      }
    }
    
    this.calculateCanvasSize()
  },
  
  onReady() {
    this.drawShareCard()
  },
  
  methods: {
    calculateCanvasSize() {
      const sysInfo = uni.getSystemInfoSync()
      const scale = sysInfo.screenWidth / 375
      this.canvasWidth = Math.round(320 * scale)
      this.canvasHeight = Math.round(520 * scale)
    },
    
    drawShareCard() {
      const ctx = uni.createCanvasContext('shareCanvas', this)
      const template = this.templates[this.selectedTemplate]
      
      const cardData = {
        ...this.shareData,
        backgroundColor: template.bgColor
      }
      
      drawShareCard(ctx, cardData, this.canvasWidth, this.canvasHeight)
    },
    
    selectTemplate(index) {
      this.selectedTemplate = index
      this.drawShareCard()
      this.showToastMessage('模板已切换')
    },
    
    shareToWechat() {
      // #ifdef MP-WEIXIN
      uni.showShareMenu({
        withShareTicket: true,
        success: () => {
          this.showToastMessage('请点击右上角分享')
        },
        fail: () => {
          this.showToastMessage('分享失败')
        }
      })
      // #endif
      
      // #ifndef MP-WEIXIN
      this.showToastMessage('请在微信小程序中使用')
      // #endif
    },
    
    shareToMoments() {
      this.showToastMessage('请先保存图片，再分享到朋友圈')
    },
    
    async saveToAlbum() {
      try {
        uni.showLoading({ title: '保存中...' })
        
        // 确保canvas已绘制
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const res = await new Promise((resolve, reject) => {
          uni.canvasToTempFilePath({
            canvasId: 'shareCanvas',
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
        this.showToastMessage('保存成功')
      } catch (e) {
        uni.hideLoading()
        this.showToastMessage('保存失败')
        console.error('Save image failed:', e)
      }
    },
    
    copyLink() {
      const link = `https://tianming.com/share?id=${this.shareData.id || 'demo'}&inviteCode=${uni.getStorageSync('inviteCode') || ''}`
      uni.setClipboardData({
        data: link,
        success: () => {
          this.showToastMessage('链接已复制')
        },
        fail: () => {
          this.showToastMessage('复制失败')
        }
      })
    },
    
    goToInvite() {
      uni.navigateTo({ url: '/pages/invite/index' })
    },
    
    closePage() {
      uni.navigateBack()
    },
    
    showToastMessage(message) {
      this.toastMessage = message
      this.showToast = true
      setTimeout(() => {
        this.showToast = false
      }, 2000)
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.share-page {
  min-height: 100vh;
  background: $color-bg-primary;
  padding-bottom: 140rpx;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 80rpx $page-padding-h 32rpx;
  
  .nav-close,
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

.share-preview {
  padding: 0 $page-padding-h;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .preview-container {
    .share-canvas {
      border-radius: $border-radius-lg;
      box-shadow: $shadow-lg;
    }
  }
  
  .preview-hint {
    margin-top: 16rpx;
    font-size: $font-size-xs;
    color: $color-text-tertiary;
  }
}

.share-options {
  padding: 40rpx $page-padding-h 24rpx;
  
  .section-title {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin-bottom: 20rpx;
    
    text::before {
      content: '';
      display: inline-block;
      width: 6rpx;
      height: 20rpx;
      background: $color-accent;
      margin-right: 12rpx;
      border-radius: 3rpx;
      vertical-align: middle;
    }
  }
  
  .option-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24rpx;
    
    .option-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12rpx;
      
      .option-icon {
        width: 96rpx;
        height: 96rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48rpx;
        
        &.green { background: rgba(#4CAF50, 0.1); }
        &.blue { background: rgba(#2196F3, 0.1); }
        &.gray { background: rgba(#6B6B80, 0.2); }
      }
      
      .option-name {
        font-size: $font-size-xs;
        color: $color-text-secondary;
      }
      
      &:active {
        opacity: 0.7;
      }
    }
  }
}

.share-templates {
  padding: 24rpx 0;
  
  .section-title {
    padding: 0 $page-padding-h;
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin-bottom: 20rpx;
    
    text::before {
      content: '';
      display: inline-block;
      width: 6rpx;
      height: 20rpx;
      background: $color-accent;
      margin-right: 12rpx;
      border-radius: 3rpx;
      vertical-align: middle;
    }
  }
  
  .template-scroll {
    white-space: nowrap;
    padding: 0 $page-padding-h;
    
    .template-item {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      margin-right: 24rpx;
      gap: 8rpx;
      
      .template-preview {
        width: 100rpx;
        height: 160rpx;
        border-radius: $border-radius-sm;
        border: 1rpx solid $color-border;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .template-icon {
          font-size: 48rpx;
        }
        
        &.template-classic { background: #1A1A2E; }
        &.template-gold { background: #2A2520; }
        &.template-mystic { background: #0D1A2E; }
        &.template-festive { background: #2E1A1A; }
      }
      
      .template-name {
        font-size: $font-size-xs;
        color: $color-text-tertiary;
      }
      
      &.active {
        .template-preview {
          border-color: $color-accent;
          box-shadow: 0 0 12rpx rgba($color-accent, 0.3);
        }
        
        .template-name {
          color: $color-accent;
        }
      }
    }
  }
}

.share-tips {
  padding: 24rpx $page-padding-h;
  
  .section-title {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin-bottom: 20rpx;
    
    text::before {
      content: '';
      display: inline-block;
      width: 6rpx;
      height: 20rpx;
      background: $color-accent;
      margin-right: 12rpx;
      border-radius: 3rpx;
      vertical-align: middle;
    }
  }
  
  .tips-list {
    .tip-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16rpx;
      
      .tip-number {
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
      
      .tip-text {
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
  
  .btn-invite {
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

.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  padding: 24rpx 48rpx;
  background: rgba(0, 0, 0, 0.8);
  border-radius: $border-radius-base;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
  
  &.visible {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  
  text {
    font-size: $font-size-base;
    color: #fff;
  }
}
</style>