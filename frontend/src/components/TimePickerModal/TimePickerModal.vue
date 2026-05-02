<template>
  <view class="time-picker-modal">
    <!-- 遮罩层 -->
    <view class="mask" @tap="handleCancel"></view>
    
    <!-- 弹窗内容 -->
    <view class="modal-content">
      <!-- 标题 -->
      <view class="modal-header">
        <text class="header-title">选择出生时辰</text>
        <text class="header-subtitle">每个时辰=2小时</text>
      </view>
      
      <!-- 时辰选择 -->
      <view class="time-grid">
        <view 
          v-for="(item, index) in timeOptions" 
          :key="index"
          class="time-item"
          :class="{ active: selectedTime === item.value }"
          @tap="selectTime(item)"
        >
          <text class="time-name">{{ item.label }}</text>
          <text class="time-range">{{ item.range }}</text>
        </view>
      </view>
      
      <!-- 确认按钮 -->
      <view class="modal-footer">
        <button class="btn-confirm" @tap="handleConfirm">确定</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TimePickerModal',
  
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  
  data() {
    return {
      selectedTime: '',
      
      timeOptions: [
        { label: '子时', value: '子时', range: '23:00-01:00', hour: 23 },
        { label: '丑时', value: '丑时', range: '01:00-03:00', hour: 1 },
        { label: '寅时', value: '寅时', range: '03:00-05:00', hour: 3 },
        { label: '卯时', value: '卯时', range: '05:00-07:00', hour: 5 },
        { label: '辰时', value: '辰时', range: '07:00-09:00', hour: 7 },
        { label: '巳时', value: '巳时', range: '09:00-11:00', hour: 9 },
        { label: '午时', value: '午时', range: '11:00-13:00', hour: 11 },
        { label: '未时', value: '未时', range: '13:00-15:00', hour: 13 },
        { label: '申时', value: '申时', range: '15:00-17:00', hour: 15 },
        { label: '酉时', value: '酉时', range: '17:00-19:00', hour: 17 },
        { label: '戌时', value: '戌时', range: '19:00-21:00', hour: 19 },
        { label: '亥时', value: '亥时', range: '21:00-23:00', hour: 21 }
      ]
    }
  },
  
  created() {
    if (this.value) {
      this.selectedTime = this.value
    }
  },
  
  methods: {
    selectTime(item) {
      this.selectedTime = item.value
    },
    
    handleConfirm() {
      if (!this.selectedTime) {
        uni.showToast({ title: '请选择时辰', icon: 'none' })
        return
      }
      this.$emit('confirm', this.selectedTime)
    },
    
    handleCancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.time-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  
  .mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
  }
  
  .modal-content {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: $color-bg-secondary;
    border-radius: 32rpx 32rpx 0 0;
    animation: slideUp 0.3s ease;
  }
  
  .modal-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32rpx;
    border-bottom: 1rpx solid $color-border-light;
    
    .header-title {
      font-size: $font-size-lg;
      color: $color-text-primary;
      font-weight: $font-weight-semibold;
    }
    
    .header-subtitle {
      font-size: $font-size-xs;
      color: $color-text-tertiary;
      margin-top: 8rpx;
    }
  }
  
  .time-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16rpx;
    padding: 32rpx;
    max-height: 600rpx;
    overflow-y: auto;
    
    .time-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24rpx 16rpx;
      background: $color-bg-card;
      border-radius: $border-radius-base;
      border: 1rpx solid $color-border;
      
      .time-name {
        font-size: $font-size-base;
        color: $color-text-primary;
        font-weight: $font-weight-medium;
      }
      
      .time-range {
        font-size: $font-size-xs;
        color: $color-text-tertiary;
        margin-top: 4rpx;
      }
      
      &.active {
        border-color: $color-accent;
        background: rgba($color-accent, 0.1);
        
        .time-name {
          color: $color-accent;
        }
      }
    }
  }
  
  .modal-footer {
    padding: 24rpx 32rpx 60rpx;
    
    .btn-confirm {
      width: 100%;
      height: 88rpx;
      background: linear-gradient(135deg, $color-accent 0%, #FFA500 100%);
      border-radius: 44rpx;
      font-size: $font-size-base;
      color: #000;
      font-weight: $font-weight-semibold;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &::after { border: none; }
    }
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>