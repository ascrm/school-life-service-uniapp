const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const app = getApp()

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    hasUserInfo: false,
    userStats: {
      posts: 3,
      likes: 12,
      following: 28,
      followers: 6
    },
    notifications: 5
  },
  
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        
        // 保存到全局数据
        app.globalData.userInfo = res.userInfo
      }
    })
  },
  
  navigateTo(e) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url
    })
  },
  
  onLoad() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }
  },
  
  onShow() {
    const app = getApp();
    this.setData({
      isLoggedIn: app.globalData.isLoggedIn,
      userInfo: app.globalData.userInfo
    });
  },
  
  // 登录按钮点击
  handleLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },
  
  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.logout();
          
          this.setData({
            isLoggedIn: false,
            userInfo: null
          });
        }
      }
    });
  },
}) 