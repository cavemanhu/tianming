<template>
  <view class="fatename-page">
    <!-- 背景装饰 -->
    <view class="bg-pattern"></view>
    
    <!-- 顶部标题 -->
    <view class="page-header">
      <text class="header-title">宝宝取名</text>
      <text class="header-subtitle">八字五行 · 诗经典故 · 三才五格</text>
    </view>
    
    <!-- 姓名输入 -->
    <view class="section name-input">
      <view class="section-title">
        <text class="title-icon">✍️</text>
        <text>姓氏</text>
      </view>
      <view class="surname-row">
        <input 
          class="surname-input" 
          v-model="surname" 
          placeholder="请输入姓氏"
          maxlength="1"
        />
        <text class="surname-hint">单姓</text>
      </view>
    </view>
    
    <!-- 性别选择 -->
    <view class="section gender-select">
      <view class="section-title">
        <text class="title-icon">⚥</text>
        <text>性别</text>
      </view>
      <view class="gender-options">
        <view 
          class="gender-option" 
          :class="{ active: gender === 'male' }"
          @click="gender = 'male'"
        >
          <text class="gender-icon">👦</text>
          <text class="gender-label">男孩</text>
        </view>
        <view 
          class="gender-option" 
          :class="{ active: gender === 'female' }"
          @click="gender = 'female'"
        >
          <text class="gender-icon">👧</text>
          <text class="gender-label">女孩</text>
        </view>
      </view>
    </view>
    
    <!-- 出生日期 -->
    <view class="section birth-input">
      <view class="section-title">
        <text class="title-icon">📅</text>
        <text>出生日期</text>
      </view>
      <view class="birth-grid">
        <view class="birth-item" @click="showYearPicker">
          <text class="birth-label">年</text>
          <text class="birth-value">{{ birthYear || '选择' }}</text>
        </view>
        <view class="birth-item" @click="showMonthPicker">
          <text class="birth-label">月</text>
          <text class="birth-value">{{ birthMonth || '选择' }}</text>
        </view>
        <view class="birth-item" @click="showDayPicker">
          <text class="birth-label">日</text>
          <text class="birth-value">{{ birthDay || '选择' }}</text>
        </view>
        <view class="birth-item" @click="showHourPicker">
          <text class="birth-label">时</text>
          <text class="birth-value">{{ birthHour || '选择' }}</text>
        </view>
      </view>
    </view>
    
    <!-- 五行预览 -->
    <view class="section wuxing-preview" v-if="wuxingPreview">
      <view class="section-title">
        <text class="title-icon">☰</text>
        <text>五行分析预览</text>
      </view>
      <view class="wuxing-bars">
        <view 
          class="wuxing-bar" 
          v-for="(item, index) in wuxingPreview" 
          :key="index"
          :class="item.type"
        >
          <text class="wx-name">{{ item.type }}</text>
          <view class="wx-bar-bg">
            <view class="wx-bar-fill" :style="{ width: item.ratio + '%' }"></view>
          </view>
          <text class="wx-count">{{ item.count }}</text>
        </view>
      </view>
      <view class="wuxing-lack" v-if="wuxingLack.length">
        <text class="lack-label">喜用神：</text>
        <text class="lack-value" v-for="wx in wuxingLack" :key="wx" :class="wx">{{ wx }}</text>
      </view>
    </view>
    
    <!-- 开始取名按钮 -->
    <button 
      class="generate-btn" 
      :disabled="!canGenerate || loading"
      @click="generateNames"
    >
      <text v-if="loading" class="btn-loading">命名中...</text>
      <text v-else>开始智能取名</text>
    </button>
    
    <!-- 结果列表 -->
    <view class="result-list" v-if="results.length">
      <view class="result-header">
        <text class="result-title">为您精选的名字</text>
        <text class="result-count">共 {{ results.length }} 个</text>
      </view>
      
      <view 
        class="result-card" 
        v-for="(name, index) in results" 
        :key="index"
        @click="showNameDetail(name)"
      >
        <view class="result-rank">{{ index + 1 }}</view>
        <view class="result-info">
          <view class="result-name-row">
            <text class="result-name">{{ name.name }}</text>
            <view class="result-wuxing" :class="name.wuxing">{{ name.wuxing }}</view>
          </view>
          <text class="result-meaning">{{ name.meaning }}</text>
          <view class="result-poetry">{{ name.poetry }}</view>
        </view>
        <view class="result-score">
          <text class="score-value">{{ name.score }}</text>
          <text class="score-label">分</text>
        </view>
      </view>
    </view>
    
    <!-- 底部TabBar -->
    <view class="tabbar">
      <view class="tab-item" @click="goHome">
        <text class="tab-icon">🏠</text>
        <text class="tab-text">首页</text>
      </view>
      <view class="tab-item">
        <text class="tab-icon">✍️</text>
        <text class="tab-text active">取名</text>
      </view>
      <view class="tab-item">
        <text class="tab-icon">☯️</text>
        <text class="tab-text">易经</text>
      </view>
      <view class="tab-item">
        <text class="tab-icon">👤</text>
        <text class="tab-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      surname: '',
      gender: 'male',
      birthYear: '',
      birthMonth: '',
      birthDay: '',
      birthHour: '',
      loading: false,
      results: [],
      wuxingPreview: null,
      wuxingLack: [],
      apiBaseUrl: 'http://localhost:3000'
    }
  },
  computed: {
    canGenerate() {
      return this.surname && this.birthYear && this.birthMonth && this.birthDay
    }
  },
  methods: {
    showYearPicker() {
      const years = [];
      for (let y = 2026; y >= 1950; y--) years.push(y);
      uni.showPicker({
        mode: 'selector',
        range: years,
        success: (e) => { this.birthYear = years[e.index]; }
      });
    },
    showMonthPicker() {
      const months = Array.from({length:12}, (_,i) => i+1);
      uni.showPicker({
        mode: 'selector',
        range: months,
        success: (e) => { this.birthMonth = months[e.index]; }
      });
    },
    showDayPicker() {
      const days = Array.from({length:31}, (_,i) => i+1);
      uni.showPicker({
        mode: 'selector',
        range: days,
        success: (e) => { this.birthDay = days[e.index]; }
      });
    },
    showHourPicker() {
      const hours = ['子时','丑时','寅时','卯时','辰时','巳时','午时','未时','申时','酉时','戌时','亥时'];
      uni.showPicker({
        mode: 'selector',
        range: hours,
        success: (e) => { this.birthHour = hours[e.index]; }
      });
    },
    async generateNames() {
      if (!this.canGenerate) return;
      this.loading = true;
      try {
        const res = await uni.request({
          url: `${this.apiBaseUrl}/api/fatename/generate`,
          method: 'POST',
          data: {
            birthYear: this.birthYear,
            birthMonth: this.birthMonth,
            birthDay: this.birthDay,
            birthHour: 12,
            gender: this.gender,
            surname: this.surname
          }
        });
        if (res.data.code === 0) {
          this.results = res.data.data.names;
          this.wuxingPreview = Object.entries(res.data.data.wuxingCount).map(([type, count]) => ({
            type, count, ratio: count / 3 * 100
          }));
          this.wuxingLack = res.data.data.wuxingLack;
        }
      } catch (e) {
        console.error('generate error:', e);
        uni.showToast({ title: '网络错误', icon: 'none' });
      }
      this.loading = false;
    },
    showNameDetail(name) {
      uni.showModal({
        title: name.name,
        content: `五行:${name.wuxing}\n寓意:${name.meaning}\n出处:${name.poetry}\n三才:${JSON.stringify(name.tiancai)}`,
        showCancel: false
      });
    },
    goHome() {
      uni.switchTab({ url: '/pages/index/index' });
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/v2-variables.scss';

.fatename-page {
  min-height: 100vh;
  background: $bg-primary;
  padding-bottom: 120rpx;
  position: relative;
}

.bg-pattern {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 400rpx;
  background: $gradient-ink;
  z-index: 0;
}

.page-header {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 40rpx 0 60rpx;
  
  .header-title {
    font-size: 48rpx;
    font-weight: 700;
    color: $gold-primary;
    font-family: $font-display;
    display: block;
    text-shadow: 0 0 20px rgba(255,215,0,0.3);
  }
  
  .header-subtitle {
    font-size: 24rpx;
    color: $text-secondary;
    display: block;
    margin-top: 16rpx;
  }
}

.section {
  margin: 0 32rpx 32rpx;
  padding: 32rpx;
  background: $bg-card;
  border-radius: 24rpx;
  position: relative;
  z-index: 1;
  
  .section-title {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    
    .title-icon {
      font-size: 36rpx;
      margin-right: 16rpx;
    }
    
    text {
      font-size: 30rpx;
      font-weight: 600;
      color: $text-primary;
    }
  }
}

.surname-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.surname-input {
  width: 120rpx;
  height: 96rpx;
  background: $bg-secondary;
  border: 2rpx solid rgba(255,215,0,0.3);
  border-radius: 16rpx;
  text-align: center;
  font-size: 48rpx;
  color: $gold-primary;
  font-weight: 700;
}

.surname-hint {
  font-size: 24rpx;
  color: $text-secondary;
}

.gender-options {
  display: flex;
  gap: 24rpx;
}

.gender-option {
  flex: 1;
  height: 160rpx;
  background: $bg-secondary;
  border: 2rpx solid rgba(255,255,255,0.1);
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  
  &.active {
    border-color: $gold-primary;
    background: rgba(255,215,0,0.1);
    
    .gender-label { color: $gold-primary; }
  }
  
  .gender-icon { font-size: 56rpx; margin-bottom: 12rpx; }
  .gender-label { font-size: 28rpx; color: $text-secondary; }
}

.birth-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.birth-item {
  height: 120rpx;
  background: $bg-secondary;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  .birth-label {
    font-size: 22rpx;
    color: $text-secondary;
    margin-bottom: 8rpx;
  }
  
  .birth-value {
    font-size: 28rpx;
    color: $text-primary;
    font-weight: 500;
  }
}

.wuxing-bars {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.wuxing-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  
  .wx-name {
    width: 40rpx;
    font-size: 24rpx;
    color: $text-secondary;
  }
  
  .wx-bar-bg {
    flex: 1;
    height: 16rpx;
    background: rgba(255,255,255,0.1);
    border-radius: 8rpx;
    overflow: hidden;
  }
  
  .wx-bar-fill {
    height: 100%;
    border-radius: 8rpx;
    transition: width 0.5s;
    
    &.金 { background: $wuxing-jin; }
    &.木 { background: $wuxing-mu; }
    &.水 { background: $wuxing-shui; }
    &.火 { background: $wuxing-huo; }
    &.土 { background: $wuxing-tu; }
  }
  
  .wx-count {
    width: 40rpx;
    font-size: 24rpx;
    color: $text-primary;
    text-align: right;
  }
}

.wuxing-lack {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(255,255,255,0.05);
  
  .lack-label {
    font-size: 24rpx;
    color: $text-secondary;
  }
  
  .lack-value {
    font-size: 28rpx;
    font-weight: 600;
    margin-left: 16rpx;
    
    &.金 { color: $wuxing-jin; }
    &.木 { color: $wuxing-mu; }
    &.水 { color: $wuxing-shui; }
    &.火 { color: $wuxing-huo; }
    &.土 { color: $wuxing-tu; }
  }
}

.generate-btn {
  margin: 40rpx 32rpx;
  height: 96rpx;
  background: $gradient-gold;
  border: none;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: $bg-primary;
  box-shadow: $shadow-gold;
  
  &:disabled {
    opacity: 0.5;
    background: $bg-card;
    color: $text-secondary;
  }
}

.result-list {
  padding: 0 32rpx;
  position: relative;
  z-index: 1;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  
  .result-title {
    font-size: 32rpx;
    font-weight: 700;
    color: $gold-primary;
  }
  
  .result-count {
    font-size: 24rpx;
    color: $text-secondary;
  }
}

.result-card {
  display: flex;
  align-items: center;
  background: $bg-card;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  
  .result-rank {
    width: 56rpx;
    height: 56rpx;
    background: $gradient-gold;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    font-weight: 700;
    color: $bg-primary;
    margin-right: 20rpx;
  }
  
  .result-info {
    flex: 1;
    
    .result-name-row {
      display: flex;
      align-items: center;
      gap: 16rpx;
      margin-bottom: 8rpx;
    }
    
    .result-name {
      font-size: 36rpx;
      font-weight: 700;
      color: $text-primary;
    }
    
    .result-wuxing {
      font-size: 20rpx;
      padding: 4rpx 12rpx;
      border-radius: 8rpx;
      background: rgba(255,215,0,0.2);
      color: $gold-primary;
      
      &.金 { background: rgba(255,215,0,0.2); color: $wuxing-jin; }
      &.木 { background: rgba(34,139,34,0.2); color: $wuxing-mu; }
      &.水 { background: rgba(0,0,205,0.2); color: $wuxing-shui; }
      &.火 { background: rgba(220,20,60,0.2); color: $wuxing-huo; }
      &.土 { background: rgba(139,69,19,0.2); color: $wuxing-tu; }
    }
    
    .result-meaning {
      font-size: 24rpx;
      color: $text-secondary;
      display: block;
      margin-bottom: 8rpx;
    }
    
    .result-poetry {
      font-size: 22rpx;
      color: $text-dim;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  
  .result-score {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: 20rpx;
    
    .score-value {
      font-size: 40rpx;
      font-weight: 700;
      color: $gold-primary;
    }
    
    .score-label {
      font-size: 20rpx;
      color: $text-secondary;
    }
  }
}

.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: $bg-secondary;
  border-top: 1rpx solid rgba(255,255,255,0.05);
  display: flex;
  justify-content: space-around;
  padding-bottom: constant(safe-area-inset-bottom);
  
  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 16rpx;
    
    .tab-icon { font-size: 40rpx; opacity: 0.5; }
    .tab-icon.active { opacity: 1; }
    
    .tab-text {
      font-size: 20rpx;
      color: $text-secondary;
      margin-top: 4rpx;
    }
    
    .tab-text.active { color: $gold-primary; }
  }
}
</style>
