<template>
  <view class="bazi-chart">
    <!-- 命盘头部 -->
    <view class="chart-header">
      <text class="header-title">命盘详情</text>
      <view class="header-actions">
        <text class="action-btn" @tap="handleZoom">{{ zoomText }}</text>
      </view>
    </view>

    <!-- 四柱命盘 -->
    <view class="bazi-plate" :class="{ zoomed: isZoomed }">
      <!-- 天干 -->
      <view class="plate-row tiangan-row">
        <view class="plate-cell" v-for="(cell, index) in tianganCells" :key="'t' + index">
          <text class="cell-tiangan">{{ cell.tiangan }}</text>
          <text class="cell-wuxing" :class="'wuxing-' + cell.wuxing">{{ cell.wuxing }}</text>
        </view>
      </view>

      <!-- 地支 -->
      <view class="plate-row dizhi-row">
        <view class="plate-cell" v-for="(cell, index) in dizhiCells" :key="'d' + index">
          <text class="cell-dizhi">{{ cell.dizhi }}</text>
          <view class="cell-canggan">
            <text class="canggan-item" v-for="(cg, i) in cell.canggan" :key="i">{{ cg }}</text>
          </view>
        </view>
      </view>

      <!-- 空亡信息 -->
      <view class="plate-info">
        <view class="info-item">
          <text class="info-label">命宫:</text>
          <text class="info-value">{{ mingGong }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">胎息:</text>
          <text class="info-value">{{ taiXi }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">空亡:</text>
          <text class="info-value">{{ kongWang }}</text>
        </view>
      </view>
    </view>

    <!-- 五行强度 -->
    <view class="wuxing-strength">
      <view class="section-title">五行力量</view>
      <view class="strength-bars">
        <view 
          v-for="(item, index) in wuxingStrength" 
          :key="index"
          class="strength-item"
        >
          <view class="strength-header">
            <text class="strength-name">{{ item.name }}</text>
            <text class="strength-value">{{ item.value }}%</text>
          </view>
          <view class="strength-bar">
            <view 
              class="strength-fill" 
              :style="{ width: item.value + '%', background: item.color }"
            ></view>
          </view>
          <view class="strength-detail">
            <text class="detail-text">{{ item.detail }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 大运流年 -->
    <view class="dayun-section" v-if="showDayun">
      <view class="section-title">大运走势</view>
      <view class="dayun-timeline">
        <view 
          v-for="(item, index) in dayunData" 
          :key="index"
          class="dayun-item"
        >
          <view class="dayun-year">{{ item.year }}</view>
          <view class="dayun-bar">
            <view 
              class="dayun-fill" 
              :class="'level-' + item.level"
              :style="{ height: item.score + '%' }"
            ></view>
          </view>
          <view class="dayun-score">{{ item.score }}</view>
        </view>
      </view>
    </view>

    <!-- 分享按钮 -->
    <view class="share-section">
      <button class="btn-share" @tap="handleShare">
        <text>📤</text>
        <text>分享命盘</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'BaziChart',
  
  props: {
    bazi: {
      type: Object,
      required: true
    },
    showDayun: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      isZoomed: false,
      mingGong: '寅',
      taiXi: '亥',
      kongWang: '辰巳',
      
      dayunData: [
        { year: '2024', score: 75, level: 2 },
        { year: '2025', score: 82, level: 1 },
        { year: '2026', score: 68, level: 3 },
        { year: '2027', score: 90, level: 1 },
        { year: '2028', score: 55, level: 4 }
      ]
    }
  },
  
  computed: {
    zoomText() {
      return this.isZoomed ? '缩小' : '放大'
    },
    
    tianganCells() {
      return [
        { tiangan: this.bazi.year?.tiangan || '甲', wuxing: this.bazi.year?.wuxing || '木' },
        { tiangan: this.bazi.month?.tiangan || '丙', wuxing: this.bazi.month?.wuxing || '火' },
        { tiangan: this.bazi.day?.tiangan || '戊', wuxing: this.bazi.day?.wuxing || '土' },
        { tiangan: this.bazi.time?.tiangan || '庚', wuxing: this.bazi.time?.wuxing || '金' }
      ]
    },
    
    dizhiCells() {
      const cangganMap = {
        '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'],
        '卯': ['乙'], '辰': ['戊', '乙', '癸'], '巳': ['丙', '戊', '庚'],
        '午': ['丁', '己'], '未': ['己', '丁', '乙'], '申': ['庚', '壬', '戊'],
        '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲']
      }
      
      return [
        { dizhi: this.bazi.year?.dizhi || '子', canggan: cangganMap[this.bazi.year?.dizhi] || ['癸'] },
        { dizhi: this.bazi.month?.dizhi || '寅', canggan: cangganMap[this.bazi.month?.dizhi] || ['甲'] },
        { dizhi: this.bazi.day?.dizhi || '午', canggan: cangganMap[this.bazi.day?.dizhi] || ['丁'] },
        { dizhi: this.bazi.time?.dizhi || '申', canggan: cangganMap[this.bazi.time?.dizhi] || ['庚'] }
      ]
    },
    
    wuxingStrength() {
      const data = this.bazi.wuxing || { jin: 20, mu: 20, shui: 20, huo: 20, tu: 20 }
      const colors = { '金': '#FFD700', '木': '#4CAF50', '水': '#2196F3', '火': '#F44336', '土': '#8B4513' }
      const details = {
        '金': '庚辛申酉',
        '木': '甲乙寅卯',
        '水': '壬癸子亥',
        '火': '丙丁巳午',
        '土': '戊己辰戌丑未'
      }
      
      return Object.entries(data).map(([key, value]) => ({
        name: key === 'jin' ? '金' : key === 'mu' ? '木' : key === 'shui' ? '水' : key === 'huo' ? '火' : '土',
        value,
        color: colors[key.charAt(0) === 'j' ? '金' : key.charAt(0) === 'm' ? '木' : key.charAt(0) === 's' ? '水' : key.charAt(0) === 'h' ? '火' : '土'],
        detail: details[key.charAt(0) === 'j' ? '金' : key.charAt(0) === 'm' ? '木' : key.charAt(0) === 's' ? '水' : key.charAt(0) === 'h' ? '火' : '土']
      }))
    }
  },
  
  methods: {
    handleZoom() {
      this.isZoomed = !this.isZoomed
    },
    
    handleShare() {
      this.$emit('share')
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.bazi-chart {
  padding: 24rpx;
  background: $color-bg-card;
  border-radius: $border-radius-lg;
  border: 1rpx solid $color-border;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  
  .header-title {
    font-size: $font-size-lg;
    color: $color-text-primary;
    font-weight: $font-weight-semibold;
  }
  
  .action-btn {
    font-size: $font-size-sm;
    color: $color-accent;
  }
}

.bazi-plate {
  background: $color-bg-secondary;
  border-radius: $border-radius-base;
  padding: 24rpx;
  margin-bottom: 24rpx;
  
  .plate-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8rpx;
    margin-bottom: 8rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .plate-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16rpx 8rpx;
    background: $color-bg-card;
    border-radius: $border-radius-sm;
    
    .cell-tiangan,
    .cell-dizhi {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      color: $color-accent;
    }
    
    .cell-dizhi {
      color: $color-text-primary;
    }
    
    .cell-wuxing {
      font-size: $font-size-xs;
      margin-top: 4rpx;
      
      &.wuxing-金 { color: #FFD700; }
      &.wuxing-木 { color: #4CAF50; }
      &.wuxing-水 { color: #2196F3; }
      &.wuxing-火 { color: #F44336; }
      &.wuxing-土 { color: #8B4513; }
    }
    
    .cell-canggan {
      display: flex;
      gap: 4rpx;
      margin-top: 8rpx;
      
      .canggan-item {
        font-size: $font-size-xs;
        color: $color-text-secondary;
      }
    }
  }
  
  .plate-info {
    display: flex;
    justify-content: space-around;
    margin-top: 16rpx;
    padding-top: 16rpx;
    border-top: 1rpx solid $color-border-light;
    
    .info-item {
      .info-label {
        font-size: $font-size-xs;
        color: $color-text-tertiary;
      }
      
      .info-value {
        font-size: $font-size-sm;
        color: $color-text-primary;
        margin-left: 4rpx;
      }
    }
  }
}

.wuxing-strength {
  .section-title {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin-bottom: 16rpx;
  }
  
  .strength-bars {
    .strength-item {
      margin-bottom: 16rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .strength-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8rpx;
        
        .strength-name {
          font-size: $font-size-sm;
          color: $color-text-primary;
        }
        
        .strength-value {
          font-size: $font-size-sm;
          color: $color-accent;
        }
      }
      
      .strength-bar {
        height: 12rpx;
        background: $color-bg-hover;
        border-radius: 6rpx;
        overflow: hidden;
        
        .strength-fill {
          height: 100%;
          border-radius: 6rpx;
        }
      }
      
      .strength-detail {
        margin-top: 4rpx;
        
        .detail-text {
          font-size: $font-size-xs;
          color: $color-text-tertiary;
        }
      }
    }
  }
}

.dayun-section {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid $color-border-light;
  
  .section-title {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin-bottom: 16rpx;
  }
  
  .dayun-timeline {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 120rpx;
    
    .dayun-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      
      .dayun-year {
        font-size: $font-size-xs;
        color: $color-text-tertiary;
        margin-bottom: 8rpx;
      }
      
      .dayun-bar {
        width: 40rpx;
        height: 80rpx;
        background: $color-bg-hover;
        border-radius: 4rpx;
        display: flex;
        flex-direction: column-reverse;
        overflow: hidden;
        
        .dayun-fill {
          width: 100%;
          
          &.level-1 { background: $level-1; }
          &.level-2 { background: $level-2; }
          &.level-3 { background: $level-3; }
          &.level-4 { background: $level-4; }
          &.level-5 { background: $level-5; }
        }
      }
      
      .dayun-score {
        font-size: $font-size-xs;
        color: $color-text-secondary;
        margin-top: 8rpx;
      }
    }
  }
}

.share-section {
  margin-top: 24rpx;
  
  .btn-share {
    width: 100%;
    height: 80rpx;
    background: $color-bg-hover;
    border: 1rpx solid $color-border;
    border-radius: $border-radius-base;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    
    text {
      font-size: $font-size-sm;
      color: $color-text-primary;
    }
    
    &::after { border: none; }
  }
}
</style>