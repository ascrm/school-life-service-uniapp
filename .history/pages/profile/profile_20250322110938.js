const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const app = getApp()

const {user,publish} = require("../../api/index")

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
    notifications: 5,
    showAvatarPreview: false // 头像预览弹窗控制
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
  
  // 预览头像
  previewAvatar() {
    if (!this.data.userInfo || !this.data.userInfo.avatar) {
      return;
    }
    
    // 显示头像预览弹窗
    this.setData({
      showAvatarPreview: true
    });
  },
  
  // 关闭头像预览
  closeAvatarPreview() {
    this.setData({
      showAvatarPreview: false
    });
  },
  
  // 选择头像
  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'front',
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        // 显示加载中提示
        wx.showLoading({
          title: '上传中...',
          mask: true
        });
        // 上传头像到服务器
        this.uploadAvatar(tempFilePath);
      }
    });
  },
  
  // 上传头像到服务器
  uploadAvatar(filePath) {
    // 上传单个文件，不需要使用Promise.all
    publish.uploadImageApi({
      path: filePath,
      type: 'image'
    })
      .then(url => {
        console.log("头像地址：", url);
        if (!url) {
          wx.showToast({
            title: '上传失败',
            icon: 'error'
          });
          return;
        }
        
        // 更新本地头像
        const userInfo = { ...this.data.userInfo };
        userInfo.avatar = url;
        
        this.setData({
          userInfo: userInfo,
          showAvatarPreview: false // 关闭预览弹窗
        });
        
        // 更新全局数据
        app.globalData.userInfo = userInfo;
        wx.setStorageSync('userInfo', userInfo);
        
        // 调用更新用户信息API
        return user.updateUserInfoApi(userInfo);
      })
      .then(res => {
        wx.hideLoading();
        wx.showToast({
          title: '头像已更新',
          icon: 'success'
        });
      })
      .catch(err => {
        console.error('更新头像失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '更新失败',
          icon: 'error'
        });
      });
  },
  
  navigateTo(e) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url
    })
  },
  
  onLoad() {
    // 检查登录状态
    if (!app.globalData.isLoggedIn) {
      this.redirectToLogin();
      return;
    }
    
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }
  },
  
  onShow() {
    // 检查登录状态
    if (!app.globalData.isLoggedIn) {
      this.redirectToLogin();
      return;
    }
    
    this.setData({
      isLoggedIn: app.globalData.isLoggedIn,
      userInfo: app.globalData.userInfo
    });
  },
  
  // 重定向到登录页面
  redirectToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
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