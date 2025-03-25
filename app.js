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
			
			console.log("登陆成功")
      // 初始化WebSocket连接
      this.initWebSocket();
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
    socketOpen: false,     // WebSocket连接状态
    socketMsgQueue: [],    // 消息队列，存储未发送的消息
    socketTask: null       // WebSocket任务实例
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
    
    // 关闭WebSocket连接
    this.closeWebSocket();
    
    // 清除本地缓存
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('token');
    
    // 提示用户已登出
    wx.showToast({
      title: '已退出登录',
      icon: 'success'
    });
  },

  // WebSocket连接初始化
  initWebSocket() {
    if (this.globalData.socketOpen) return;
    
    const token = wx.getStorageSync('token');
    if (!token) {
      console.log('未登录，不连接WebSocket');
      return;
    }
    
    // 创建WebSocket连接
    const socketTask = wx.connectSocket({
      url: `ws://192.168.31.183:8080/chat/${this.globalData.userInfo.id}`, 
      header: {
        'content-type': 'application/json',
        'Authorization': `${token}`
      },
      success: () => {
        console.log('WebSocket连接创建成功');
      },
      fail: (error) => {
        console.error('WebSocket连接创建失败', error);
      }
    });
    
    this.globalData.socketTask = socketTask;
    
    // 监听WebSocket连接打开事件
    socketTask.onOpen(() => {
      console.log('WebSocket连接已打开');
      this.globalData.socketOpen = true;
      
      // 发送队列中的消息
      this.sendSocketQueue();
      
      // 发送心跳包保持连接
      this.startHeartBeat();
    });
    
    // 监听WebSocket接收到服务器的消息事件
    socketTask.onMessage((res) => {
      console.log('收到WebSocket消息', res);
      try {
        const data = JSON.parse(res.data);
        this.handleSocketMessage(data);
      } catch (error) {
        console.error('解析WebSocket消息失败', error);
      }
    });
    
    // 监听WebSocket错误事件
    socketTask.onError((error) => {
      console.error('WebSocket发生错误', error);
      this.globalData.socketOpen = false;
      this.reconnectWebSocket();
    });
    
    // 监听WebSocket连接关闭事件
    socketTask.onClose(() => {
      console.log('WebSocket连接已关闭');
      this.globalData.socketOpen = false;
      this.reconnectWebSocket();
    });
  },
  
  // 重连WebSocket
  reconnectWebSocket() {
    if (this.reconnecting) return;
    
    this.reconnecting = true;
    console.log('尝试重新连接WebSocket...');
    
    setTimeout(() => {
      this.initWebSocket();
      this.reconnecting = false;
    }, 3000); // 3秒后重连
  },
  
  // 发送WebSocket消息
  sendSocketMessage(msg) {
    if (this.globalData.socketOpen && this.globalData.socketTask) {
      this.globalData.socketTask.send({
        data: JSON.stringify(msg),
        success: () => {
          console.log('WebSocket消息发送成功', msg);
          return true;
        },
        fail: (error) => {
          console.error('WebSocket消息发送失败', error);
          
          // 加入消息队列，等待重连后发送
          this.globalData.socketMsgQueue.push(msg);
          
          // 检查连接状态
          this.checkConnectionStatus(msg);
          
          return false;
        }
      });
    } else {
      // WebSocket未连接，加入队列
      this.globalData.socketMsgQueue.push(msg);
      this.initWebSocket(); // 尝试连接
    }
  },
  
  // 检查连接状态并决定是否需要重连
  checkConnectionStatus(lastFailedMsg) {
    // 如果是第一次发送失败，先不急着重连，可能只是临时问题
    if (!this.failedMessageCount) {
      this.failedMessageCount = 1;
      
      // 设置一个短暂的重试，不立即重连
      setTimeout(() => {
        // 如果消息还在队列中，尝试重新发送
        if (this.globalData.socketMsgQueue.includes(lastFailedMsg)) {
          const index = this.globalData.socketMsgQueue.indexOf(lastFailedMsg);
          if (index > -1) {
            const msgToRetry = this.globalData.socketMsgQueue.splice(index, 1)[0];
            this.sendSocketMessage(msgToRetry);
          }
        }
        
        // 重置失败计数
        this.failedMessageCount = 0;
      }, 2000); // 2秒后重试
      
    } else {
      // 如果连续发送失败，可能连接已经有问题，尝试重连
      this.failedMessageCount++;
      
      if (this.failedMessageCount >= 3) {
        console.log('连续发送失败，尝试重新连接WebSocket');
        this.globalData.socketOpen = false;
        this.reconnectWebSocket();
        this.failedMessageCount = 0;
      }
    }
  },
  
  // 发送消息队列中的消息
  sendSocketQueue() {
    const queue = this.globalData.socketMsgQueue;
    while (queue.length > 0) {
      const msg = queue.shift();
      this.sendSocketMessage(msg);
    }
  },
  
  // 启动心跳检测
  startHeartBeat() {
    this.heartBeatInterval = setInterval(() => {
      if (this.globalData.socketOpen) {
        this.sendSocketMessage({ type: 'ping', timestamp: Date.now() });
      } else {
        clearInterval(this.heartBeatInterval);
      }
    }, 30000); // 每30秒发送一次心跳
  },
  
  // 停止心跳检测
  stopHeartBeat() {
    if (this.heartBeatInterval) {
      clearInterval(this.heartBeatInterval);
    }
  },
  
  // 处理收到的WebSocket消息
  handleSocketMessage(data) {
    // 处理服务器发送的消息
    if (data.type === 'pong') {
      // 心跳响应，不做处理
      return;
    }
    
    // 通知当前页面收到新消息
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    
    if (currentPage && currentPage.handleReceivedMessage) {
      currentPage.handleReceivedMessage(data);
    }
    
    // 如果是聊天消息且不是当前聊天对象的消息，显示小红点或通知
    if (data.type === 'chat_message' && 
        (!currentPage || 
         currentPage.route !== 'pages/chat/chat' || 
         currentPage.data.targetUser.id !== data.senderId)) {
      // 更新未读消息数量并显示通知
      this.updateUnreadMessageCount(data.senderId);
    }
  },
  
  // 更新未读消息数量
  updateUnreadMessageCount(senderId) {
    // 这里可以实现未读消息计数逻辑
    console.log(`收到来自用户${senderId}的新消息`);
    // TODO: 更新未读消息数量，显示小红点等
  },
  
  // 关闭WebSocket连接
  closeWebSocket() {
    if (this.globalData.socketTask && this.globalData.socketOpen) {
      this.globalData.socketTask.close({
        success: () => {
          console.log('WebSocket连接已关闭');
          this.globalData.socketOpen = false;
          this.stopHeartBeat();
        },
        fail: (error) => {
          console.error('关闭WebSocket连接失败', error);
        }
      });
    }
  }
})
