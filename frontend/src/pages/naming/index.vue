<template>
  <view class="naming-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text>←</text>
      </view>
      <text class="nav-title">智能取名</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 表单区域 -->
    <view class="form-section" v-if="!showResults">
      <!-- 姓氏输入 -->
      <view class="input-group">
        <text class="input-label">姓氏</text>
        <input 
          class="input-field" 
          v-model="surname" 
          placeholder="请输入姓氏，如：李、王、张"
          maxlength="2"
        />
      </view>

      <!-- 出生日期 -->
      <view class="input-row" @tap="showDatePicker">
        <view class="input-label-row">
          <text class="label-icon">📅</text>
          <text>出生日期</text>
        </view>
        <view class="input-value-row">
          <text v-if="birthDate">{{ birthDate }}</text>
          <text v-else class="placeholder">请选择日期</text>
          <text class="arrow">→</text>
        </view>
      </view>

      <!-- 出生时辰 -->
      <view class="input-row" @tap="showTimePicker">
        <view class="input-label-row">
          <text class="label-icon">🕐</text>
          <text>出生时辰</text>
        </view>
        <view class="input-value-row">
          <text v-if="birthTime">{{ birthTime }}</text>
          <text v-else class="placeholder">请选择时辰</text>
          <text class="arrow">→</text>
        </view>
      </view>

      <!-- 性别选择 -->
      <view class="gender-section">
        <text class="input-label">性别</text>
        <view class="gender-selector">
          <view 
            class="gender-option"
            :class="{ active: gender === 'male' }"
            @tap="selectGender('male')"
          >
            <text class="gender-icon">👨</text>
            <text class="gender-text">男</text>
          </view>
          <view 
            class="gender-option"
            :class="{ active: gender === 'female' }"
            @tap="selectGender('female')"
          >
            <text class="gender-icon">👩</text>
            <text class="gender-text">女</text>
          </view>
        </view>
      </view>

      <!-- 名字风格 -->
      <view class="style-section">
        <text class="input-label">名字风格</text>
        <view class="style-selector">
          <view 
            v-for="style in nameStyles" 
            :key="style.value"
            class="style-option"
            :class="{ active: selectedStyle === style.value }"
            @tap="selectStyle(style.value)"
          >
            <text>{{ style.label }}</text>
          </view>
        </view>
      </view>

      <!-- 八字信息预览 -->
      <view class="bazi-preview" v-if="baziInfo">
        <view class="bazi-header">
          <text class="bazi-title">八字命盘</text>
        </view>
        <view class="bazi-grid">
          <view class="bazi-item">
            <text class="bazi-label">年柱</text>
            <text class="bazi-value">{{ baziInfo.nianZhu }}</text>
          </view>
          <view class="bazi-item">
            <text class="bazi-label">日柱</text>
            <text class="bazi-value">{{ baziInfo.riZhu }}</text>
          </view>
        </view>
        <view class="wuxing-info">
          <view class="wuxing-item">
            <text class="wuxing-label">喜用神</text>
            <text class="wuxing-value wuxing-xi">{{ baziInfo.xiYong }}</text>
          </view>
          <view class="wuxing-item">
            <text class="wuxing-label">生肖</text>
            <text class="wuxing-value">{{ baziInfo.zodiac }}</text>
          </view>
        </view>
      </view>

      <!-- 开始取名按钮 -->
      <button 
        class="btn-generate"
        :class="{ disabled: !canGenerate }"
        @tap="startNaming"
      >
        <text v-if="isLoading">
          <LoadingSpinner text="生成中..." size="small" />
        </text>
        <text v-else>生成名字</text>
      </button>
    </view>

    <!-- 结果展示区域 -->
    <view class="results-section" v-else>
      <!-- 八字信息卡片 -->
      <view class="bazi-card">
        <view class="bazi-card-header">
          <text class="card-title">命盘分析</text>
        </view>
        <view class="bazi-card-content">
          <view class="bazi-row">
            <text class="bazi-row-label">年柱</text>
            <text class="bazi-row-value">{{ baziInfo.nianZhu }}</text>
          </view>
          <view class="bazi-row">
            <text class="bazi-row-label">日柱</text>
            <text class="bazi-row-value">{{ baziInfo.riZhu }}</text>
          </view>
          <view class="bazi-row">
            <text class="bazi-row-label">喜用神</text>
            <text class="bazi-row-value highlight">{{ baziInfo.xiYong }}</text>
          </view>
          <view class="bazi-row">
            <text class="bazi-row-label">推荐五行</text>
            <text class="bazi-row-value wuxing-{{ baziInfo.recommendWuXing }}">{{ baziInfo.recommendWuXing }}行</text>
          </view>
        </view>
      </view>

      <!-- 名字列表 -->
      <view class="names-list">
        <view class="names-header">
          <text class="names-title">推荐名字</text>
          <text class="names-count">共{{ nameList.length }}个</text>
        </view>
        
        <view 
          class="name-item"
          v-for="(name, index) in nameList"
          :key="index"
          @tap="showNameDetail(name)"
        >
          <view class="name-rank rank-{{ index + 1 }}">
            <text>{{ index + 1 }}</text>
          </view>
          <view class="name-content">
            <view class="name-main">
              <text class="name-text">{{ surname }}{{ name.name }}</text>
              <view class="name-score">
                <text class="score-value">{{ name.score }}</text>
                <text class="score-label">分</text>
              </view>
            </view>
            <text class="name-analysis">{{ name.analysis }}</text>
          </view>
        </view>
      </view>

      <!-- 重新生成按钮 -->
      <button class="btn-regenerate" @tap="resetForm">
        <text>重新生成</text>
      </button>
    </view>

    <!-- 日期选择器 -->
    <DateTimePicker
      v-if="showDatePickerModal"
      mode="date"
      :value="birthDate"
      @confirm="onDateConfirm"
      @cancel="hideDatePicker"
    />

    <!-- 时辰选择器 -->
    <TimePickerModal
      v-if="showTimePickerModal"
      :value="birthTime"
      @confirm="onTimeConfirm"
      @cancel="hideTimePicker"
    />
  </view>
</template>

<script>
import DateTimePicker from '@/components/DateTimePicker/DateTimePicker.vue'
import TimePickerModal from '@/components/TimePickerModal/TimePickerModal.vue'
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.vue'
import { createNaming } from '@/services/naming'

export default {
  components: {
    DateTimePicker,
    TimePickerModal,
    LoadingSpinner
  },
  
  data() {
    return {
      surname: '',
      birthDate: '',
      birthTime: '',
      gender: '',
      selectedStyle: 'modern',
      showDatePickerModal: false,
      showTimePickerModal: false,
      showResults: false,
      isLoading: false,
      baziInfo: null,
      nameList: [],
      nameStyles: [
        { value: 'modern', label: '现代' },
        { value: 'classical', label: '古典' },
        { value: 'poetic', label: '诗意' },
        { value: 'simple', label: '简洁' }
      ]
    }
  },
  
  computed: {
    canGenerate() {
      return this.surname && this.birthDate && this.birthTime && this.gender
    }
  },
  
  methods: {
    goBack() {
      if (this.showResults) {
        this.showResults = false
      } else {
        uni.navigateBack()
      }
    },
    
    selectGender(gender) {
      this.gender = gender
    },
    
    selectStyle(style) {
      this.selectedStyle = style
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
    
    parseHour(timeStr) {
      const hourMap = {
        '子时': 0, '丑时': 1, '寅时': 3, '卯时': 5,
        '辰时': 7, '巳时': 9, '午时': 11, '未时': 13,
        '申时': 15, '酉时': 17, '戌时': 19, '亥时': 21
      }
      for (const [key, val] of Object.entries(hourMap)) {
        if (timeStr.includes(key)) return val
      }
      return 0
    },
    
    async startNaming() {
      if (!this.canGenerate || this.isLoading) return
      
      this.isLoading = true
      
      try {
        const [birth_year, birth_month, birth_day] = this.birthDate.split('-').map(Number)
        
        const res = await createNaming({
          birth_year,
          birth_month,
          birth_day,
          birth_hour: this.parseHour(this.birthTime),
          gender: this.gender === 'male' ? 1 : 2,
          surname: this.surname,
          name_style: this.selectedStyle
        })
        
        if (res.code === 0 && res.data) {
          const resultData = res.data.result_data || res.data
          this.baziInfo = resultData.baziInfo || {
            nianZhu: resultData.nianZhu,
            riZhu: resultData.riZhu,
            xiYong: resultData.xiYong,
            zodiac: resultData.zodiac,
            recommendWuXing: resultData.recommendWuXing
          }
          this.nameList = resultData.names || []
          this.showResults = true
        } else {
          throw new Error(res.message || '取名失败')
        }
      } catch (e) {
        console.error('Naming error:', e)
        uni.showToast({ title: e.message || '生成失败', icon: 'none' })
      } finally {
        this.isLoading = false
      }
    },
    
    showNameDetail(name) {
      uni.showModal({
        title: `${this.surname}${name.name}`,
        content: `${name.analysis}\n\n五行评分: ${name.score}分`,
        showCancel: false
      })
    },
    
    resetForm() {
      this.showResults = false
      this.nameList = []
      this.baziInfo = null
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.naming-page {
  min-height: 100vh;
  background: $color-bg-primary;
  padding-bottom: 48rpx;
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

.form-section {
  padding: 0 $page-padding-h;
}

.input-group {
  margin-bottom: 24rpx;
  
  .input-label {
    display: block;
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin-bottom: 12rpx;
  }
  
  .input-field {
    width: 100%;
    height: 96rpx;
    padding: 0 32rpx;
    background: $color-bg-card;
    border-radius: $border-radius-base;
    font-size: $font-size-lg;
    color: $color-text-primary;
    
    &::placeholder {
      color: $color-text-tertiary;
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
  
  .input-label-row {
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
  
  .input-value-row {
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
}

.gender-section,
.style-section {
  margin-top: 32rpx;
  
  .input-label {
    display: block;
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin-bottom: 16rpx;
  }
}

.gender-selector {
  display: flex;
  gap: 24rpx;
  
  .gender-option {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32rpx;
    background: $color-bg-card;
    border-radius: $border-radius-base;
    border: 2rpx solid transparent;
    
    .gender-icon {
      font-size: 64rpx;
      margin-bottom: 12rpx;
    }
    
    .gender-text {
      font-size: $font-size-base;
      color: $color-text-secondary;
    }
    
    &.active {
      border-color: $color-accent;
      background: rgba($color-accent, 0.1);
      
      .gender-text {
        color: $color-accent;
      }
    }
  }
}

.style-selector {
  display: flex;
  gap: 16rpx;
  
  .style-option {
    flex: 1;
    padding: 20rpx;
    background: $color-bg-card;
    border-radius: $border-radius-sm;
    text-align: center;
    border: 2rpx solid transparent;
    
    text {
      font-size: $font-size-sm;
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

.bazi-preview {
  margin-top: 32rpx;
  padding: 24rpx;
  background: $color-bg-card;
  border-radius: $border-radius-base;
  
  .bazi-header {
    margin-bottom: 16rpx;
    
    .bazi-title {
      font-size: $font-size-sm;
      color: $color-text-secondary;
    }
  }
  
  .bazi-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16rpx;
    margin-bottom: 16rpx;
    
    .bazi-item {
      display: flex;
      justify-content: space-between;
      
      .bazi-label {
        font-size: $font-size-sm;
        color: $color-text-tertiary;
      }
      
      .bazi-value {
        font-size: $font-size-sm;
        color: $color-text-primary;
        font-weight: $font-weight-medium;
      }
    }
  }
  
  .wuxing-info {
    display: flex;
    gap: 24rpx;
    
    .wuxing-item {
      display: flex;
      align-items: center;
      gap: 8rpx;
      
      .wuxing-label {
        font-size: $font-size-sm;
        color: $color-text-tertiary;
      }
      
      .wuxing-value {
        font-size: $font-size-sm;
        color: $color-text-primary;
        
        &.wuxing-xi {
          color: $color-accent;
          font-weight: $font-weight-semibold;
        }
      }
    }
  }
}

.btn-generate {
  width: 100%;
  height: 96rpx;
  margin-top: 48rpx;
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

.results-section {
  padding: 0 $page-padding-h;
}

.bazi-card {
  background: $color-bg-card;
  border-radius: $border-radius-base;
  margin-bottom: 32rpx;
  
  .bazi-card-header {
    padding: 24rpx;
    border-bottom: 1rpx solid $color-border;
    
    .card-title {
      font-size: $font-size-base;
      color: $color-text-primary;
      font-weight: $font-weight-semibold;
    }
  }
  
  .bazi-card-content {
    padding: 24rpx;
  }
  
  .bazi-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12rpx 0;
    
    &:not(:last-child) {
      border-bottom: 1rpx solid $color-border;
    }
    
    .bazi-row-label {
      font-size: $font-size-sm;
      color: $color-text-tertiary;
    }
    
    .bazi-row-value {
      font-size: $font-size-sm;
      color: $color-text-primary;
      
      &.highlight {
        color: $color-accent;
        font-weight: $font-weight-semibold;
      }
    }
  }
}

.names-list {
  .names-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .names-title {
      font-size: $font-size-base;
      color: $color-text-primary;
      font-weight: $font-weight-semibold;
    }
    
    .names-count {
      font-size: $font-size-sm;
      color: $color-text-tertiary;
    }
  }
}

.name-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: $color-bg-card;
  border-radius: $border-radius-base;
  margin-bottom: 16rpx;
  
  .name-rank {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin-right: 20rpx;
    background: $color-bg-hover;
    
    text {
      font-size: $font-size-sm;
      color: $color-text-secondary;
      font-weight: $font-weight-semibold;
    }
    
    &.rank-1 { background: #FFD700; text { color: #000; } }
    &.rank-2 { background: #C0C0C0; text { color: #000; } }
    &.rank-3 { background: #CD7F32; text { color: #000; } }
  }
  
  .name-content {
    flex: 1;
    
    .name-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8rpx;
      
      .name-text {
        font-size: $font-size-lg;
        color: $color-text-primary;
        font-weight: $font-weight-semibold;
      }
      
      .name-score {
        display: flex;
        align-items: baseline;
        
        .score-value {
          font-size: $font-size-xl;
          color: $color-accent;
          font-weight: $font-weight-bold;
        }
        
        .score-label {
          font-size: $font-size-sm;
          color: $color-text-tertiary;
        }
      }
    }
    
    .name-analysis {
      font-size: $font-size-sm;
      color: $color-text-secondary;
    }
  }
}

.btn-regenerate {
  width: 100%;
  height: 88rpx;
  margin-top: 32rpx;
  background: $color-bg-card;
  border: 2rpx solid $color-border;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  text {
    font-size: $font-size-base;
    color: $color-text-secondary;
  }
  
  &::after { border: none; }
}
</style>
