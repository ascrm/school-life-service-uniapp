import Toast from 'tdesign-miniprogram/toast/index';
const { user } = require('../../api/index');

Page({
  data: {
    redirectUrl: '',
  },

  onLoad(options) {
  },

  // 获取用户信息
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
				console.log("获取用户信息成功: ",res.userInfo)
        this.handleLogin(res.userInfo);
      },
      fail: (err) => {
        console.error('获取用户信息失败，详细错误：', err);
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
							console.log("登陆成功：",data)
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
							wx.redirectTo({
								url: '/pages/profile/profile'
							}); 
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