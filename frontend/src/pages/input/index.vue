<template>
  <view class="input-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text>←</text>
      </view>
      <text class="nav-title">{{ pageTitle }}</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 表单内容 -->
    <view class="form-content">
      <!-- 算命类型选择 -->
      <view class="section">
        <view class="section-title">
          <text>选择测算类型</text>
        </view>
        <view class="type-grid">
          <view 
            v-for="(type, index) in fortuneTypes" 
            :key="type.value"
            class="type-item"
            :class="{ active: selectedType === type.value }"
            @tap="selectType(type.value)"
          >
            <text class="type-icon">{{ type.icon }}</text>
            <text class="type-name">{{ type.label }}</text>
          </view>
        </view>
      </view>

      <!-- 出生日期时间 -->
      <view class="section">
        <view class="section-title">
          <text>出生信息</text>
        </view>
        
        <!-- 出生日期 -->
        <view class="input-row" @tap="showDatePicker">
          <view class="input-label">
            <text class="label-icon">📅</text>
            <text>出生日期</text>
          </view>
          <view class="input-value">
            <text v-if="birthDate">{{ birthDate }}</text>
            <text v-else class="placeholder">请选择日期</text>
            <text class="arrow">→</text>
          </view>
        </view>

        <!-- 出生时辰 -->
        <view class="input-row" @tap="showTimePicker">
          <view class="input-label">
            <text class="label-icon">🕐</text>
            <text>出生时辰</text>
          </view>
          <view class="input-value">
            <text v-if="birthTime">{{ birthTime }}</text>
            <text v-else class="placeholder">请选择时辰</text>
            <text class="arrow">→</text>
          </view>
        </view>

        <!-- 性别选择 -->
        <view class="input-row gender-row">
          <view class="input-label">
            <text class="label-icon">⚧</text>
            <text>性别</text>
          </view>
          <view class="gender-selector">
            <view 
              class="gender-option"
              :class="{ active: gender === 'male' }"
              @tap="selectGender('male')"
            >
              <text>男</text>
            </view>
            <view 
              class="gender-option"
              :class="{ active: gender === 'female' }"
              @tap="selectGender('female')"
            >
              <text>女</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 八字排盘展示 -->
      <view class="section bazi-section" v-if="showBazi">
        <view class="section-title">
          <text>八字排盘</text>
        </view>
        <BaziDisplay :bazi="baziData" />
      </view>

      <!-- 姻缘配对入口 -->
      <view class="section" v-if="selectedType === 'love'">
        <view class="section-title">
          <text>配对信息</text>
        </view>
        
        <view class="input-row" @tap="showPartnerPicker">
          <view class="input-label">
            <text class="label-icon">💕</text>
            <text>对方生日</text>
          </view>
          <view class="input-value">
            <text v-if="partnerBirthDate">{{ partnerBirthDate }}</text>
            <text v-else class="placeholder">请选择对方生日</text>
            <text class="arrow">→</text>
          </view>
        </view>

        <view class="input-row" @tap="showPartnerTimePicker">
          <view class="input-label">
            <text class="label-icon">🕐</text>
            <text>对方时辰</text>
          </view>
          <view class="input-value">
            <text v-if="partnerBirthTime">{{ partnerBirthTime }}</text>
            <text v-else class="placeholder">请选择时辰</text>
            <text class="arrow">→</text>
          </view>
        </view>
      </view>

      <!-- 开始测算按钮 -->
      <view class="action-section">
        <button 
          class="btn-predict"
          :class="{ disabled: !canPredict }"
          @tap="startPredict"
        >
          <text v-if="isLoading">
            <LoadingSpinner text="排盘中..." size="small" />
          </text>
          <text v-else>开始测算</text>
        </button>
      </view>
    </view>

    <!-- 日期选择器弹窗 -->
    <DateTimePicker
      v-if="showDatePickerModal"
      mode="date"
      :value="birthDate"
      @confirm="onDateConfirm"
      @cancel="hideDatePicker"
    />

    <!-- 时辰选择器弹窗 -->
    <TimePickerModal
      v-if="showTimePickerModal"
      :value="birthTime"
      @confirm="onTimeConfirm"
      @cancel="hideTimePicker"
    />
  </view>
</template>

<script>
import BaziDisplay from '@/components/BaziDisplay/BaziDisplay.vue'
import DateTimePicker from '@/components/DateTimePicker/DateTimePicker.vue'
import TimePickerModal from '@/components/TimePickerModal/TimePickerModal.vue'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.vue'

export default {
  components: {
    BaziDisplay,
    DateTimePicker,
    TimePickerModal,
    LoadingSpinner
  },
  
  data() {
    return {
      // 页面配置
      pageTitle: '信息录入',
      
      // 算命类型
      fortuneTypes: [
        { value: 'year', label: '年运', icon: '📅' },
        { value: 'month', label: '月运', icon: '🌙' },
        { value: 'love', label: '姻缘', icon: '💕' },
        { value: 'career', label: '事业', icon: '💼' }
      ],
      selectedType: 'year',
      
      // 出生信息
      birthDate: '',
      birthTime: '',
      gender: '',
      
      // 姻缘配对信息
      partnerBirthDate: '',
      partnerBirthTime: '',
      
      // 弹窗状态
      showDatePickerModal: false,
      showTimePickerModal: false,
      showPartnerDatePickerModal: false,
      showPartnerTimePickerModal: false,
      
      // 加载状态
      isLoading: false,
      
      // 八字数据 (模拟)
      baziData: {
        year: { tiangan: '甲', dizhi: '子', wuxing: '木水' },
        month: { tiangan: '丙', dizhi: '寅', wuxing: '火木' },
        day: { tiangan: '戊', dizhi: '午', wuxing: '土火' },
        time: { tiangan: '庚', dizhi: '申', wuxing: '金金' }
      }
    }
  },
  
  computed: {
    showBazi() {
      return this.birthDate && this.birthTime && this.gender
    },
    
    canPredict() {
      if (!this.birthDate || !this.birthTime || !this.gender) return false
      
      if (this.selectedType === 'love') {
        return !!(this.partnerBirthDate && this.partnerBirthTime)
      }
      
      return true
    }
  },
  
  onLoad(options) {
    if (options.type) {
      this.selectedType = options.type
      this.updatePageTitle()
    }
  },
  
  methods: {
    updatePageTitle() {
      const titles = {
        year: '年运测算',
        month: '月运测算',
        love: '姻缘配对',
        career: '事业测算'
      }
      this.pageTitle = titles[this.selectedType] || '信息录入'
    },
    
    selectType(type) {
      this.selectedType = type
      this.updatePageTitle()
    },
    
    selectGender(gender) {
      this.gender = gender
    },
    
    showDatePicker() {
      this.showDatePickerModal = true
    },
    
    hideDatePicker() {
      this.showDatePickerModal = false
    },
    
    onDateConfirm(date) {
      this.birthDate = date
      this.showDatePickerModal = false
    },
    
    showTimePicker() {
      this.showTimePickerModal = true
    },
    
    hideTimePicker() {
      this.showTimePickerModal = false
    },
    
    onTimeConfirm(time) {
      this.birthTime = time
      this.showTimePickerModal = false
    },
    
    showPartnerPicker() {
      this.showPartnerDatePickerModal = true
    },
    
    showPartnerTimePicker() {
      this.showPartnerTimePickerModal = true
    },
    
    goBack() {
      uni.navigateBack()
    },
    
    async startPredict() {
      if (!this.canPredict) return
      
      this.isLoading = true
      
      try {
        // TODO: 调用后端API
        // const res = await predictApi({
        //   type: this.selectedType,
        //   birthDate: this.birthDate,
        //   birthTime: this.birthTime,
        //   gender: this.gender,
        //   partnerBirthDate: this.partnerBirthDate,
        //   partnerBirthTime: this.partnerBirthTime
        // })
        
        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        uni.navigateTo({
          url: `/pages/fortune/index?type=${this.selectedType}&mode=predict`
        })
      } catch (e) {
        uni.showToast({ title: '测算失败', icon: 'none' })
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.input-page {
  min-height: 100vh;
  background: $color-bg-primary;
  padding-bottom: 120rpx;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 80rpx $page-padding-h 32rpx;
  
  .nav-back,
  .nav-placeholder {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    color: $color-text-primary;
  }
  
  .nav-title {
    font-size: $font-size-lg;
    color: $color-text-primary;
    font-weight: $font-weight-semibold;
  }
}

.form-content {
  padding: 0 $page-padding-h;
}

.section {
  margin-bottom: 40rpx;
  
  .section-title {
    font-size: $font-size-base;
    color: $color-text-secondary;
    margin-bottom: 20rpx;
    
    text {
      &::before {
        content: '';
        display: inline-block;
        width: 6rpx;
        height: 24rpx;
        background: $color-accent;
        margin-right: 12rpx;
        border-radius: 3rpx;
        vertical-align: middle;
      }
    }
  }
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  
  .type-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24rpx 16rpx;
    background: $color-bg-card;
    border-radius: $border-radius-base;
    border: 1rpx solid $color-border;
    transition: all 0.2s ease;
    
    .type-icon {
      font-size: 48rpx;
      margin-bottom: 12rpx;
    }
    
    .type-name {
      font-size: $font-size-sm;
      color: $color-text-secondary;
    }
    
    &.active {
      border-color: $color-accent;
      background: rgba($color-accent, 0.1);
      
      .type-name {
        color: $color-accent;
      }
    }
  }
}

.input-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;
  background: $color-bg-card;
  border-radius: $border-radius-base;
  margin-bottom: 16rpx;
  
  .input-label {
    display: flex;
    align-items: center;
    gap: 16rpx;
    
    .label-icon {
      font-size: 36rpx;
    }
    
    text {
      font-size: $font-size-base;
      color: $color-text-primary;
    }
  }
  
  .input-value {
    display: flex;
    align-items: center;
    gap: 8rpx;
    
    text {
      font-size: $font-size-base;
      color: $color-text-secondary;
      
      &.placeholder {
        color: $color-text-tertiary;
      }
    }
    
    .arrow {
      color: $color-text-tertiary;
    }
  }
  
  &.gender-row {
    .gender-selector {
      display: flex;
      gap: 16rpx;
      
      .gender-option {
        padding: 16rpx 40rpx;
        background: $color-bg-hover;
        border-radius: $border-radius-sm;
        border: 1rpx solid transparent;
        
        text {
          font-size: $font-size-base;
          color: $color-text-secondary;
        }
        
        &.active {
          border-color: $color-accent;
          background: rgba($color-accent, 0.1);
          
          text {
            color: $color-accent;
          }
        }
      }
    }
  }
}

.bazi-section {
  margin-top: 32rpx;
}

.action-section {
  margin-top: 48rpx;
  padding-bottom: 48rpx;
  
  .btn-predict {
    width: 100%;
    height: 96rpx;
    background: linear-gradient(135deg, $color-accent 0%, #FFA500 100%);
    border-radius: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $font-size-base;
    color: #000;
    font-weight: $font-weight-semibold;
    box-shadow: 0 8rpx 32rpx rgba($color-accent, 0.3);
    
    &.disabled {
      background: $color-bg-hover;
      color: $color-text-tertiary;
      box-shadow: none;
    }
    
    &::after { border: none; }
  }
}
</style>