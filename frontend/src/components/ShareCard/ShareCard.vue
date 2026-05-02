<template>
  <view class="share-card">
    <!-- Canvas用于生成分享图 -->
    <canvas 
      canvas-id="shareCanvas" 
      class="share-canvas"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
    />
    
    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button class="btn-save" @tap="saveImage">
        <text class="btn-icon">💾</text>
        <text>保存图片</text>
      </button>
      <button class="btn-share" open-type="share">
        <text class="btn-icon">📱</text>
        <text>分享好友</text>
      </button>
    </view>
    
    <!-- 提示文字 -->
    <view class="tips" v-if="showTips">
      <text>保存图片后可分享到朋友圈</text>
    </view>
  </view>
</template>

<script>
/**
 * ShareCard - 分享卡片组件
 * @description 生成并分享算命结果卡片
 */
export default {
  name: 'ShareCard',
  props: {
    // 分享数据
    data: {
      type: Object,
      required: true
    },
    // Canvas宽度 (px)
    canvasWidth: {
      type: Number,
      default: 375
    },
    // Canvas高度 (px)
    canvasHeight: {
      type: Number,
      default: 667
    },
    // 显示提示
    showTips: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      ctx: null
    }
  },
  mounted() {
    this.initCanvas()
  },
  methods: {
    // 初始化Canvas
    initCanvas() {
      // UniApp使用uni.createCanvasContext
      this.ctx = uni.createCanvasContext('shareCanvas', this)
      this.drawCard()
    },

    // 绘制分享卡片
    drawCard() {
      const ctx = this.ctx
      const w = this.canvasWidth
      const h = this.canvasHeight

      // 背景渐变
      ctx.fillStyle = '#0D0D1A'
      ctx.fillRect(0, 0, w, h)

      // 顶部装饰条
      ctx.fillStyle = '#FFD700'
      ctx.fillRect(0, 0, w, 8)

      // 标题
      ctx.fillStyle = '#FFD700'
      ctx.font = 'bold 28px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('天命阁', w / 2, 60)

      // 副标题
      ctx.fillStyle = '#B8B8D0'
      ctx.font = '14px sans-serif'
      ctx.fillText('命格分析报告', w / 2, 90)

      // 分隔线
      ctx.setStrokeStyle('rgba(255, 215, 0, 0.3)')
      ctx.beginPath()
      ctx.moveTo(40, 120)
      ctx.lineTo(w - 40, 120)
      ctx.stroke()

      // 类型标签
      ctx.fillStyle = '#8B0000'
      ctx.fillRect(w / 2 - 40, 140, 80, 30)
      ctx.fillStyle = '#FFF'
      ctx.font = '14px sans-serif'
      ctx.fillText(this.data.type || '年运', w / 2, 160)

      // 分数
      ctx.fillStyle = '#FFD700'
      ctx.font = 'bold 72px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(this.data.score || 0, w / 2, 240)

      ctx.fillStyle = '#B8B8D0'
      ctx.font = '16px sans-serif'
      ctx.fillText('命格评分', w / 2, 270)

      // 等级徽章
      const levelColors = ['#FFD700', '#90EE90', '#87CEEB', '#D3D3D3', '#B22222']
      const levelNames = ['', '大吉', '吉', '中', '平', '凶']
      const level = this.data.level || 1
      ctx.fillStyle = levelColors[level - 1]
      ctx.beginPath()
      ctx.arc(w / 2, 320, 35, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#000'
      ctx.font = 'bold 18px sans-serif'
      ctx.fillText(levelNames[level], w / 2, 325)

      // 五行分布
      ctx.fillStyle = '#FFF'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('五行分布', 40, 400)

      // 五行条
      const wuxingData = this.data.wuxing || [
        { name: '金', percent: 20 },
        { name: '木', percent: 20 },
        { name: '水', percent: 20 },
        { name: '火', percent: 20 },
        { name: '土', percent: 20 }
      ]
      const wuxingColors = { '金': '#FFD700', '木': '#4CAF50', '水': '#2196F3', '火': '#F44336', '土': '#8B4513' }

      let x = 40
      wuxingData.forEach(item => {
        const barWidth = (item.percent / 100) * (w - 80)
        ctx.fillStyle = wuxingColors[item.name] || '#888'
        ctx.fillRect(x, 420, barWidth, 30)
        ctx.fillStyle = '#000'
        ctx.font = '12px sans-serif'
        if (item.percent >= 15) {
          ctx.fillText(item.name, x + barWidth / 2, 440)
        }
        x += barWidth
      })

      // 底部信息
      ctx.fillStyle = '#6B6B80'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('扫码查看更多', w / 2, h - 80)
      ctx.fillText('© 天命阁', w / 2, h - 40)

      ctx.draw()
    },

    // 保存图片
    async saveImage() {
      try {
        uni.showLoading({ title: '保存中...' })
        
        // 导出canvas为图片
        const res = await new Promise((resolve, reject) => {
          uni.canvasToTempFilePath({
            canvasId: 'shareCanvas',
            success: resolve,
            fail: reject,
            this: this
          })
        })

        // 保存到相册
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
        console.error('Save image failed:', e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.share-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-md;

  .share-canvas {
    border-radius: $border-radius-lg;
    box-shadow: $shadow-lg;
  }

  .action-buttons {
    display: flex;
    gap: $spacing-md;
    margin-top: $spacing-lg;
    width: 100%;

    .btn-save,
    .btn-share {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: $spacing-sm;
      height: $btn-height-base;
      background: $color-bg-card;
      border: 1rpx solid $color-border;
      border-radius: $border-radius-base;
      color: $color-text-primary;
      font-size: $font-size-base;

      .btn-icon {
        font-size: $icon-size-sm;
      }

      &::after {
        border: none;
      }
    }
  }

  .tips {
    margin-top: $spacing-md;
    color: $color-text-tertiary;
    font-size: $font-size-sm;
  }
}
</style>