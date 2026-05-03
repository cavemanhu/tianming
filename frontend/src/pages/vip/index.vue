<template>
  <view class="vip-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="nav-back">←</text>
      </view>
      <view class="nav-title">开通VIP会员</view>
      <view class="nav-right"></view>
    </view>

    <!-- 用户状态 -->
    <view class="user-status">
      <view class="user-info" v-if="isLogin">
        <image class="avatar" :src="userInfo.avatar_url || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="info">
          <text class="nickname">{{ userInfo.nickname || '命运探索者' }}</text>
          <text class="vip-badge" v-if="vipStatus.is_vip">✨ {{ vipStatus.level_name }}</text>
          <text class="vip-badge normal" v-else>普通会员</text>
        </view>
      </view>
      <view class="user-info" v-else>
        <view class="avatar placeholder">?</view>
        <view class="info">
          <text class="nickname">未登录</text>
          <text class="vip-badge normal">登录后查看VIP状态</text>
        </view>
      </view>
      
      <view class="vip-expiry" v-if="vipStatus.is_vip">
        <text>到期时间: {{ formatDate(vipStatus.expire_time) }}</text>
        <text class="days-left">剩余 {{ vipStatus.days_left }} 天</text>
      </view>
    </view>

    <!-- VIP特权 -->
    <view class="privileges-section">
      <view class="section-title">会员特权</view>
      <view class="privileges-grid">
        <view class="privilege-item">
          <text class="icon">♾️</text>
          <text class="label">无限算命</text>
          <text class="desc">不限次数测算</text>
        </view>
        <view class="privilege-item">
          <text class="icon">🎯</text>
          <text class="label">专属功能</text>
          <text class="desc">高级分析报告</text>
        </view>
        <view class="privilege-item">
          <text class="icon">💎</text>
          <text class="label">天命币赠送</text>
          <text class="desc">开通即送</text>
        </view>
        <view class="privilege-item">
          <text class="icon">🎁</text>
          <text class="label">8折优惠</text>
          <text class="desc">续费专属折扣</text>
        </view>
      </view>
    </view>

    <!-- 套餐选择 -->
    <view class="packages-section">
      <view class="section-title">选择套餐</view>
      <view class="packages-list">
        <view 
          v-for="pkg in packages" 
          :key="pkg.id"
          class="package-card"
          :class="{ selected: selectedPackage === pkg.id, popular: pkg.level === 3 }"
          @tap="selectPackage(pkg.id)"
        >
          <view class="popular-tag" v-if="pkg.level === 3">最受欢迎</view>
          <view class="package-header">
            <text class="package-name">{{ pkg.name }}</text>
            <view class="package-badges">
              <text class="badge gems" v-if="pkg.gems_bonus > 0">送{{ pkg.gems_bonus }}币</text>
              <text class="badge discount" v-if="pkg.discount > 0">{{ Math.round(pkg.discount * 10) }}折</text>
            </view>
          </view>
          <view class="package-price">
            <text class="price">¥{{ pkg.price }}</text>
            <text class="unit">/{{ pkg.months }}个月</text>
          </view>
          <view class="package-original" v-if="pkg.original_price > pkg.price">
            <text>原价 ¥{{ pkg.original_price }}</text>
          </view>
          <view class="package-features">
            <text class="feature">✓ 无限算命</text>
            <text class="feature">✓ 专属功能</text>
            <text class="feature" v-if="pkg.gems_bonus > 0">✓ 赠送{{ pkg.gems_bonus }}天命币</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 开通按钮 -->
    <view class="action-section">
      <button 
        class="btn-open" 
        :class="{ disabled: !selectedPackage || !isLogin }"
        @tap="handleOpenVip"
        :disabled="!selectedPackage || !isLogin || loading"
      >
        <view v-if="loading" class="spinner"></view>
        <text v-else>{{ !isLogin ? '请先登录' : selectedPackage ? '立即开通' : '请选择套餐' }}</text>
      </button>
      <text class="agreement">开通即表示同意《VIP会员协议》</text>
    </view>
  </view>
</template>

<script>
import { getUserInfo } from '@/utils/auth'

export default {
  data() {
    return {
      isLogin: false,
      userInfo: null,
      vipStatus: {
        is_vip: false,
        level: 0,
        level_name: '',
        expire_time: null,
        days_left: 0
      },
      packages: [],
      selectedPackage: 2, // 默认选中白银会员
      loading: false
    }
  },
  
  onLoad() {
    this.checkLoginStatus()
    this.loadPackages()
    this.loadVipStatus()
  },
  
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    checkLoginStatus() {
      const token = uni.getStorageSync('token')
      const userInfo = uni.getStorageSync('userInfo')
      if (token && userInfo) {
        this.isLogin = true
        this.userInfo = userInfo
      }
    },
    
    async loadPackages() {
      try {
        const res = await uni.request({
          url: '/api/vip/packages',
          method: 'GET'
        })
        if (res.data.code === 0) {
          this.packages = res.data.data.list
        }
      } catch (e) {
        console.error('加载套餐失败:', e)
        // 使用默认套餐
        this.packages = [
          { id: 1, level: 1, name: '青铜会员', months: 1, price: 9.9, gems_bonus: 0, discount: 0 },
          { id: 2, level: 2, name: '白银会员', months: 3, price: 25.9, gems_bonus: 50, discount: 0.1 },
          { id: 3, level: 3, name: '黄金会员', months: 12, price: 89.9, gems_bonus: 200, discount: 0.2 }
        ]
      }
    },
    
    async loadVipStatus() {
      if (!this.isLogin) return
      
      try {
        const res = await uni.request({
          url: '/api/vip/status',
          method: 'GET',
          header: { Authorization: `Bearer ${uni.getStorageSync('token')}` }
        })
        if (res.data.code === 0) {
          this.vipStatus = res.data.data
        }
      } catch (e) {
        console.error('加载VIP状态失败:', e)
      }
    },
    
    selectPackage(id) {
      this.selectedPackage = id
    },
    
    async handleOpenVip() {
      if (!this.isLogin) {
        uni.navigateTo({ url: '/pages/login/index' })
        return
      }
      
      if (!this.selectedPackage) return
      
      this.loading = true
      
      try {
        // 创建订单
        const res = await uni.request({
          url: '/api/vip/order',
          method: 'POST',
          header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
          data: { package_id: this.selectedPackage }
        })
        
        if (res.data.code === 0) {
          const orderData = res.data.data
          uni.showToast({ title: '订单创建成功', icon: 'success' })
          
          // TODO: 调用微信支付
          // 微信支付实现后，跳转到支付
          setTimeout(() => {
            uni.showModal({
              title: '支付提示',
              content: `订单号: ${orderData.order_no}\n金额: ¥${orderData.amount}\n\n微信支付功能即将上线`,
              showCancel: false
            })
          }, 1500)
        } else {
          uni.showToast({ title: res.data.message || '创建订单失败', icon: 'none' })
        }
      } catch (e) {
        console.error('开通VIP失败:', e)
        uni.showToast({ title: '开通失败，请重试', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${date.getFullYear()}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    }
  }
}
</script>

<style lang="scss" lang="scss">
@import '@/styles/variables.scss';

.vip-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding-bottom: 40rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx $page-padding-h 20rpx;
  
  .nav-back {
    font-size: 40rpx;
    color: #fff;
  }
  
  .nav-title {
    font-size: $font-size-lg;
    color: #fff;
    font-weight: $font-weight-semibold;
  }
  
  .nav-right {
    width: 60rpx;
  }
}

.user-status {
  margin: 30rpx $page-padding-h;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  backdrop-filter: blur(10px);
  
  .user-info {
    display: flex;
    align-items: center;
    
    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      
      &.placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36rpx;
        color: #fff;
      }
    }
    
    .info {
      margin-left: 20rpx;
      
      .nickname {
        display: block;
        font-size: $font-size-base;
        color: #fff;
        font-weight: $font-weight-medium;
      }
      
      .vip-badge {
        display: inline-block;
        margin-top: 8rpx;
        padding: 4rpx 16rpx;
        font-size: $font-size-xs;
        color: #FFD700;
        background: rgba(255, 215, 0, 0.2);
        border-radius: 20rpx;
        
        &.normal {
          color: #999;
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }
  }
  
  .vip-expiry {
    display: flex;
    justify-content: space-between;
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid rgba(255, 255, 255, 0.1);
    font-size: $font-size-sm;
    color: rgba(255, 255, 255, 0.7);
    
    .days-left {
      color: #FFD700;
    }
  }
}

.privileges-section {
  margin: 40rpx $page-padding-h;
  
  .section-title {
    font-size: $font-size-lg;
    color: #fff;
    font-weight: $font-weight-semibold;
    margin-bottom: 20rpx;
  }
  
  .privileges-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
    
    .privilege-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30rpx 20rpx;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16rpx;
      
      .icon {
        font-size: 48rpx;
        margin-bottom: 12rpx;
      }
      
      .label {
        font-size: $font-size-sm;
        color: #fff;
        font-weight: $font-weight-medium;
      }
      
      .desc {
        font-size: $font-size-xs;
        color: rgba(255, 255, 255, 0.6);
        margin-top: 6rpx;
      }
    }
  }
}

.packages-section {
  margin: 40rpx $page-padding-h;
  
  .section-title {
    font-size: $font-size-lg;
    color: #fff;
    font-weight: $font-weight-semibold;
    margin-bottom: 20rpx;
  }
  
  .packages-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }
  
  .package-card {
    position: relative;
    padding: 30rpx;
    background: rgba(255, 255, 255, 0.08);
    border: 2rpx solid rgba(255, 255, 255, 0.1);
    border-radius: 20rpx;
    transition: all 0.3s ease;
    
    &.selected {
      border-color: #FFD700;
      background: rgba(255, 215, 0, 0.1);
    }
    
    &.popular {
      border-color: #FF6B6B;
      background: rgba(255, 107, 107, 0.1);
    }
    
    .popular-tag {
      position: absolute;
      top: -12rpx;
      left: 50%;
      transform: translateX(-50%);
      padding: 6rpx 24rpx;
      font-size: $font-size-xs;
      color: #fff;
      background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
      border-radius: 20rpx;
    }
    
    .package-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .package-name {
        font-size: $font-size-base;
        color: #fff;
        font-weight: $font-weight-semibold;
      }
      
      .package-badges {
        display: flex;
        gap: 10rpx;
        
        .badge {
          padding: 4rpx 12rpx;
          font-size: $font-size-xs;
          border-radius: 8rpx;
          
          &.gems {
            color: #87CEEB;
            background: rgba(135, 206, 235, 0.2);
          }
          
          &.discount {
            color: #98FB98;
            background: rgba(152, 251, 152, 0.2);
          }
        }
      }
    }
    
    .package-price {
      margin-top: 16rpx;
      display: flex;
      align-items: baseline;
      
      .price {
        font-size: 48rpx;
        color: #FFD700;
        font-weight: $font-weight-bold;
      }
      
      .unit {
        margin-left: 8rpx;
        font-size: $font-size-sm;
        color: rgba(255, 255, 255, 0.6);
      }
    }
    
    .package-original {
      margin-top: 4rpx;
      font-size: $font-size-sm;
      color: rgba(255, 255, 255, 0.4);
      text-decoration: line-through;
    }
    
    .package-features {
      margin-top: 16rpx;
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
      
      .feature {
        font-size: $font-size-xs;
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }
}

.action-section {
  margin: 40rpx $page-padding-h 0;
  
  .btn-open {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 96rpx;
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    border: none;
    border-radius: 48rpx;
    font-size: $font-size-lg;
    color: #1a1a2e;
    font-weight: $font-weight-bold;
    
    &.disabled {
      background: rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.4);
    }
    
    &::after { border: none; }
    
    .spinner {
      width: 40rpx;
      height: 40rpx;
      border: 4rpx solid rgba(26, 26, 46, 0.3);
      border-top-color: #1a1a2e;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }
  
  .agreement {
    display: block;
    margin-top: 20rpx;
    text-align: center;
    font-size: $font-size-xs;
    color: rgba(255, 255, 255, 0.5);
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
