<template>
  <view class="bazi-display">
    <!-- 标题 -->
    <view class="display-header">
      <text class="header-title">命盘排布</text>
      <view class="header-info">
        <text class="info-item">{{ solarDate }}</text>
        <text class="info-divider">|</text>
        <text class="info-item">{{ lunarDate }}</text>
      </view>
    </view>

    <!-- 八字四柱 -->
    <view class="bazi-grid">
      <view class="grid-row header-row">
        <text class="cell-title">四柱</text>
        <text class="cell-title">天干</text>
        <text class="cell-title">地支</text>
        <text class="cell-title">五行</text>
      </view>
      
      <view class="grid-row" v-for="(column, index) in columns" :key="index">
        <text class="cell-label">{{ column.label }}</text>
        <view class="cell-value">
          <text class="tiangan">{{ bazi[column.key].tiangan }}</text>
        </view>
        <view class="cell-value">
          <text class="dizhi">{{ bazi[column.key].dizhi }}</text>
        </view>
        <view class="cell-value">
          <text class="wuxing" :class="'wuxing-' + bazi[column.key].wuxing">{{ bazi[column.key].wuxing }}</text>
        </view>
      </view>
    </view>

    <!-- 五行统计 -->
    <view class="wuxing-summary">
      <view class="summary-title">五行分布</view>
      <view class="summary-bars">
        <view 
          v-for="(item, index) in wuxingStats" 
          :key="index"
          class="bar-item"
        >
          <view class="bar-label">{{ item.name }}</view>
          <view class="bar-track">
            <view 
              class="bar-fill" 
              :style="{ width: item.percent + '%', background: item.color }"
            ></view>
          </view>
          <view class="bar-value">{{ item.percent }}%</view>
        </view>
      </view>
    </view>

    <!-- 藏干信息 -->
    <view class="canggan-section" v-if="showCanggan">
      <view class="section-title">地支藏干</view>
      <view class="canggan-grid">
        <view 
          v-for="(item, index) in cangganData" 
          :key="index"
          class="canggan-item"
        >
          <text class="dizhi">{{ item.dizhi }}</text>
          <text class="canggan-list">{{ item.canggan }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'BaziDisplay',
  
  props: {
    bazi: {
      type: Object,
      required: true,
      default: () => ({
        year: { tiangan: '甲', dizhi: '子', wuxing: '木' },
        month: { tiangan: '丙', dizhi: '寅', wuxing: '火' },
        day: { tiangan: '戊', dizhi: '午', wuxing: '土' },
        time: { tiangan: '庚', dizhi: '申', wuxing: '金' }
      })
    },
    showCanggan: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      columns: [
        { label: '年柱', key: 'year' },
        { label: '月柱', key: 'month' },
        { label: '日柱', key: 'day' },
        { label: '时柱', key: 'time' }
      ],
      solarDate: '2024-01-15',
      lunarDate: '二〇二三年腊月初五'
    }
  },
  
  computed: {
    wuxingStats() {
      const wuxingMap = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 }
      
      Object.values(this.bazi).forEach(item => {
        const w = item.wuxing
        if (w.length === 1) {
          wuxingMap[w]++
        } else {
          // 混合五行按比例
          w.split('').forEach(char => {
            if (wuxingMap[char] !== undefined) {
              wuxingMap[char] += 0.5
            }
          })
        }
      })
      
      const total = Object.values(wuxingMap).reduce((a, b) => a + b, 0)
      const colors = { '金': '#FFD700', '木': '#4CAF50', '水': '#2196F3', '火': '#F44336', '土': '#8B4513' }
      
      return Object.entries(wuxingMap).map(([name, count]) => ({
        name,
        percent: Math.round((count / total) * 100),
        color: colors[name]
      }))
    },
    
    cangganData() {
      // 地支藏干表
      const cangganMap = {
        '子': '癸',
        '丑': '己癸辛',
        '寅': '甲丙戊',
        '卯': '乙',
        '辰': '戊乙癸',
        '巳': '丙戊庚',
        '午': '丁己',
        '未': '己丁乙',
        '申': '庚壬戊',
        '酉': '辛',
        '戌': '戊辛丁',
        '亥': '壬甲'
      }
      
      return Object.entries(this.bazi).map(([key, item]) => ({
        dizhi: item.dizhi,
        canggan: cangganMap[item.dizhi] || ''
      }))
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.bazi-display {
  padding: 24rpx;
  background: $color-bg-card;
  border-radius: $border-radius-base;
  border: 1rpx solid $color-border;
}

.display-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  
  .header-title {
    font-size: $font-size-base;
    color: $color-text-primary;
    font-weight: $font-weight-semibold;
  }
  
  .header-info {
    display: flex;
    align-items: center;
    gap: 12rpx;
    
    .info-item {
      font-size: $font-size-xs;
      color: $color-text-tertiary;
    }
    
    .info-divider {
      color: $color-border-light;
    }
  }
}

.bazi-grid {
  border: 1rpx solid $color-border-light;
  border-radius: $border-radius-sm;
  overflow: hidden;
  
  .grid-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    border-bottom: 1rpx solid $color-border-light;
    
    &:last-child {
      border-bottom: none;
    }
    
    &.header-row {
      background: $color-bg-hover;
      
      .cell-title {
        color: $color-text-tertiary;
      }
    }
  }
  
  .cell-title,
  .cell-label,
  .cell-value {
    padding: 16rpx 8rpx;
    text-align: center;
    font-size: $font-size-sm;
  }
  
  .cell-title {
    font-weight: $font-weight-medium;
  }
  
  .cell-label {
    color: $color-text-secondary;
  }
  
  .cell-value {
    .tiangan {
      font-size: $font-size-lg;
      color: $color-accent;
      font-weight: $font-weight-bold;
    }
    
    .dizhi {
      font-size: $font-size-lg;
      color: $color-text-primary;
      font-weight: $font-weight-bold;
    }
    
    .wuxing {
      font-size: $font-size-xs;
      
      &.wuxing-金 { color: #FFD700; }
      &.wuxing-木 { color: #4CAF50; }
      &.wuxing-水 { color: #2196F3; }
      &.wuxing-火 { color: #F44336; }
      &.wuxing-土 { color: #8B4513; }
    }
  }
}

.wuxing-summary {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid $color-border-light;
  
  .summary-title {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin-bottom: 16rpx;
  }
  
  .summary-bars {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    
    .bar-item {
      display: flex;
      align-items: center;
      gap: 12rpx;
      
      .bar-label {
        width: 40rpx;
        font-size: $font-size-sm;
        color: $color-text-tertiary;
      }
      
      .bar-track {
        flex: 1;
        height: 16rpx;
        background: $color-bg-hover;
        border-radius: 8rpx;
        overflow: hidden;
        
        .bar-fill {
          height: 100%;
          border-radius: 8rpx;
          transition: width 0.5s ease;
        }
      }
      
      .bar-value {
        width: 60rpx;
        font-size: $font-size-xs;
        color: $color-text-secondary;
        text-align: right;
      }
    }
  }
}

.canggan-section {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid $color-border-light;
  
  .section-title {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin-bottom: 16rpx;
  }
  
  .canggan-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12rpx;
    
    .canggan-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12rpx;
      background: $color-bg-hover;
      border-radius: $border-radius-xs;
      
      .dizhi {
        font-size: $font-size-base;
        color: $color-accent;
        font-weight: $font-weight-bold;
        margin-bottom: 4rpx;
      }
      
      .canggan-list {
        font-size: $font-size-xs;
        color: $color-text-secondary;
      }
    }
  }
}
</style>