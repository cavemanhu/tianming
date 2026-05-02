<template>
  <view class="wuxing-chart">
    <view class="chart-header" v-if="title">
      <text class="chart-title">{{ title }}</text>
    </view>

    <view class="chart-content">
      <view class="bar-container">
        <view 
          v-for="(item, index) in displayData" 
          :key="index"
          class="wuxing-bar"
          :style="{ 
            width: item.percent + '%',
            background: item.color,
            animationDelay: index * 100 + 'ms'
          }"
        >
          <text class="wuxing-name" v-if="item.percent >= 15">{{ item.name }}</text>
        </view>
      </view>
    </view>

    <view class="chart-legend" v-if="showLegend">
      <view 
        v-for="(item, index) in displayData" 
        :key="index" 
        class="legend-item"
      >
        <view class="legend-dot" :style="{ background: item.color }"></view>
        <text class="legend-name">{{ item.name }}</text>
        <text class="legend-percent">{{ item.percent }}%</text>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * WuxingChart - 五行分布图
 * @description 展示五行分布的条形图组件
 */
export default {
  name: 'WuxingChart',
  props: {
    // 标题
    title: {
      type: String,
      default: '五行分布'
    },
    // 五行数据 [{ name: '金', percent: 20, color: '#FFD700' }, ...]
    data: {
      type: Array,
      required: true,
      validator: (v) => v && v.length === 5
    },
    // 是否显示图例
    showLegend: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    displayData() {
      // 按照金木水火土顺序排列
      const order = ['金', '木', '水', '火', '土']
      const colorMap = {
        '金': '#FFD700',
        '木': '#4CAF50',
        '水': '#2196F3',
        '火': '#F44336',
        '土': '#8B4513'
      }
      
      return order.map(name => {
        const item = this.data.find(d => d.name === name)
        return {
          name,
          percent: item ? item.percent : 0,
          color: item ? item.color : colorMap[name]
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.wuxing-chart {
  .chart-header {
    margin-bottom: $spacing-md;

    .chart-title {
      font-size: $font-size-base;
      color: $color-text-primary;
      font-weight: $font-weight-medium;
    }
  }

  .chart-content {
    .bar-container {
      display: flex;
      height: 48rpx;
      border-radius: $border-radius-full;
      overflow: hidden;
      background: $color-bg-secondary;

      .wuxing-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 48rpx;
        transition: width 0.5s $ease-out;
        animation: growBar 0.8s $ease-out both;

        .wuxing-name {
          font-size: $font-size-xs;
          color: #000;
          font-weight: $font-weight-bold;
        }
      }
    }
  }

  .chart-legend {
    display: flex;
    justify-content: space-around;
    margin-top: $spacing-lg;
    padding: $spacing-sm 0;

    .legend-item {
      display: flex;
      align-items: center;
      gap: $spacing-xs;

      .legend-dot {
        width: 16rpx;
        height: 16rpx;
        border-radius: 50%;
      }

      .legend-name {
        font-size: $font-size-sm;
        color: $color-text-secondary;
      }

      .legend-percent {
        font-size: $font-size-sm;
        color: $color-text-primary;
        font-weight: $font-weight-medium;
      }
    }
  }
}

@keyframes growBar {
  from {
    width: 0;
  }
}
</style>