<script>
export default {
  globalData: {
    userInfo: null,
    token: null,
    apiBaseUrl: 'http://localhost:3000'
  },
  
  onLaunch() {
    // 检查登录状态
    this.checkLoginStatus()
    
    // 获取系统信息
    this.getSystemInfo()
  },
  
  onShow() {
    console.log('App Show')
  },
  
  onHide() {
    console.log('App Hide')
  },
  
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const token = uni.getStorageSync('token')
      const userInfo = uni.getStorageSync('userInfo')
      
      if (token && userInfo) {
        this.globalData.token = token
        this.globalData.userInfo = userInfo
      }
    },
    
    // 获取系统信息
    getSystemInfo() {
      uni.getSystemInfo({
        success: (res) => {
          this.globalData.systemInfo = res
          console.log('System Info:', res)
        }
      })
    },
    
    // 设置登录信息
    setLoginInfo(token, userInfo) {
      this.globalData.token = token
      this.globalData.userInfo = userInfo
      uni.setStorageSync('token', token)
      uni.setStorageSync('userInfo', userInfo)
    },
    
    // 清除登录信息
    clearLoginInfo() {
      this.globalData.token = null
      this.globalData.userInfo = null
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
    },
    
    // 检查登录并跳转
    checkLoginAndNavigate(callback) {
      if (this.globalData.token) {
        callback && callback()
      } else {
        uni.navigateTo({
          url: '/pages/login/index'
        })
      }
    }
  }
}
</script>

<style>
@import '@/styles/variables.scss';

/* 全局样式 */
page {
  background-color: $color-bg-primary;
  color: $color-text-primary;
  font-family: $font-family-base;
}

view, text {
  box-sizing: border-box;
}

/* 消除transition闪烁 */
page, view, text {
  transition: background-color 0.1s ease;
}
</style>