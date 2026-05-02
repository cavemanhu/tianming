<template>
  <view class="datetime-picker">
    <!-- 遮罩层 -->
    <view class="mask" @tap="handleCancel"></view>
    
    <!-- 选择器弹窗 -->
    <view class="picker-popup">
      <!-- 标题栏 -->
      <view class="picker-header">
        <text class="btn-cancel" @tap="handleCancel">取消</text>
        <text class="picker-title">{{ title }}</text>
        <text class="btn-confirm" @tap="handleConfirm">确定</text>
      </view>
      
      <!-- 年月日选择器 -->
      <view class="picker-body" v-if="mode === 'date'">
        <picker-view 
          :value="dateValue" 
          @change="onDateChange"
          class="picker-view"
        >
          <picker-view-column>
            <view class="picker-item" v-for="(year, index) in years" :key="index">
              {{ year }}年
            </view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(month, index) in months" :key="index">
              {{ month }}月
            </view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(day, index) in days" :key="index">
              {{ day }}日
            </view>
          </picker-view-column>
        </picker-view>
      </view>
      
      <!-- 时间选择器 -->
      <view class="picker-body" v-else-if="mode === 'time'">
        <picker-view 
          :value="timeValue" 
          @change="onTimeChange"
          class="picker-view"
        >
          <picker-view-column>
            <view class="picker-item" v-for="(hour, index) in hours" :key="index">
              {{ hour }}
            </view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item">:</view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(minute, index) in minutes" :key="index">
              {{ minute }}
            </view>
          </picker-view-column>
        </picker-view>
      </view>
      
      <!-- 日期时间选择器 -->
      <view class="picker-body" v-else-if="mode === 'datetime'">
        <picker-view 
          :value="datetimeValue" 
          @change="onDatetimeChange"
          class="picker-view"
        >
          <picker-view-column>
            <view class="picker-item" v-for="(year, index) in years" :key="index">
              {{ year }}
            </view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(month, index) in months" :key="index">
              {{ month }}
            </view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(day, index) in days" :key="index">
              {{ day }}
            </view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(hour, index) in hours" :key="index">
              {{ hour }}
            </view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item">:</view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(minute, index) in minutes" :key="index">
              {{ minute }}
            </view>
          </picker-view-column>
        </picker-view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'DateTimePicker',
  
  props: {
    mode: {
      type: String,
      default: 'date' // 'date' | 'time' | 'datetime'
    },
    value: {
      type: String,
      default: ''
    },
    startDate: {
      type: String,
      default: '1900-01-01'
    },
    endDate: {
      type: String,
      default: '2100-12-31'
    }
  },
  
  data() {
    return {
      title: '选择日期',
      years: [],
      months: [],
      days: [],
      hours: [],
      minutes: [],
      
      dateValue: [0, 0, 0],
      timeValue: [0, 0],
      datetimeValue: [0, 0, 0, 0, 0],
      
      currentYear: 2000,
      currentMonth: 0,
      currentDay: 1,
      currentHour: 0,
      currentMinute: 0
    }
  },
  
  created() {
    this.initPickerData()
  },
  
  methods: {
    initPickerData() {
      // 生成年份列表
      const startYear = parseInt(this.startDate.split('-')[0])
      const endYear = parseInt(this.endDate.split('-')[0])
      this.years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
      
      // 月份列表
      this.months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
      
      // 日期列表 (根据年月动态生成)
      this.updateDaysInMonth(this.currentYear, this.currentMonth)
      
      // 小时列表
      this.hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
      
      // 分钟列表
      this.minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))
      
      // 从已有值解析
      if (this.value) {
        this.parseValue(this.value)
      } else {
        // 默认值: 今天
        const today = new Date()
        this.currentYear = today.getFullYear()
        this.currentMonth = today.getMonth()
        this.currentDay = today.getDate() - 1
      }
    },
    
    parseValue(value) {
      if (this.mode === 'date' && value) {
        const parts = value.split('-')
        if (parts.length === 3) {
          this.currentYear = parseInt(parts[0])
          this.currentMonth = parseInt(parts[1]) - 1
          this.currentDay = parseInt(parts[2]) - 1
        }
      }
    },
    
    updateDaysInMonth(year, month) {
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      this.days = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, '0'))
    },
    
    onDateChange(e) {
      const values = e.detail.value
      this.currentYear = this.years[values[0]]
      this.currentMonth = values[1]
      
      // 更新日期天数
      const year = this.years[values[0]]
      this.updateDaysInMonth(year, values[1])
      
      // 确保日期索引有效
      if (values[2] >= this.days.length) {
        values[2] = this.days.length - 1
      }
      
      this.dateValue = values
    },
    
    onTimeChange(e) {
      const values = e.detail.value
      this.currentHour = parseInt(this.hours[values[0]])
      this.currentMinute = parseInt(this.minutes[values[2]])
      this.timeValue = values
    },
    
    onDatetimeChange(e) {
      const values = e.detail.value
      this.currentYear = this.years[values[0]]
      this.currentMonth = values[1]
      this.currentDay = values[2]
      this.currentHour = parseInt(this.hours[values[3]])
      this.currentMinute = parseInt(this.minutes[values[5]])
      this.datetimeValue = values
    },
    
    handleConfirm() {
      let result = ''
      
      if (this.mode === 'date') {
        result = `${this.currentYear}-${(this.currentMonth + 1).toString().padStart(2, '0')}-${(this.dateValue[2] + 1).toString().padStart(2, '0')}`
      } else if (this.mode === 'time') {
        result = `${this.hours[this.timeValue[0]]}:${this.minutes[this.timeValue[2]]}`
      } else if (this.mode === 'datetime') {
        result = `${this.currentYear}-${(this.currentMonth + 1).toString().padStart(2, '0')}-${(this.currentDay + 1).toString().padStart(2, '0')} ${this.hours[this.datetimeValue[3]]}:${this.minutes[this.datetimeValue[5]]}`
      }
      
      this.$emit('confirm', result)
    },
    
    handleCancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.datetime-picker {
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
  
  .picker-popup {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: $color-bg-secondary;
    border-radius: 32rpx 32rpx 0 0;
    animation: slideUp 0.3s ease;
  }
  
  .picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx;
    border-bottom: 1rpx solid $color-border-light;
    
    .btn-cancel,
    .btn-confirm {
      font-size: $font-size-base;
      padding: 8rpx 16rpx;
    }
    
    .btn-cancel {
      color: $color-text-tertiary;
    }
    
    .btn-confirm {
      color: $color-accent;
      font-weight: $font-weight-medium;
    }
    
    .picker-title {
      font-size: $font-size-base;
      color: $color-text-primary;
      font-weight: $font-weight-medium;
    }
  }
  
  .picker-body {
    padding: 24rpx 0;
    
    .picker-view {
      height: 400rpx;
      
      .picker-item {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: $font-size-lg;
        color: $color-text-primary;
      }
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