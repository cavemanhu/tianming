<template>
  <view class="loading-spinner">
    <view class="spinner-circle" :class="size"></view>
    <text class="loading-text" v-if="text">{{ text }}</text>
    <slot v-else></slot>
  </view>
</template>

<script>
/**
 * LoadingSpinner - 加载动画
 * @description 命盘加载动画组件
 */
export default {
  name: 'LoadingSpinner',
  props: {
    // 尺寸: small / medium / large
    size: {
      type: String,
      default: 'medium',
      validator: (v) => ['small', 'medium', 'large'].includes(v)
    },
    // 显示文字
    text: {
      type: String,
      default: '命盘中...'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-md;

  .spinner-circle {
    border-radius: 50%;
    border-style: solid;
    border-color: rgba($color-accent, 0.2);
    border-top-color: $color-accent;
    animation: spin 1s linear infinite;

    &.small {
      width: 48rpx;
      height: 48rpx;
      border-width: 3rpx;
    }

    &.medium {
      width: 80rpx;
      height: 80rpx;
      border-width: 4rpx;
    }

    &.large {
      width: 120rpx;
      height: 120rpx;
      border-width: 6rpx;
    }
  }

  .loading-text {
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>