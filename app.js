const { user } = require('./api/index');
// app.js
App({
  onLaunch() {
    // 检查本地缓存中是否有登录信息
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');
		
    if (userInfo && token) {
      this.globalData.userInfo = userInfo;
      this.globalData.isLoggedIn = true;
      
      // 可以在这里验证token有效性
      this.checkTokenValidity(token);
    }

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    
    // 检查更新
    this.checkUpdate()
  },
  
  // 检查小程序更新
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  updateManager.applyUpdate()
                }
              }
            })
          })
        }
      })
    }
  },
	
	//初始化全局变量
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    pendingActions: [],
    hasLogin: false,
    openId: null,
  },

  // 检查token是否有效
  checkTokenValidity(token) {
    // 这里可以调用后端接口验证token
    // 如果无效，清除登录状态
    // wx.request({ ... })
  },

  // 延迟登录检查
  checkLoginStatus(callback = () => {}, skipLogin = false) {

    if (this.globalData.isLoggedIn) {
			// 已登录，直接执行回调
      callback();
      return true;
    } else {
      if (skipLogin) {
				// 跳过登录检查，直接执行回调
        callback();
        return false;
      }
      
			// 获取当前页面路径
			const pages = getCurrentPages();
			const currentPage = pages[pages.length - 1];
			const currentPath = '/' + currentPage.route;
			
      // 未登录，保存待执行的操作，并直接跳转到登录页
      this.globalData.pendingActions.push(callback);
      wx.navigateTo({
        url: `/pages/login/login?redirect=${encodeURIComponent(currentPath)}`
      });
      return false;
    }
  },

  // 登录方法
  login(userInfo) {
		return new Promise((resolve, reject) => {
			// 1. 获取微信临时登录凭证code
			wx.login({
				success: (loginRes) => {
					// 2. 发送code到后端
					wx.request({
						url: 'https://your-api-domain.com/auth/login',
						method: 'POST',
						data: {
							code: loginRes.code,  // 关键参数
							userInfo: userInfo    // 用户授权信息（需按钮触发）
						},
						success: (res) => {
							// 3. 处理后端返回的token
							if (res.data.code === 0) {
								const token = res.data.token;
								
								// 4. 存储到全局和缓存
								this.globalData.userInfo = userInfo;
								this.globalData.isLoggedIn = true;
								wx.setStorageSync('userInfo', userInfo);
								wx.setStorageSync('token', token);
								
								resolve(userInfo);
							} else {
								reject(res.data.msg);
							}
						},
						fail: (err) => {
							reject('网络请求失败');
						}
					});
				},
				fail: () => {
					reject('获取code失败');
				}
			});
		});
	},

  // 登出方法
  logout() {
    this.globalData.userInfo = null;
    this.globalData.isLoggedIn = false;
    
    // 清除本地缓存
    wx.removeStorageSync('userInfo');
    wx.reoveStorageSync('token');
    
    // 提示用户已登出
    wx.showToast({
      title: '已退出登录',
      icon: 'success'
    });
  }
})
