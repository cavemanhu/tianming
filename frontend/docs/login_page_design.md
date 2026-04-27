# 天命阁 - 登录页设计文档

**版本**: v1.0  
**日期**: 2026-04-24  
**状态**: ✅ 设计完成

---

## 1. 页面概述

| 项目 | 内容 |
|------|------|
| 页面名称 | 登录/注册页 |
| 页面路径 | `pages/login/index` |
| 页面类型 | 登录注册合一 |
| 导航样式 | 自定义导航栏 (无系统导航) |
| 背景 | 深色渐变背景 (#0D0D1A → #1A1A2E) |

---

## 2. 页面布局

```
┌────────────────────────────────────┐
│                                    │
│           【关闭按钮】              │  ← 顶部安全区 + 关闭
│                                    │
│                                    │
│            天命阁 LOGO              │  ← 品牌标识
│         「探索你的命运」            │  ← 品牌标语
│                                    │
│    ┌──────────────────────────┐    │
│    │                          │    │
│    │    微信图标  微信一键登录   │    │  ← 主登录按钮 (金色渐变)
│    │                          │    │
│    └──────────────────────────┘    │
│                                    │
│    ┌──────────────────────────┐    │
│    │       📱 手机号登录        │    │  ← 次登录按钮 (描边样式)
│    └──────────────────────────┘    │
│                                    │
│    ┌──────────────────────────┐    │
│    │       🔗 邮箱登录          │    │  ← 备选登录方式 (可折叠)
│    └──────────────────────────┘    │
│                                    │
│                                    │
├────────────────────────────────────┤
│  登录即表示同意《用户协议》和《隐私政策》 │  ← 法律声明
└────────────────────────────────────┘
```

---

## 3. 用户流程

### 3.1 微信一键登录流程

```
用户点击"微信一键登录"
       ↓
获取微信授权 (scope: getPhoneNumber)
       ↓
调用后端 /api/user/wx-login
       ↓
返回token + 用户信息
       ↓
跳转首页
```

### 3.2 手机号登录流程

```
Step 1: 用户点击"手机号登录"
        ↓
        显示手机号输入界面
        
        ┌────────────────────────────┐
        │  +86  │  请输入手机号      │  ← 手机号输入框
        └────────────────────────────┘
        │
        ↓ 点击获取验证码
        │
        调用后端 /api/user/send-code (手机号)
        ↓
        显示验证码输入界面 + 60秒倒计时

Step 2: 输入6位验证码
        │
        ↓ 点击登录
        │
        调用后端 /api/user/phone-login
        ↓
        返回token + 用户信息
        ↓
        跳转首页
```

---

## 4. 输入项设计

### 4.1 手机号输入

| 属性 | 值 |
|------|------|
| 输入类型 | number |
| 最大长度 | 11位 |
| 前缀 | +86 |
| 验证规则 | 以1开头的11位数字 |
| 占位符 | "请输入手机号" |
| 错误提示 | "手机号格式不正确" |

### 4.2 验证码输入

| 属性 | 值 |
|------|------|
| 输入类型 | number |
| 最大长度 | 6位 |
| 倒计时 | 60秒 |
| 按钮文案 | "获取验证码" → "59s" → "重新获取" |
| 验证规则 | 6位数字 |
| 错误提示 | "验证码格式不正确" / "验证码已过期" |

---

## 5. 组件状态

### 5.1 按钮状态

| 状态 | 样式 |
|------|------|
| 默认 | 金色渐变背景，白色文字 |
| 按下 | 降低透明度80%，轻微下沉 |
| 禁用 | 灰色背景，不可点击 |
| 加载中 | 显示LoadingSpinner，禁止重复点击 |

### 5.2 输入框状态

| 状态 | 样式 |
|------|------|
| 默认 | 白色边框，透明背景 |
| 聚焦 | 金色边框，发光效果 |
| 错误 | 红色边框，错误提示文字 |
| 禁用 | 灰色边框，灰色文字 |

---

## 6. 页面交互

### 6.1 动画效果

| 交互 | 动画 |
|------|------|
| 页面进入 | 从底部滑入，300ms ease-out |
| 按钮点击 | 缩放0.95，150ms |
| 输入框聚焦 | 边框颜色渐变，200ms |
| 倒计时 | 数字变化无动画，按钮禁用样式 |

### 6.2 错误处理

| 场景 | 处理 |
|------|------|
| 网络错误 | 显示"网络连接失败，请重试" |
| 手机号错误 | 输入框变红，下方显示提示 |
| 验证码错误 | 输入框变红，下方显示"验证码错误" |
| 验证码过期 | 显示"验证码已过期，请重新获取" |
| 请求频繁 | 显示"请稍后再试" |

---

## 7. 后端接口需求

### 7.1 发送验证码

```typescript
// 请求
POST /api/user/send-code
{
  phone: string  // 手机号
}

// 响应
{
  code: 0,      // 0成功，非0失败
  message: string,
  data: {
    expireAt: string  // 过期时间
  }
}
```

### 7.2 手机号登录

```typescript
// 请求
POST /api/user/phone-login
{
  phone: string,     // 手机号
  code: string       // 验证码
}

// 响应
{
  code: 0,
  message: string,
  data: {
    token: string,
    userId: string,
    phone: string,
    nickname: string,
    avatar: string,
    level: number
  }
}
```

### 7.3 微信登录

```typescript
// 请求
POST /api/user/wx-login
{
  code: string,      // 微信授权码
  iv: string,       // 加密偏移量
  encryptedData: string  // 加密数据
}

// 响应
{
  code: 0,
  message: string,
  data: {
    token: string,
    userId: string,
    phone: string,
    nickname: string,
    avatar: string,
    level: number,
    isNewUser: boolean  // 是否新用户
  }
}
```

---

## 8. 页面代码结构

```vue
<template>
  <view class="login-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <icon class="close-btn" @tap="handleClose" />
    </view>

    <!-- Logo区域 -->
    <view class="logo-section">
      <image class="logo" src="/static/logo.png" />
      <text class="slogan">探索你的命运</text>
    </view>

    <!-- 登录方式 -->
    <view class="login-options">
      <!-- 微信登录 -->
      <button 
        class="btn-wechat"
        @tap="handleWechatLogin"
        :loading="wechatLoading"
      >
        <image class="btn-icon" src="/static/icons/wechat.svg" />
        <text>微信一键登录</text>
      </button>

      <!-- 手机号登录 -->
      <button 
        class="btn-phone"
        @tap="togglePhoneLogin"
      >
        <text class="btn-icon">📱</text>
        <text>手机号登录</text>
      </button>
    </view>

    <!-- 手机号登录表单 (条件渲染) -->
    <view class="phone-form" v-if="showPhoneForm">
      <input 
        class="input-phone"
        type="number"
        v-model="phone"
        placeholder="请输入手机号"
        :maxlength="11"
      />
      <view class="code-row">
        <input 
          class="input-code"
          type="number"
          v-model="code"
          placeholder="请输入验证码"
          :maxlength="6"
        />
        <button 
          class="btn-code"
          @tap="sendCode"
          :disabled="countdown > 0"
        >
          {{ countdown > 0 ? countdown + 's' : '获取验证码' }}
        </button>
      </view>
      <button 
        class="btn-login"
        @tap="handlePhoneLogin"
        :disabled="!canLogin"
        :loading="loginLoading"
      >
        登录
      </button>
    </view>

    <!-- 法律声明 -->
    <view class="legal-notice">
      <text>登录即表示同意</text>
      <text class="link" @tap="openUserAgreement">《用户协议》</text>
      <text>和</text>
      <text class="link" @tap="openPrivacyPolicy">《隐私政策》</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      showPhoneForm: false,
      phone: '',
      code: '',
      countdown: 0,
      wechatLoading: false,
      loginLoading: false
    }
  },
  computed: {
    canLogin() {
      return this.phone.length === 11 && this.code.length === 6
    }
  },
  methods: {
    handleWechatLogin() { /* 微信登录逻辑 */ },
    togglePhoneLogin() { this.showPhoneForm = !this.showPhoneForm },
    sendCode() { /* 发送验证码 */ },
    handlePhoneLogin() { /* 手机号登录 */ }
  }
}
</script>
```

---

## 9. 设计规格

### 9.1 颜色

| 元素 | 颜色 |
|------|------|
| 背景 | #0D0D1A → #1A1A2E 渐变 |
| 主按钮背景 | #FFD700 → #FFA500 渐变 |
| 主按钮文字 | #000000 |
| 次按钮边框 | #FFD700 (50%透明) |
| 次按钮文字 | #FFD700 |
| logo文字 | #FFD700 |
| slogan文字 | #B8B8D0 |
| 法律声明 | #6B6B80 |

### 9.2 间距

| 元素 | 值 |
|------|------|
| 页面水平边距 | 48rpx |
| Logo上边距 | 120rpx (距顶部安全区) |
| Logo与slogan间距 | 16rpx |
| 按钮间距 | 24rpx |
| 按钮高度 | 96rpx |
| 按钮圆角 | 48rpx (全圆角) |

### 9.3 字体

| 元素 | 字号 | 字重 |
|------|------|------|
| Logo | 48rpx | bold |
| Slogan | 28rpx | normal |
| 按钮文字 | 32rpx | medium |
| 输入框 | 32rpx | normal |
| 法律声明 | 24rpx | normal |

---

_文档版本: v1.0 | 2026-04-24_