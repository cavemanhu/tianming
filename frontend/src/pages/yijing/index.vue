<template>
  <view class="yijing-page">
    <!-- 背景 -->
    <view class="bg-gradient"></view>
    
    <!-- 顶部标题 -->
    <view class="page-header">
      <text class="header-title">易经占卜</text>
      <text class="header-subtitle">64卦 · 铜钱摇卦 · 阴阳之道</text>
    </view>
    
    <!-- 占卜区域 -->
    <view class="divine-section">
      <!-- 卦象展示 -->
      <view class="hexagram-display" :class="{ 'has-result': result }">
        <view class="hexagram-symbol" v-if="!result">
          <text class="symbol-text">☰</text>
          <text class="symbol-text">☷</text>
        </view>
        <view class="hexagram-result" v-else>
          <text class="hexagram-gua">{{ result.hexagram.gua }}</text>
          <text class="hexagram-name">{{ result.hexagram.name }}</text>
          <text class="hexagram-meaning">{{ result.hexagram.meaning }}</text>
        </view>
      </view>
      
      <!-- 摇卦按钮 -->
      <view class="divine-action" v-if="!result">
        <view class="coin-area">
          <view class="coin coin-1" :class="{ spinning: spinning }">3</view>
          <view class="coin coin-2" :class="{ spinning: spinning }">3</view>
          <view class="coin coin-3" :class="{ spinning: spinning }">3</view>
        </view>
        <text class="action-hint">点击下方按钮开始摇卦</text>
        <button class="divine-btn" @click="doDivine" :disabled="loading">
          <text v-if="loading">摇卦中...</text>
          <text v-else>🎲 摇一卦</text>
        </button>
      </view>
      
      <!-- 爻象 -->
      <view class="yao-display" v-if="result">
        <view class="yao-title">六爻</view>
        <view class="yao-list">
          <view 
            class="yao-item" 
            v-for="(yao, index) in result.yaoDescriptions" 
            :key="index"
          >
            <text class="yao-position">{{ yao.position.split('：')[0] }}</text>
            <view class="yao-bar" :class="yao.type === '阳爻' ? 'yang' : 'yin'"></view>
            <text class="yao-type">{{ yao.type }}</text>
          </view>
        </view>
        
        <!-- 动爻标记 -->
        <view class="dong-yao" v-if="result.dongYao.length">
          <text class="dong-label">动爻：</text>
          <text class="dong-value" v-for="d in result.dongYao" :key="d">{{ d }}</text>
        </view>
      </view>
      
      <!-- 卦辞解读 -->
      <view class="interpretation" v-if="result">
        <view class="interp-section">
          <text class="interp-title">卦辞</text>
          <text class="interp-content">{{ result.hexagram.interpretation }}</text>
        </view>
        
        <view class="interp-section">
          <text class="interp-title">典故</text>
          <text class="interp-content poetry">{{ result.hexagram.poetry }}</text>
        </view>
        
        <view class="interp-section" v-if="result.changedHexagram">
          <text class="interp-title">变卦</text>
          <view class="changed-hex">
            <text class="changed-name">{{ result.changedHexagram.name }}</text>
            <text class="changed-desc">事物变化发展的趋势</text>
          </view>
        </view>
      </view>
      
      <!-- 再次摇卦 -->
      <button class="restart-btn" v-if="result" @click="resetDivine">
        重新摇卦
      </button>
    </view>
    
    <!-- 八卦简介 -->
    <view class="bagua-intro">
      <text class="intro-title">八卦方位</text>
      <view class="bagua-grid">
        <view class="bagua-item" v-for="(item, index) in baguaList" :key="index">
          <text class="bagua-symbol">{{ item.symbol }}</text>
          <text class="bagua-name">{{ item.name }}</text>
          <text class="bagua-dir">{{ item.dir }}</text>
        </view>
      </view>
    </view>
    
    <!-- 底部TabBar -->
    <view class="tabbar">
      <view class="tab-item" @click="goHome">
        <text class="tab-icon">🏠</text>
        <text class="tab-text">首页</text>
      </view>
      <view class="tab-item">
        <text class="tab-icon">✍️</text>
        <text class="tab-text">取名</text>
      </view>
      <view class="tab-item">
        <text class="tab-icon active">☯️</text>
        <text class="tab-text active">易经</text>
      </view>
      <view class="tab-item">
        <text class="tab-icon">👤</text>
        <text class="tab-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      result: null,
      loading: false,
      spinning: false,
      apiBaseUrl: 'http://localhost:3000',
      baguaList: [
        { symbol: '☰', name: '乾', dir: '西北', wuxing: '金' },
        { symbol: '☱', name: '兑', dir: '西', wuxing: '金' },
        { symbol: '☲', name: '离', dir: '南', wuxing: '火' },
        { symbol: '☳', name: '震', dir: '东', wuxing: '木' },
        { symbol: '☴', name: '巽', dir: '东南', wuxing: '木' },
        { symbol: '☵', name: '坎', dir: '北', wuxing: '水' },
        { symbol: '☶', name: '艮', dir: '东北', wuxing: '土' },
        { symbol: '☷', name: '坤', dir: '西南', wuxing: '土' }
      ]
    }
  },
  methods: {
    async doDivine() {
      this.loading = true;
      this.spinning = true;
      
      // 模拟铜钱转动动画
      await new Promise(r => setTimeout(r, 1500));
      
      try {
        const res = await uni.request({
          url: `${this.apiBaseUrl}/api/yijing/divine`,
          method: 'POST'
        });
        
        if (res.data.code === 0) {
          this.result = res.data.data;
        }
      } catch (e) {
        console.error('divine error:', e);
        uni.showToast({ title: '网络错误', icon: 'none' });
      }
      
      this.loading = false;
      this.spinning = false;
    },
    resetDivine() {
      this.result = null;
    },
    goHome() {
      uni.switchTab({ url: '/pages/index/index' });
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/v2-variables.scss';

.yijing-page {
  min-height: 100vh;
  background: $bg-primary;
  padding-bottom: 120rpx;
  position: relative;
}

.bg-gradient {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 600rpx;
  background: $gradient-ink;
  z-index: 0;
}

.page-header {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 40rpx 0 30rpx;
  
  .header-title {
    font-size: 48rpx;
    font-weight: 700;
    color: $gold-primary;
    font-family: $font-display;
    display: block;
    text-shadow: 0 0 20px rgba(255,215,0,0.3);
  }
  
  .header-subtitle {
    font-size: 24rpx;
    color: $text-secondary;
    display: block;
    margin-top: 12rpx;
  }
}

.divine-section {
  margin: 0 32rpx;
  padding: 40rpx;
  background: $bg-card;
  border-radius: 24rpx;
  position: relative;
  z-index: 1;
}

.hexagram-display {
  text-align: center;
  padding: 40rpx 0;
  
  .symbol-text {
    font-size: 80rpx;
    color: $gold-primary;
    margin: 0 20rpx;
    opacity: 0.3;
  }
  
  &.has-result {
    padding: 30rpx 0;
  }
}

.hexagram-result {
  .hexagram-gua {
    font-size: 120rpx;
    color: $gold-primary;
    display: block;
    text-shadow: 0 0 30px rgba(255,215,0,0.5);
    animation: glow 2s ease-in-out infinite alternate;
  }
  
  .hexagram-name {
    font-size: 56rpx;
    font-weight: 700;
    color: $text-primary;
    display: block;
    margin-top: 16rpx;
  }
  
  .hexagram-meaning {
    font-size: 28rpx;
    color: $text-secondary;
    display: block;
    margin-top: 8rpx;
  }
}

@keyframes glow {
  from { text-shadow: 0 0 20px rgba(255,215,0,0.3); }
  to { text-shadow: 0 0 40px rgba(255,215,0,0.7); }
}

.divine-action {
  text-align: center;
  
  .action-hint {
    font-size: 26rpx;
    color: $text-secondary;
    display: block;
    margin-bottom: 30rpx;
  }
}

.coin-area {
  display: flex;
  justify-content: center;
  gap: 30rpx;
  margin-bottom: 30rpx;
}

.coin {
  width: 100rpx;
  height: 100rpx;
  background: $gradient-gold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  font-weight: 700;
  color: $bg-primary;
  box-shadow: $shadow-gold;
  
  &.spinning {
    animation: coinFlip 0.3s ease-in-out infinite;
  }
  
  &.coin-1.spinning { animation-delay: 0s; }
  &.coin-2.spinning { animation-delay: 0.1s; }
  &.coin-3.spinning { animation-delay: 0.2s; }
}

@keyframes coinFlip {
  0%, 100% { transform: rotateY(0deg); }
  50% { transform: rotateY(180deg); }
}

.divine-btn {
  width: 400rpx;
  height: 96rpx;
  background: $gradient-gold;
  border: none;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: $bg-primary;
  box-shadow: $shadow-gold;
  
  &:disabled {
    opacity: 0.7;
  }
}

.yao-display {
  margin-top: 40rpx;
  padding-top: 30rpx;
  border-top: 1rpx solid rgba(255,255,255,0.05);
  
  .yao-title {
    font-size: 28rpx;
    color: $text-secondary;
    margin-bottom: 20rpx;
  }
}

.yao-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.yao-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  
  .yao-position {
    width: 80rpx;
    font-size: 22rpx;
    color: $text-dim;
  }
  
  .yao-bar {
    flex: 1;
    height: 12rpx;
    border-radius: 6rpx;
    
    &.yang {
      background: $gold-primary;
      box-shadow: 0 0 10px rgba(255,215,0,0.3);
    }
    
    &.yin {
      background: $bg-secondary;
      border: 2rpx solid $gold-dim;
    }
  }
  
  .yao-type {
    width: 60rpx;
    font-size: 20rpx;
    color: $text-secondary;
    text-align: right;
  }
}

.dong-yao {
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1rpx dashed rgba(255,255,255,0.1);
  
  .dong-label {
    font-size: 24rpx;
    color: $text-dim;
  }
  
  .dong-value {
    font-size: 24rpx;
    color: $warning;
    margin-left: 12rpx;
  }
}

.interpretation {
  margin-top: 30rpx;
}

.interp-section {
  margin-bottom: 24rpx;
  
  .interp-title {
    font-size: 26rpx;
    color: $gold-primary;
    display: block;
    margin-bottom: 8rpx;
  }
  
  .interp-content {
    font-size: 28rpx;
    color: $text-secondary;
    line-height: 1.6;
    display: block;
    
    &.poetry {
      font-style: italic;
      color: $text-dim;
    }
  }
}

.changed-hex {
  background: rgba(255,215,0,0.05);
  border-radius: 12rpx;
  padding: 16rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  
  .changed-name {
    font-size: 36rpx;
    font-weight: 700;
    color: $gold-dim;
  }
  
  .changed-desc {
    font-size: 24rpx;
    color: $text-dim;
  }
}

.restart-btn {
  width: 100%;
  height: 88rpx;
  background: $bg-secondary;
  border: 2rpx solid rgba(255,215,0,0.3);
  border-radius: 44rpx;
  font-size: 30rpx;
  color: $gold-primary;
  margin-top: 30rpx;
}

.bagua-intro {
  margin: 40rpx 32rpx;
  padding: 30rpx;
  background: $bg-card;
  border-radius: 20rpx;
  position: relative;
  z-index: 1;
  
  .intro-title {
    font-size: 30rpx;
    font-weight: 600;
    color: $text-primary;
    display: block;
    margin-bottom: 24rpx;
    text-align: center;
  }
}

.bagua-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.bagua-item {
  text-align: center;
  padding: 16rpx 0;
  
  .bagua-symbol {
    font-size: 48rpx;
    display: block;
    margin-bottom: 8rpx;
  }
  
  .bagua-name {
    font-size: 26rpx;
    font-weight: 600;
    color: $text-primary;
    display: block;
  }
  
  .bagua-dir {
    font-size: 20rpx;
    color: $text-secondary;
    display: block;
    margin-top: 4rpx;
  }
}

.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: $bg-secondary;
  border-top: 1rpx solid rgba(255,255,255,0.05);
  display: flex;
  justify-content: space-around;
  padding-bottom: constant(safe-area-inset-bottom);
  z-index: 100;
  
  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 16rpx;
    
    .tab-icon { font-size: 40rpx; opacity: 0.5; }
    .tab-icon.active { opacity: 1; }
    
    .tab-text {
      font-size: 20rpx;
      color: $text-secondary;
      margin-top: 4rpx;
    }
    
    .tab-text.active { color: $gold-primary; }
  }
}
</style>
