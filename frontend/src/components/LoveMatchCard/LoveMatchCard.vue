<template>
  <view class="love-match-card">
    <!-- 卡片标题 -->
    <view class="card-header">
      <text class="card-title">姻缘配对</text>
      <LevelBadge :level="matchScore" />
    </view>

    <!-- 双方信息 -->
    <view class="match-parties">
      <!-- 甲方 -->
      <view class="party-item">
        <view class="party-avatar">
          <text class="avatar-icon">👤</text>
        </view>
        <view class="party-info">
          <text class="party-name">{{ maleInfo.name }}</text>
          <text class="party-birth">{{ maleInfo.birth }}</text>
        </view>
        <view class="party-gender">
          <text class="gender-icon">♂</text>
        </view>
      </view>

      <!-- 连接符 -->
      <view class="match-connector">
        <text class="connector-heart">💕</text>
        <view class="connector-line"></view>
      </view>

      <!-- 乙方 -->
      <view class="party-item">
        <view class="party-avatar">
          <text class="avatar-icon">👤</text>
        </view>
        <view class="party-info">
          <text class="party-name">{{ femaleInfo.name }}</text>
          <text class="party-birth">{{ femaleInfo.birth }}</text>
        </view>
        <view class="party-gender">
          <text class="gender-icon">♀</text>
        </view>
      </view>
    </view>

    <!-- 匹配分数 -->
    <view class="match-score-section">
      <view class="score-display">
        <text class="score-value">{{ matchScore }}</text>
        <text class="score-unit">分</text>
      </view>
      <view class="score-label">缘分配对指数</view>
      <view class="score-bar">
        <view class="score-fill" :style="{ width: matchScore + '%' }"></view>
      </view>
    </view>

    <!-- 匹配结果 -->
    <view class="match-result">
      <view class="result-item">
        <text class="result-icon">💑</text>
        <text class="result-label">关系类型</text>
        <text class="result-value">{{ resultType }}</text>
      </view>
      <view class="result-item">
        <text class="result-icon">🎯</text>
        <text class="result-label">相合程度</text>
        <text class="result-value">{{ harmonyLevel }}</text>
      </view>
      <view class="result-item">
        <text class="result-icon">⚡</text>
        <text class="result-label">互动指数</text>
        <text class="result-value">{{ interactionLevel }}</text>
      </view>
    </view>

    <!-- 分析内容 -->
    <view class="analysis-section">
      <view class="section-title">配对分析</view>
      <view class="analysis-content">
        <text>{{ analysisText }}</text>
      </view>
    </view>

    <!-- 建议 -->
    <view class="advice-section">
      <view class="section-title">相处建议</view>
      <view class="advice-list">
        <view 
          v-for="(advice, index) in adviceList" 
          :key="index"
          class="advice-item"
        >
          <text class="advice-number">{{ index + 1 }}</text>
          <text class="advice-text">{{ advice }}</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="card-actions">
      <button class="btn-share" @tap="handleShare">
        <text>📤</text>
        <text>分享结果</text>
      </button>
      <button class="btn-detail" @tap="viewDetail">
        <text>查看详情</text>
      </button>
    </view>
  </view>
</template>

<script>
import LevelBadge from '@/components/LevelBadge/LevelBadge.vue'

export default {
  name: 'LoveMatchCard',
  components: {
    LevelBadge
  },
  
  props: {
    maleInfo: {
      type: Object,
      default: () => ({
        name: '男方',
        birth: '1990-01-01'
      })
    },
    femaleInfo: {
      type: Object,
      default: () => ({
        name: '女方',
        birth: '1992-06-15'
      })
    },
    matchScore: {
      type: Number,
      default: 85
    },
    resultType: {
      type: String,
      default: '上等姻缘'
    },
    harmonyLevel: {
      type: String,
      default: '非常相合'
    },
    interactionLevel: {
      type: String,
      default: '默契十足'
    },
    analysisText: {
      type: String,
      default: '你们在命格上属于相生相助的关系，性格互补，能够相互理解和支持。在感情发展中，两人的缘分指数较高，相处和谐，是理想的伴侣组合。'
    },
    adviceList: {
      type: Array,
      default: () => [
        '多沟通，了解彼此内心想法',
        '相互尊重，给彼此独立空间',
        '遇到分歧时冷静协商'
      ]
    }
  },
  
  methods: {
    handleShare() {
      this.$emit('share')
    },
    
    viewDetail() {
      this.$emit('detail')
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.love-match-card {
  background: $color-bg-card;
  border-radius: $border-radius-lg;
  border: 1rpx solid $color-border;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid $color-border-light;
  
  .card-title {
    font-size: $font-size-lg;
    color: $color-text-primary;
    font-weight: $font-weight-semibold;
  }
}

.match-parties {
  display: flex;
  align-items: center;
  padding: 32rpx 24rpx;
  
  .party-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .party-avatar {
      width: 100rpx;
      height: 100rpx;
      background: $color-bg-hover;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12rpx;
      
      .avatar-icon {
        font-size: 48rpx;
      }
    }
    
    .party-info {
      text-align: center;
      
      .party-name {
        font-size: $font-size-base;
        color: $color-text-primary;
        font-weight: $font-weight-medium;
      }
      
      .party-birth {
        font-size: $font-size-xs;
        color: $color-text-tertiary;
        margin-top: 4rpx;
      }
    }
    
    .party-gender {
      margin-top: 8rpx;
      
      .gender-icon {
        font-size: 32rpx;
        color: $color-accent;
      }
    }
  }
  
  .match-connector {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 16rpx;
    
    .connector-heart {
      font-size: 32rpx;
    }
    
    .connector-line {
      width: 2rpx;
      height: 60rpx;
      background: linear-gradient(180deg, $color-accent, rgba($color-accent, 0.3));
      margin-top: 8rpx;
    }
  }
}

.match-score-section {
  padding: 24rpx;
  text-align: center;
  background: $color-bg-hover;
  
  .score-display {
    display: flex;
    align-items: baseline;
    justify-content: center;
    
    .score-value {
      font-size: 80rpx;
      color: $color-accent;
      font-weight: $font-weight-bold;
    }
    
    .score-unit {
      font-size: $font-size-lg;
      color: $color-text-secondary;
      margin-left: 8rpx;
    }
  }
  
  .score-label {
    font-size: $font-size-sm;
    color: $color-text-tertiary;
    margin-top: 8rpx;
  }
  
  .score-bar {
    height: 8rpx;
    background: $color-bg-card;
    border-radius: 4rpx;
    margin-top: 16rpx;
    overflow: hidden;
    
    .score-fill {
      height: 100%;
      background: linear-gradient(90deg, $color-accent 0%, #FFA500 100%);
      border-radius: 4rpx;
    }
  }
}

.match-result {
  display: flex;
  justify-content: space-around;
  padding: 24rpx;
  
  .result-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .result-icon {
      font-size: 36rpx;
    }
    
    .result-label {
      font-size: $font-size-xs;
      color: $color-text-tertiary;
      margin-top: 8rpx;
    }
    
    .result-value {
      font-size: $font-size-sm;
      color: $color-text-primary;
      font-weight: $font-weight-medium;
      margin-top: 4rpx;
    }
  }
}

.analysis-section,
.advice-section {
  padding: 24rpx;
  border-top: 1rpx solid $color-border-light;
  
  .section-title {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin-bottom: 16rpx;
  }
  
  .analysis-content {
    text {
      font-size: $font-size-sm;
      color: $color-text-secondary;
      line-height: 1.8;
    }
  }
}

.advice-section {
  .advice-list {
    .advice-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .advice-number {
        width: 40rpx;
        height: 40rpx;
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
      
      .advice-text {
        flex: 1;
        font-size: $font-size-sm;
        color: $color-text-secondary;
        line-height: 1.6;
      }
    }
  }
}

.card-actions {
  display: flex;
  gap: 24rpx;
  padding: 24rpx;
  border-top: 1rpx solid $color-border-light;
  
  button {
    flex: 1;
    height: 80rpx;
    border-radius: $border-radius-base;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    font-size: $font-size-sm;
    
    &::after { border: none; }
    
    text {
      font-weight: $font-weight-medium;
    }
  }
  
  .btn-share {
    background: $color-bg-hover;
    border: 1rpx solid $color-border;
    
    text {
      color: $color-text-primary;
    }
  }
  
  .btn-detail {
    background: linear-gradient(135deg, $color-accent 0%, #FFA500 100%);
    
    text {
      color: #000;
    }
  }
}
</style>