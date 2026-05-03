<template>
  <view class="login-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left">
        <text class="nav-time">{{ currentTime }}</text>
      </view>
      <view class="nav-right">
        <text class="nav-date">{{ currentDate }}</text>
      </view>
    </view>

    <!-- Logo区域 -->
    <view class="logo-section">
      <view class="logo-container">
        <text class="logo-text">天</text>
        <view class="logo-divider"></view>
        <text class="logo-text">命</text>
        <view class="logo-divider"></view>
        <text class="logo-text">阁</text>
      </view>
      <text class="slogan">探索你的命运</text>
      <text class="subtitle">知命而为，顺势而行</text>
    </view>

    <!-- 登录方式选择 -->
    <view class="login-options">
      <!-- 微信登录按钮 -->
      <button 
        class="btn-wechat"
        :class="{ loading: wechatLoading }"
        @tap="handleWechatLogin"
        :disabled="wechatLoading"
      >
        <image 
          v-if="!wechatLoading" 
          class="btn-icon" 
          src="/static/icons/wechat.svg" 
          mode="aspectFit"
        />
        <view v-else class="spinner-small"></view>
        <text class="btn-text">{{ wechatLoading ? '登录中...' : '微信一键登录' }}</text>
      </button>

      <!-- 手机号登录按钮 -->
      <button 
        class="btn-phone"
        @tap="togglePhoneForm"
      >
        <text class="btn-icon-text">📱</text>
        <text class="btn-text">手机号登录</text>
      </button>
    </view>

    <!-- 手机号登录表单 -->
    <view 
      class="phone-form"
      :class="{ 'form-visible': showPhoneForm }"
    >
      <view class="form-title">登录/注册</view>
      
      <!-- 手机号输入 -->
      <view class="input-group">
        <view class="input-wrapper" :class="{ 'input-error': phoneError }">
          <text class="input-prefix">+86</text>
          <input 
            class="input-field"
            type="number"
            v-model="phone"
            placeholder="请输入手机号"
            :maxlength="11"
            @input="validatePhone"
            @focus="phoneError = ''"
          />
        </view>
        <text class="error-text" v-if="phoneError">{{ phoneError }}</text>
      </view>

      <!-- 验证码输入 -->
      <view class="input-group">
        <view class="input-wrapper code-wrapper" :class="{ 'input-error': codeError }">
          <input 
            class="input-field"
            type="number"
            v-model="code"
            placeholder="请输入验证码"
            :maxlength="6"
            @input="validateCode"
            @focus="codeError = ''"
          />
          <button 
            class="btn-code"
            :class="{ 'code-disabled': countdown > 0 }"
            @tap="sendCode"
            :disabled="countdown > 0 || !canSendCode"
          >
            <text v-if="countdown > 0">{{ countdown }}s</text>
            <text v-else>获取验证码</text>
          </button>
        </view>
        <text class="error-text" v-if="codeError">{{ codeError }}</text>
      </view>

      <!-- 登录按钮 -->
      <button 
        class="btn-login"
        :class="{ 'btn-disabled': !canLogin }"
        @tap="handlePhoneLogin"
        :disabled="!canLogin || loginLoading"
      >
        <view v-if="loginLoading" class="spinner-small"></view>
        <text v-else>登录</text>
      </button>

      <!-- 返回按钮 -->
      <view class="btn-back" @tap="togglePhoneForm">
        <text class="back-icon">←</text>
        <text>返回</text>
      </view>
    </view>

    <!-- 法律声明 -->
    <view class="legal-notice">
      <text class="notice-text">登录即表示同意</text>
      <text class="link" @tap="openUserAgreement">《用户协议》</text>
      <text class="notice-text">和</text>
      <text class="link" @tap="openPrivacyPolicy">《隐私政策》</text>
    </view>

    <!-- 背景装饰 -->
    <view class="bg-decor bg-decor-1"></view>
    <view class="bg-decor bg-decor-2"></view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 时间显示
      currentTime: '',
      currentDate: '',
      
      // 表单状态
      showPhoneForm: false,
      phone: '',
      code: '',
      countdown: 0,
      countdownTimer: null,
      
      // 按钮状态
      wechatLoading: false,
      loginLoading: false,
      
      // 错误信息
      phoneError: '',
      codeError: ''
    }
  },
  
  computed: {
    canSendCode() {
      return this.phone.length === 11 && !this.phoneError
    },
    
    canLogin() {
      return this.phone.length === 11 && this.code.length === 6
    }
  },
  
  onLoad() {
    this.updateTime()
    setInterval(this.updateTime, 60000)
  },
  
  onUnload() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }
  },
  
  methods: {
    // 更新时间
    updateTime() {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      this.currentTime = `${hours}:${minutes}`
      
      const month = now.getMonth() + 1
      const date = now.getDate()
      const weekdays = ['日', '一', '二', '三', '四', '五', '六']
      const weekday = weekdays[now.getDay()]
      this.currentDate = `${month}月${date}日 周${weekday}`
    },
    
    // 切换手机号表单显示
    togglePhoneForm() {
      this.showPhoneForm = !this.showPhoneForm
      if (!this.showPhoneForm) {
        this.resetForm()
      }
    },
    
    // 重置表单
    resetForm() {
      this.phone = ''
      this.code = ''
      this.phoneError = ''
      this.codeError = ''
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdown = 0
      }
    },
    
    // 验证手机号
    validatePhone() {
      const phone = this.phone
      if (phone.length === 0) {
        this.phoneError = ''
      } else if (phone.length < 11) {
        this.phoneError = ''
      } else if (!/^1[3-9]\d{9}$/.test(phone)) {
        this.phoneError = '手机号格式不正确'
      } else {
        this.phoneError = ''
      }
    },
    
    // 验证验证码
    validateCode() {
      const code = this.code
      if (code.length > 0 && code.length < 6) {
        this.codeError = ''
      } else if (code.length === 6 && !/^\d{6}$/.test(code)) {
        this.codeError = '验证码格式不正确'
      } else {
        this.codeError = ''
      }
    },
    
    // 发送验证码
    async sendCode() {
      if (!this.canSendCode || this.countdown > 0) return
      
      try {
        // TODO: 调用后端API
        // await uni.request({
        //   url: '/api/user/send-code',
        //   method: 'POST',
        //   data: { phone: this.phone }
        // })
        
        uni.showToast({ title: '验证码已发送', icon: 'success' })
        
        // 开始倒计时
        this.countdown = 60
        this.countdownTimer = setInterval(() => {
          this.countdown--
          if (this.countdown <= 0) {
            clearInterval(this.countdownTimer)
          }
        }, 1000)
        
      } catch (e) {
        uni.showToast({ title: '发送失败，请重试', icon: 'none' })
      }
    },
    
    // 手机号登录
    async handlePhoneLogin() {
      if (!this.canLogin) return
      
      this.loginLoading = true
      
      try {
        // TODO: 后端手机号登录API待实现，当前显示提示
        uni.showToast({ title: '手机号登录即将上线，请使用微信登录', icon: 'none', duration: 2500 })
        
        // 临时模拟登录成功（后端实现后可替换）
        setTimeout(() => {
          const mockToken = 'mock_token_' + Date.now()
          const mockUserInfo = {
            id: 'test_001',
            nickname: '命运探索者',
            phone: this.phone,
            avatar_url: '',
            invite_code: 'TM' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            gems: 100,
            level: 1
          }
          getApp().setLoginInfo(mockToken, mockUserInfo)
          uni.showToast({ title: '登录成功', icon: 'success' })
          setTimeout(() => {
            uni.switchTab({ url: '/pages/index/index' })
          }, 1000)
          this.loginLoading = false
        }, 1500)
        
      } catch (e) {
        console.error('手机号登录失败:', e)
        uni.showToast({ title: '登录失败，请重试', icon: 'none' })
        this.loginLoading = false
      }
    },
    
    // 微信登录
    async handleWechatLogin() {
      // #ifdef MP-WEIXIN
      this.wechatLoading = true
      try {
        // 获取登录code
        const loginRes = await new Promise((resolve, reject) => {
          uni.login({
            provider: 'weixin',
            success: (res) => resolve(res),
            fail: reject
          })
        })
        
        const code = loginRes.code
        if (!code) {
          throw new Error('获取微信授权码失败')
        }
        
        // 调用后端API进行微信登录
        const res = await uni.request({
          url: '/api/user/login',
          method: 'POST',
          data: {
            code: code,
            invite_code: getApp().globalData.inviteCode || ''
          }
        })
        
        const result = res.data
        if (result.code === 0) {
          // 登录成功，保存token和用户信息
          const { token, user, is_new_user } = result.data
          getApp().setLoginInfo(token, user)
          
          if (is_new_user) {
            uni.showToast({ title: '注册成功', icon: 'success' })
          } else {
            uni.showToast({ title: '登录成功', icon: 'success' })
          }
          
          setTimeout(() => {
            uni.switchTab({ url: '/pages/index/index' })
          }, 1500)
        } else {
          uni.showToast({ title: result.message || '登录失败', icon: 'none' })
        }
      } catch (e) {
        console.error('微信登录失败:', e)
        uni.showToast({ title: e.message || '微信登录失败', icon: 'none' })
      } finally {
        this.wechatLoading = false
      }
      // #endif
      
      // #ifndef MP-WEIXIN
      uni.showToast({ title: '请在微信小程序中使用', icon: 'none' })
      // #endif
    },
    
    // 打开用户协议
    openUserAgreement() {
      uni.navigateTo({
        url: '/pages/webview/index?url=https://tianming.com/agreement'
      })
    },
    
    // 打开隐私政策
    openPrivacyPolicy() {
      uni.navigateTo({
        url: '/pages/webview/index?url=https://tianming.com/privacy'
      })
    }
  }
}
</script>

<style lang="scss" lang="scss">
@import '@/styles/variables.scss';

.login-page {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(180deg, $color-bg-secondary 0%, $color-bg-primary 100%);
  overflow: hidden;
  
  // 背景装饰
  .bg-decor {
    position: absolute;
    border-radius: 50%;
    opacity: 0.1;
  }
  
  .bg-decor-1 {
    width: 600rpx;
    height: 600rpx;
    background: radial-gradient(circle, $color-accent 0%, transparent 70%);
    top: -200rpx;
    right: -200rpx;
  }
  
  .bg-decor-2 {
    width: 400rpx;
    height: 400rpx;
    background: radial-gradient(circle, $color-primary 0%, transparent 70%);
    bottom: -100rpx;
    left: -100rpx;
  }
  
  // 顶部导航
  .nav-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 60rpx $page-padding-h 0;
    
    .nav-time {
      font-size: $font-size-lg;
      color: $color-text-primary;
      font-weight: $font-weight-medium;
    }
    
    .nav-date {
      font-size: $font-size-sm;
      color: $color-text-secondary;
    }
  }
  
  // Logo区域
  .logo-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 120rpx;
    
    .logo-container {
      display: flex;
      align-items: center;
      gap: 16rpx;
      
      .logo-text {
        font-size: 72rpx;
        font-weight: $font-weight-bold;
        color: $color-accent;
        text-shadow: 0 0 30rpx rgba($color-accent, 0.5);
      }
      
      .logo-divider {
        width: 2rpx;
        height: 60rpx;
        background: linear-gradient(180deg, transparent, $color-accent, transparent);
      }
    }
    
    .slogan {
      margin-top: 24rpx;
      font-size: $font-size-lg;
      color: $color-text-primary;
      letter-spacing: 8rpx;
    }
    
    .subtitle {
      margin-top: 12rpx;
      font-size: $font-size-sm;
      color: $color-text-tertiary;
    }
  }
  
  // 登录选项
  .login-options {
    padding: 80rpx $page-padding-h 0;
    
    .btn-wechat {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16rpx;
      width: 100%;
      height: 96rpx;
      background: linear-gradient(135deg, $color-accent 0%, #FFA500 100%);
      border: none;
      border-radius: 48rpx;
      box-shadow: 0 8rpx 32rpx rgba($color-accent, 0.3);
      
      .btn-icon {
        width: 44rpx;
        height: 44rpx;
      }
      
      .btn-text {
        font-size: $font-size-base;
        color: #000;
        font-weight: $font-weight-semibold;
      }
      
      &.loading {
        opacity: 0.8;
      }
      
      &::after { border: none; }
      
      &:active {
        transform: scale(0.98);
        box-shadow: 0 4rpx 16rpx rgba($color-accent, 0.3);
      }
    }
    
    .btn-phone {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12rpx;
      width: 100%;
      height: 96rpx;
      margin-top: 24rpx;
      background: transparent;
      border: 1rpx solid rgba($color-accent, 0.4);
      border-radius: 48rpx;
      
      .btn-icon-text {
        font-size: 40rpx;
      }
      
      .btn-text {
        font-size: $font-size-base;
        color: $color-accent;
      }
      
      &::after { border: none; }
      
      &:active {
        background: rgba($color-accent, 0.1);
      }
    }
    
    .spinner-small {
      width: 36rpx;
      height: 36rpx;
      border: 3rpx solid rgba(0, 0, 0, 0.2);
      border-top-color: #000;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }
  
  // 手机号表单
  .phone-form {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 48rpx $page-padding-h 80rpx;
    background: $color-bg-secondary;
    border-radius: 48rpx 48rpx 0 0;
    transform: translateY(100%);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    
    &.form-visible {
      transform: translateY(0);
    }
    
    .form-title {
      text-align: center;
      font-size: $font-size-xl;
      color: $color-text-primary;
      font-weight: $font-weight-semibold;
      margin-bottom: 48rpx;
    }
    
    .input-group {
      margin-bottom: 32rpx;
      
      .input-wrapper {
        display: flex;
        align-items: center;
        height: 96rpx;
        padding: 0 24rpx;
        background: $color-bg-card;
        border: 1rpx solid $color-border-light;
        border-radius: $border-radius-base;
        transition: border-color 0.2s ease;
        
        &.input-error {
          border-color: $color-error;
        }
        
        .input-prefix {
          font-size: $font-size-base;
          color: $color-text-secondary;
          margin-right: 16rpx;
          padding-right: 16rpx;
          border-right: 1rpx solid $color-border-light;
        }
        
        .input-field {
          flex: 1;
          height: 100%;
          font-size: $font-size-base;
          color: $color-text-primary;
          
          &::placeholder {
            color: $color-text-tertiary;
          }
        }
        
        &.code-wrapper {
          padding-right: 0;
          
          .input-field {
            padding-right: 16rpx;
          }
        }
        
        .btn-code {
          min-width: 180rpx;
          height: 72rpx;
          margin: 12rpx;
          padding: 0 24rpx;
          background: linear-gradient(135deg, $color-accent 0%, #FFA500 100%);
          border: none;
          border-radius: $border-radius-sm;
          font-size: $font-size-sm;
          color: #000;
          font-weight: $font-weight-medium;
          white-space: nowrap;
          
          &.code-disabled {
            background: $color-bg-hover;
            color: $color-text-tertiary;
          }
          
          &::after { border: none; }
        }
      }
      
      .error-text {
        display: block;
        margin-top: 12rpx;
        font-size: $font-size-sm;
        color: $color-error;
      }
    }
    
    .btn-login {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 96rpx;
      margin-top: 24rpx;
      background: linear-gradient(135deg, $color-accent 0%, #FFA500 100%);
      border: none;
      border-radius: 48rpx;
      font-size: $font-size-base;
      color: #000;
      font-weight: $font-weight-semibold;
      
      &.btn-disabled {
        background: $color-bg-hover;
        color: $color-text-tertiary;
      }
      
      &::after { border: none; }
      
      &:active:not(.btn-disabled) {
        transform: scale(0.98);
      }
    }
    
    .btn-back {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
      margin-top: 32rpx;
      color: $color-text-tertiary;
      font-size: $font-size-sm;
      
      .back-icon {
        font-size: 32rpx;
      }
    }
  }
  
  // 法律声明
  .legal-notice {
    position: absolute;
    bottom: 60rpx;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 8rpx;
    padding: 0 $page-padding-h;
    
    .notice-text {
      font-size: $font-size-xs;
      color: $color-text-tertiary;
    }
    
    .link {
      font-size: $font-size-xs;
      color: $color-accent;
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>