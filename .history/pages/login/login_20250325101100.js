import Toast from 'tdesign-miniprogram/toast/index';
const { user } = require('../../api/index');

Page({
  data: {
    redirectUrl: '',
  },

  onLoad(options) {
    // 如果有重定向URL，保存起来
    if (options.redirect) {
      this.setData({
        redirectUrl: decodeURIComponent(options.redirect)
      });
    }
  },

  // 获取用户信息
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.handleLogin(res.userInfo);
      },
      fail: (err) => {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '获取用户信息失败: ' + (err.errMsg || '未知错误'),
          theme: 'error',
        });
      }
    });
  },

  // 处理登录逻辑
  handleLogin(userInfo) {
    // 调用封装的API
    Toast({
      context: this,
      selector: '#t-toast',
      message: '登录中...',
      theme: 'loading',
      direction: 'column',
    });

    // 先获取登录code
    wx.login({
      success: (res) => {
        if (res.code) {
					// 调用登录接口
          user.loginApi(res.code, userInfo)
            .then( (data) => {
							// 登录成功，存储用户信息和token
							wx.setStorageSync('userInfo', data.userVo);
              wx.setStorageSync('token', data.token);
              
              // 更新全局状态
              const app = getApp();
              app.globalData.userInfo = data.userVo;
              app.globalData.isLoggedIn = true;
              
              Toast({
                context: this,
                selector: '#t-toast',
                message: '登录成功',
                theme: 'success',
              });
              
							// 登录成功后跳转
							console.log("准备跳转...");
              if (this.data.redirectUrl) {
                console.log("跳转中。。。")
                // 检查重定向URL是否是tabBar页面
                const tabBarPages = ['/pages/home/home', '/pages/discover/discover', 
                                    '/pages/publish/publish', '/pages/message/message', 
                                    '/pages/profile/profile'];
                
                if (tabBarPages.includes(this.data.redirectUrl)) {
                  wx.switchTab({
                    url: this.data.redirectUrl,
                    success: function() {
                      console.log("切换到标签页成功");
                    },
                    fail: function(err) {
                      console.error("切换到标签页失败", err);
                    }
                  });
                } else {
                  wx.redirectTo({
                    url: this.data.redirectUrl,
                    success: function() {
                      console.log("跳转成功");
                    },
                    fail: function(err) {
                      console.error("跳转失败", err);
                    }
                  });
                }
              } else {
                console.log("没有redirectUrl，跳转到个人中心");
                wx.switchTab({
                  url: '/pages/profile/profile',
                  success: function() {
                    console.log("跳转到个人中心成功");
                  },
                  fail: function(err) {
                    console.error("跳转到个人中心失败", err);
                  }
                });
              }
              
            })
            .catch((err) => {
              console.error('登录失败', err);
              Toast({
                context: this,
                selector: '#t-toast',
                message: '登录失败，请重试',
                theme: 'error',
              });
            });
        } else {
          console.error('获取code失败', res);
          Toast({
            context: this,
            selector: '#t-toast',
            message: '登录失败，请重试',
            theme: 'error',
          });
        }
      },
      fail: (err) => {
        console.error('wx.login调用失败', err);
        Toast({
          context: this,
          selector: '#t-toast',
          message: '登录失败，请重试',
          theme: 'error',
        });
      }
    });
  },

  // 展示手机号登录
  showPhoneLogin() {
    // 这里可以实现手机号登录的逻辑
    wx.showToast({
      title: '手机号登录功能开发中',
      icon: 'none'
    });
  },

  // 跳过登录
  skipLogin() {
    if (this.data.redirectUrl) {
      wx.redirectTo({
        url: this.data.redirectUrl
      });
    } else {
      wx.navigateBack();
    }
  },

  // 查看用户协议
  showUserAgreement() {
    wx.navigateTo({
      url: '/pages/agreement/user'
    });
  },

  // 查看隐私政策
  showPrivacyPolicy() {
    wx.navigateTo({
      url: '/pages/agreement/privacy'
    });
  }
}); 