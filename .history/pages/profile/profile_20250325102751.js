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
	
	onShow() {
		// 检查登录状态
    if (!app.checkLoginStatus(() => {
			this.setData({
				userInfo: app.globalData.userInfo
			})
    })) {
      return;
    }
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
  
  // 选择并上传头像
  chooseAvatar() {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'back',
      success: function(res) {
        console.log('选择照片成功', res);
        const tempFilePath = res.tempFiles[0].tempFilePath;
        wx.showLoading({
          title: '上传中...',
          mask: true
        });
        that.uploadAvatar(tempFilePath);
      },
      fail: function(error) {
        console.error('选择照片失败', error);
        wx.showToast({
          title: '选择照片失败',
          icon: 'none'
        });
      }
    });
    this.setData({
      showAvatarPreview: false // 关闭预览弹窗
    });
  },
  
  // 上传头像
  uploadAvatar(filePath) {
    console.log("上传头像中")
    
    publish.uploadImageApi({
      path: filePath,
      type: 'avatar'
    }).then(url => {
      console.log("头像地址：", url)
      // 更新本地头像
      const userInfo = { ...this.data.userInfo };
      userInfo.avatar = url;
      
      this.setData({
        userInfo: userInfo,
        showAvatarPreview: false // 关闭预览弹窗
      });
      
      // 更新全局数据和本地存储
      app.globalData.userInfo = userInfo;
      wx.setStorageSync('userInfo', userInfo);
      
      // 调用API更新用户信息
      return user.updateUserInfoApi(userInfo);
    }).then(res => {
      console.log("更新成功", res);
      wx.showToast({
        title: '头像更新成功',
        icon: 'success',
        duration: 2000
      });
    }).catch(error => {
      console.error("操作失败", error);
      wx.showToast({
        title: '操作失败',
        icon: 'none',
        duration: 2000
      });
    }).finally(() => {
      wx.hideLoading();
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
  
  // 跳转到关注/粉丝/互关列表页面
  navigateToFollowers: function(e) {
    const tab = e.currentTarget.dataset.tab || 0;
    wx.navigateTo({
      url: `/pages/followers/followers?tab=${tab}`
    });
	},
	
	//跳转到编辑信息页面
	navigateToUserSetting(e) {
    wx.navigateTo({
      url: 'pages/userSetting/userSetting'
    })
  },
}) 