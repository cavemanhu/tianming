<template>
  <view class="level-badge" :class="'level-' + level">
    <slot>
      <text class="badge-text">{{ displayName }}</text>
    </slot>
  </view>
</template>

<script>
/**
 * LevelBadge - 命格等级徽章
 * @description 展示命格等级的徽章组件
 */
export default {
  name: 'LevelBadge',
  props: {
    // 等级 (1-5)
    level: {
      type: Number,
      required: true,
      validator: (v) => v >= 1 && v <= 5
    },
    // 显示名称
    name: {
      type: String,
      default: ''
    }
  },
  computed: {
    displayName() {
      if (this.name) return this.name
      const names = ['', '大吉', '吉', '中', '平', '凶']
      return names[this.level] || ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.level-badge {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 16rpx;
  border-radius: $border-radius-full;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;

  .badge-text {
    line-height: 1.2;
  }

  // 大吉 - 金色
  &.level-1 {
    background: rgba($wuxing-jin, 0.15);
    color: $level-1;
    border: 1rpx solid rgba($wuxing-jin, 0.3);
  }

  // 吉 - 浅绿
  &.level-2 {
    background: rgba($level-2, 0.15);
    color: $level-2;
    border: 1rpx solid rgba($level-2, 0.3);
  }

  // 中 - 天蓝
  &.level-3 {
    background: rgba($level-3, 0.15);
    color: $level-3;
    border: 1rpx solid rgba($level-3, 0.3);
  }

  // 平 - 浅灰
  &.level-4 {
    background: rgba($level-4, 0.15);
    color: $level-4;
    border: 1rpx solid rgba($level-4, 0.3);
  }

  // 凶 - 深红
  &.level-5 {
    background: rgba($level-5, 0.15);
    color: $level-5;
    border: 1rpx solid rgba($level-5, 0.3);
  }
}
</style>