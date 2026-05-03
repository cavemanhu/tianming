<template>
  <view class="profile-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <text class="nav-title">个人中心</text>
      <view class="nav-settings" @tap="goToSettings">
        <text>⚙️</text>
      </view>
    </view>

    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info" @tap="goToEditProfile">
        <view class="avatar-wrapper">
          <image 
            v-if="userStore.avatar" 
            :src="userStore.avatar" 
            class="avatar" 
            mode="aspectFill"
          />
          <view v-else class="avatar-placeholder">
            <text class="avatar-text">{{ avatarText }}</text>
          </view>
          <view class="avatar-edit">
            <text>✏️</text>
          </view>
        </view>
        <view class="user-detail">
          <view class="nickname-row">
            <text class="nickname">{{ userStore.nickname }}</text>
            <LevelBadge :level="userStore.level" />
          </view>
          <text class="user-id">ID: {{ userId }}</text>
        </view>
        <text class="arrow">→</text>
      </view>
      
      <!-- 用户统计 -->
      <view class="user-stats">
        <view class="stat-item" @tap="goToHistory">
          <text class="stat-value">{{ stats.predictCount }}</text>
          <text class="stat-label">测算次数</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item" @tap="goToInvitations">
          <text class="stat-value">{{ stats.inviteCount }}</text>
          <text class="stat-label">邀请好友</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.freeCount }}</text>
          <text class="stat-label">剩余次数</text>
        </view>
      </view>
    </view>

    <!-- VIP会员卡 -->
    <view class="vip-card" v-if="!userStore.isVip" @tap="goToVip">
      <view class="vip-info">
        <text class="vip-icon">👑</text>
        <view class="vip-text">
          <text class="vip-title">开通VIP会员</text>
          <text class="vip-desc">解锁无限算命 + 专属功能</text>
        </view>
      </view>
      <view class="vip-action">
        <text>立即开通 →</text>
      </view>
    </view>
    
    <view class="vip-card vip-active" v-else>
      <view class="vip-info">
        <text class="vip-icon">👑</text>
        <view class="vip-text">
          <text class="vip-title">VIP会员</text>
          <text class="vip-desc">到期时间: {{ vipExpireDate }}</text>
        </view>
      </view>
      <view class="vip-action">
        <text>续费 →</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="section-title">
        <text>功能</text>
      </view>
      <view class="menu-list">
        <view class="menu-item" @tap="goToHistory">
          <text class="menu-icon">📜</text>
          <text class="menu-text">历史记录</text>
          <text class="menu-badge" v-if="stats.predictCount > 0">{{ stats.predictCount }}</text>
          <text class="menu-arrow">→</text>
        </view>
        <view class="menu-item" @tap="goToFavorites">
          <text class="menu-icon">⭐</text>
          <text class="menu-text">我的收藏</text>
          <text class="menu-arrow">→</text>
        </view>
        <view class="menu-item" @tap="goToInvitations">
          <text class="menu-icon">🎁</text>
          <text class="menu-text">邀请好友</text>
          <text class="menu-arrow">→</text>
        </view>
        <view class="menu-item" @tap="goToVip">
          <text class="menu-icon">👑</text>
          <text class="menu-text">会员中心</text>
          <text class="menu-arrow">→</text>
        </view>
      </view>
    </view>

    <!-- 设置菜单 -->
    <view class="menu-section">
      <view class="section-title">
        <text>设置</text>
      </view>
      <view class="menu-list">
        <view class="menu-item" @tap="goToEditProfile">
          <text class="menu-icon">✏️</text>
          <text class="menu-text">编辑资料</text>
          <text class="menu-arrow">→</text>
        </view>
        <view class="menu-item" @tap="goToSettings">
          <text class="menu-icon">⚙️</text>
          <text class="menu-text">应用设置</text>
          <text class="menu-arrow">→</text>
        </view>
        <view class="menu-item" @tap="goToAbout">
          <text class="menu-icon">ℹ️</text>
          <text class="menu-text">关于我们</text>
          <text class="menu-arrow">→</text>
        </view>
        <view class="menu-item" @tap="goToHelp">
          <text class="menu-icon">❓</text>
          <text class="menu-text">帮助与反馈</text>
          <text class="menu-arrow">→</text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section" v-if="userStore.isLogin">
      <button class="btn-logout" @tap="handleLogout">退出登录</button>
    </view>

    <!-- 登录按钮 -->
    <view class="login-section" v-else>
      <button class="btn-login" @tap="goToLogin">登录/注册</button>
    </view>

    <!-- 版本信息 -->
    <view class="version-info">
      <text>V1.0.0</text>
    </view>
  </view>
</template>

<script>
import { useUserStore } from '@/store/user'
import LevelBadge from '@/components/LevelBadge/LevelBadge.vue'

export default {
  components: {
    LevelBadge
  },
  
  data() {
    return {
      stats: {
        predictCount: 0,
        inviteCount: 0,
        freeCount: 0
      },
      vipExpireDate: '2026-12-31',
      userId: '10001'
    }
  },
  
  computed: {
    userStore() {
      return useUserStore()
    },
    
    avatarText() {
      const nickname = this.userStore.nickname || '游'
      return nickname.charAt(0).toUpperCase()
    }
  },
  
  onShow() {
    this.checkLogin()
    this.loadUserStats()
  },
  
  methods: {
    checkLogin() {
      this.userStore.checkLogin()
    },
    
    async loadUserStats() {
      try {
        // 从用户信息获取基本统计
        const userStore = useUserStore()
        if (userStore.isLogin) {
          const { getUserInfo } = require('@/services/user')
          const res = await getUserInfo()
          if (res.code === 0 && res.data) {
            this.stats = {
              predictCount: res.data.predict_count || 0,
              inviteCount: res.data.invite_count || 0,
              freeCount: res.data.free_count || 0
            }
            // 缓存
            uni.setStorageSync('user_stats', this.stats)
          }
        }
      } catch (e) {
        console.error('Load user stats failed:', e)
        // 使用缓存
        const cached = uni.getStorageSync('user_stats')
        if (cached) {
          this.stats = cached
        }
      }
    },
    
    goToLogin() {
      uni.navigateTo({ url: '/pages/login/index' })
    },
    
    goToEditProfile() {
      if (!this.userStore.isLogin) {
        this.goToLogin()
        return
      }
      uni.showToast({ title: '功能开发中', icon: 'none' })
    },
    
    goToHistory() {
      uni.switchTab({ url: '/pages/history/index' })
    },
    
    goToFavorites() {
      uni.showToast({ title: '功能开发中', icon: 'none' })
    },
    
    goToInvitations() {
      if (!this.userStore.isLogin) {
        this.goToLogin()
        return
      }
      uni.navigateTo({ url: '/pages/invite/index' })
    },
    
    goToVip() {
      uni.navigateTo({ url: '/pages/vip/index' })
    },
    
    goToSettings() {
      uni.showToast({ title: '功能开发中', icon: 'none' })
    },
    
    goToAbout() {
      uni.showToast({ title: '功能开发中', icon: 'none' })
    },
    
    goToHelp() {
      uni.showToast({ title: '功能开发中', icon: 'none' })
    },
    
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: async (res) => {
          if (res.confirm) {
            await this.userStore.logout()
            uni.showToast({ title: '已退出登录', icon: 'success' })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.profile-page {
  min-height: 100vh;
  background: $color-bg-primary;
  padding-bottom: 120rpx;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 80rpx $page-padding-h 32rpx;
  
  .nav-title {
    font-size: $font-size-xl;
    color: $color-text-primary;
    font-weight: $font-weight-semibold;
  }
  
  .nav-settings {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36rpx;
  }
}

.user-card {
  margin: 0 $page-padding-h 24rpx;
  padding: 32rpx;
  background: $color-bg-card;
  border-radius: $border-radius-lg;
  border: 1rpx solid $color-border;
  
  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;
    
    .avatar-wrapper {
      position: relative;
      margin-right: 24rpx;
      
      .avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 60rpx;
      }
      
      .avatar-placeholder {
        width: 120rpx;
        height: 120rpx;
        border-radius: 60rpx;
        background: linear-gradient(135deg, $color-accent 0%, #FFA500 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        
        .avatar-text {
          font-size: 48rpx;
          color: #000;
          font-weight: $font-weight-bold;
        }
      }
      
      .avatar-edit {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 40rpx;
        height: 40rpx;
        background: $color-bg-hover;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20rpx;
      }
    }
    
    .user-detail {
      flex: 1;
      
      .nickname-row {
        display: flex;
        align-items: center;
        gap: 12rpx;
        margin-bottom: 8rpx;
        
        .nickname {
          font-size: $font-size-xl;
          color: $color-text-primary;
          font-weight: $font-weight-semibold;
        }
      }
      
      .user-id {
        font-size: $font-size-xs;
        color: $color-text-tertiary;
      }
    }
    
    .arrow {
      font-size: $font-size-base;
      color: $color-text-tertiary;
    }
  }
  
  .user-stats {
    display: flex;
    justify-content: space-around;
    padding-top: 24rpx;
    border-top: 1rpx solid $color-border-light;
    
    .stat-item {
      text-align: center;
      
      .stat-value {
        display: block;
        font-size: $font-size-xl;
        color: $color-accent;
        font-weight: $font-weight-bold;
      }
      
      .stat-label {
        font-size: $font-size-xs;
        color: $color-text-tertiary;
        margin-top: 4rpx;
      }
    }
    
    .stat-divider {
      width: 1rpx;
      height: 60rpx;
      background: $color-border-light;
    }
  }
}

.vip-card {
  margin: 0 $page-padding-h 24rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, rgba(#FFD700, 0.1) 0%, rgba(#FFA500, 0.1) 100%);
  border-radius: $border-radius-base;
  border: 1rpx solid rgba(#FFD700, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .vip-info {
    display: flex;
    align-items: center;
    gap: 16rpx;
    
    .vip-icon {
      font-size: 48rpx;
    }
    
    .vip-text {
      .vip-title {
        display: block;
        font-size: $font-size-base;
        color: $color-accent;
        font-weight: $font-weight-semibold;
      }
      
      .vip-desc {
        display: block;
        font-size: $font-size-xs;
        color: $color-text-secondary;
        margin-top: 4rpx;
      }
    }
  }
  
  .vip-action {
    text {
      font-size: $font-size-sm;
      color: $color-accent;
    }
  }
  
  &.vip-active {
    background: linear-gradient(135deg, rgba(#FFD700, 0.2) 0%, rgba(#FFA500, 0.2) 100%);
    border-color: rgba(#FFD700, 0.5);
  }
}

.menu-section {
  margin-bottom: 24rpx;
  
  .section-title {
    padding: 0 $page-padding-h;
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin-bottom: 12rpx;
    
    text::before {
      content: '';
      display: inline-block;
      width: 6rpx;
      height: 20rpx;
      background: $color-accent;
      margin-right: 12rpx;
      border-radius: 3rpx;
      vertical-align: middle;
    }
  }
  
  .menu-list {
    margin: 0 $page-padding-h;
    background: $color-bg-card;
    border-radius: $border-radius-base;
    border: 1rpx solid $color-border;
    overflow: hidden;
    
    .menu-item {
      display: flex;
      align-items: center;
      padding: 28rpx 24rpx;
      border-bottom: 1rpx solid $color-border-light;
      
      &:last-child {
        border-bottom: none;
      }
      
      .menu-icon {
        font-size: 40rpx;
        margin-right: 20rpx;
      }
      
      .menu-text {
        flex: 1;
        font-size: $font-size-base;
        color: $color-text-primary;
      }
      
      .menu-badge {
        padding: 4rpx 12rpx;
        background: rgba($color-accent, 0.1);
        border-radius: $border-radius-full;
        font-size: $font-size-xs;
        color: $color-accent;
        margin-right: 16rpx;
      }
      
      .menu-arrow {
        font-size: $font-size-base;
        color: $color-text-tertiary;
      }
      
      &:active {
        background: $color-bg-hover;
      }
    }
  }
}

.logout-section,
.login-section {
  margin: 48rpx $page-padding-h;
  
  .btn-logout,
  .btn-login {
    width: 100%;
    height: 96rpx;
    border-radius: 48rpx;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &::after { border: none; }
  }
  
  .btn-logout {
    background: transparent;
    border: 1rpx solid $color-error;
    color: $color-error;
  }
  
  .btn-login {
    background: linear-gradient(135deg, $color-accent 0%, #FFA500 100%);
    color: #000;
    font-weight: $font-weight-semibold;
  }
}

.version-info {
  text-align: center;
  padding: 32rpx;
  
  text {
    font-size: $font-size-xs;
    color: $color-text-tertiary;
  }
}
</style>