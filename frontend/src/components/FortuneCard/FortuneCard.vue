<template>
  <view class="fortune-card" :class="{ 'has-shadow': shadow }">
    <!-- 头部 -->
    <view class="card-header" v-if="title || $slots.header">
      <slot name="header">
        <text class="title" v-if="title">{{ title }}</text>
        <LevelBadge v-if="level" :level="level" />
      </slot>
    </view>

    <!-- 内容区 -->
    <view class="card-body">
      <slot>
        <!-- 默认内容 -->
        <view class="main-score" v-if="score !== undefined">
          <text class="score">{{ score }}</text>
          <text class="unit">分</text>
        </view>
        <view class="sub-info" v-if="levelName">
          <text class="label">命格等级</text>
          <text class="value">{{ levelName }}</text>
        </view>
      </slot>
    </view>

    <!-- 底部 -->
    <view class="card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </view>

    <!-- 装饰角标 -->
    <view class="card-corner corner-tl" v-if="decorative"></view>
    <view class="card-corner corner-br" v-if="decorative"></view>
  </view>
</template>

<script>
/**
 * FortuneCard - 算命结果卡片
 * @description 展示算命结果的核心卡片组件
 */
export default {
  name: 'FortuneCard',
  props: {
    // 卡片标题
    title: {
      type: String,
      default: ''
    },
    // 分数 (0-100)
    score: {
      type: Number,
      default: undefined
    },
    // 命格等级 (1-5)
    level: {
      type: Number,
      default: undefined,
      validator: (v) => v === undefined || (v >= 1 && v <= 5)
    },
    // 等级名称
    levelName: {
      type: String,
      default: ''
    },
    // 是否显示阴影
    shadow: {
      type: Boolean,
      default: true
    },
    // 是否显示装饰角标
    decorative: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.fortune-card {
  position: relative;
  background: $color-bg-card;
  border-radius: $card-radius;
  padding: $card-padding;
  border: 1rpx solid $color-border;
  overflow: hidden;

  &.has-shadow {
    box-shadow: $shadow-base;
  }

  // 装饰角标
  .card-corner {
    position: absolute;
    width: 60rpx;
    height: 60rpx;
    opacity: 0.3;

    &.corner-tl {
      top: 0;
      left: 0;
      background: linear-gradient(135deg, $color-accent 0%, transparent 100%);
    }

    &.corner-br {
      bottom: 0;
      right: 0;
      background: linear-gradient(315deg, $color-accent 0%, transparent 100%);
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;

    .title {
      font-size: $font-size-lg;
      color: $color-text-primary;
      font-weight: $font-weight-semibold;
    }
  }

  .card-body {
    .main-score {
      display: flex;
      align-items: baseline;
      margin-bottom: $spacing-sm;

      .score {
        font-size: $font-size-giant;
        color: $color-accent;
        font-weight: $font-weight-bold;
        line-height: 1;
      }

      .unit {
        font-size: $font-size-lg;
        color: $color-text-secondary;
        margin-left: $spacing-xs;
      }
    }

    .sub-info {
      display: flex;
      align-items: center;
      gap: $spacing-sm;

      .label {
        font-size: $font-size-sm;
        color: $color-text-tertiary;
      }

      .value {
        font-size: $font-size-base;
        color: $color-text-primary;
      }
    }
  }

  .card-footer {
    margin-top: $spacing-md;
    padding-top: $spacing-md;
    border-top: 1rpx solid $color-border-light;
  }
}
</style>