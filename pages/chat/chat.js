const app = getApp();
const {user,chat} = require('../../api/index')

Page({
  data: {
    // 聊天对象信息
    targetUser: null,
    // 当前用户信息
    currentUser: null,
    // 消息列表
    messages: [],
    // 输入框内容
    inputContent: '',
    // 是否可以无限制发送消息
    canSendFreely: false,
    // 消息类型选择菜单是否显示
    showMediaMenu: false,
    // 是否显示表情选择器
    showEmojiPicker: false,
    // 是否显示长按菜单
    showActionMenu: false,
    // 当前长按的消息
    currentMessage: null,
    // 长按菜单选项
    actionMenuItems: [
      { text: '复制', value: 'copy' },
      { text: '删除', value: 'delete' },
      { text: '撤回', value: 'recall' },
    ],
    // 表情列表
    emojiList: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    ],
    // 关注状态
    followStatus: {
      iFollowThem: false,
      theyFollowMe: false
    }
  },

  onLoad: function (options) {
    // 获取目标用户ID
    const targetUserId = options.userId;
    if (!targetUserId) {
      wx.showToast({
        title: '用户不存在',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    // 获取当前用户信息
    this.setData({
      currentUser: app.globalData.userInfo
    });
    
    // 获取目标用户信息
    this.getTargetUserInfo(targetUserId);
    
    // 获取聊天历史
    this.getChatHistory(this.data.currentUser.id,targetUserId);
    
    // 获取关注状态
    this.getFollowStatus(targetUserId);
    
    // 初始化WebSocket连接
    this.initSocketConnection();
  },
  
  /**
   * 初始化WebSocket连接
   */
  initSocketConnection() {
    // 检查WebSocket连接状态
    if (!app.globalData.socketOpen) {
      this.connectSocket(() => {
        console.log('WebSocket连接初始化完成');
      });
    }
  },
  
  onUnload: function() {
    // 页面卸载时，如果没有其他聊天页面，可以关闭WebSocket
    const pages = getCurrentPages();
    const chatPages = pages.filter(page => page.route.includes('pages/chat/chat'));
    
    if (chatPages.length <= 1) {
      // 如果只有当前这一个聊天页面，可以考虑关闭连接
      // 但如果你希望保持长连接以接收通知，则不应关闭
      // app.closeWebSocket();
      
      // 通知服务器用户离开了聊天页面
      if (app.globalData.socketOpen) {
        app.sendSocketMessage({
          type: 'leave_chat',
          userId: this.data.currentUser.id,
          targetId: this.data.targetUser.id
        });
      }
    }
  },
  
  // 获取目标用户信息
  getTargetUserInfo(userId) {
    //发送请求
		user.getUserInfoApi({userId})
		.then((data)=>{
			wx.setNavigationBarTitle({
				title: data.nickName,
			});

			this.setData({
				targetUser: data
			})
		})
  },
  
  // 获取聊天历史
  getChatHistory(userId,receiverId) {
		chat.getHistoryMessageApi({userId,receiverId})
		.then((data)=>{
			this.setData({
				messages: data
			})
		})
  },
  
  // 获取关注状态
  getFollowStatus(targetUserId) {
		user.getFollowStatusApi({userId:targetUserId})
		.then((data)=>{
			this.setData({
				'followStatus.iFollowThem': data.iFollowThem,
				'followStatus.theyFollowMe': data.theyFollowMe,
			})
		})
  },
  
  // 发送消息
  sendMessage() {
    if (!this.data.inputContent.trim()) return;
    
    // 如果不是互关，且已经发送过一条消息，则提示
    if (!this.data.canSendFreely) {
      const myMessages = this.data.messages.filter(msg => 
        msg.senderId === this.data.currentUser.id && 
        !msg.isSystemMessage
      );
      
      if (myMessages.length > 0 && !this.data.followStatus.theyFollowMe) {
        wx.showToast({
          title: '对方未关注你，无法发送更多消息',
          icon: 'none'
        });
        return;
      }
    }
    
    // 构建消息对象
    const newMessage = {
      senderId: this.data.currentUser.id,
      receiverId: this.data.targetUser.id,
      content: this.data.inputContent,
			type: 1,
    };
    
    // 先在本地添加消息，显示发送中状态
    const messages = [...this.data.messages, newMessage];
    this.setData({
      messages,
      inputContent: ''
    });
    
    // 滚动到底部
    this.scrollToBottom();
    
    // 检查WebSocket连接状态
    if (this.isSocketOpen()) {
      // 通过WebSocket发送消息
      this.sendSocketMessage(newMessage);
    } else {
      // WebSocket未连接，尝试重新连接
      this.connectSocket(() => {
        this.sendSocketMessage(newMessage);
      });
    }
  },
    
  /**
   * 通过WebSocket发送消息
   * @param {Object} message - 要发送的消息对象
   */
  sendSocketMessage(message) {
    const app = getApp();
		
    // 使用app.js中的发送方法
    const isSuccess = app.sendSocketMessage(message);
				
		//发送成功则修改消息状态为已送达
		if(isSuccess){
			const newMessages = cthis.data.messages.map(msg=>{
				if(msg.id===message.id){
					return {...msg, status: 'send'}
				}
			})

			this.setData({
				messages: newMessages
			})
		}else{  
			//如果失败，这里仅考虑因为网络问题websocket断开连接导致的发送失败，不考虑因为后端代码造成的失败

			//如果是因为网络问题导致的失败，那么websocket会尝试重连并重新发送消息;所以消息会一直处于sending的状态，所以不需要处理
		}

		//如果websocket一直没有重连成功，那么
    // 设置一个超时检查，如果一段时间后消息状态仍为sending，则认为发送失败
    setTimeout(() => {
      const currentMsg = this.data.messages.find(msg => msg.id === message.id);
      if (currentMsg && currentMsg.status === 'sending') {
        this.updateMessageStatus(message.id, 'failed');
      }
    }, 10000); // 10秒后检查
  },
  
  /**
   * 处理从WebSocket服务器接收到的消息
   * @param {Object} data - 收到的消息数据
   */
  handleReceivedMessage(data) {
    // 根据消息类型处理
    switch (data.type) {
      case 1: // 接收到新消息
				// 检查是否是当前聊天对象的消息
				console.log("senderId：",data.senderId)
				console.log("targetUserId",this.data.targetUser.id)
        if (data.senderId === this.data.targetUser.id) {
          // 添加到消息列表
          const newMessage = {
            senderId: data.senderId,
            content: data.content,
            type: 1,
          };
          
          this.setData({
            messages: [...this.data.messages, newMessage]
          });
          
          // 滚动到底部
          this.scrollToBottom();
        } else {
          // 不是当前聊天对象的消息，可以显示未读通知
          wx.showToast({
            title: '收到新消息',
            icon: 'none'
          });
        }
        break;
        
      case 'message_ack': // 消息确认送达
        // 更新对应消息的状态为已送达
        if (data.messageId) {
          this.updateMessageStatus(data.messageId, 'sent');
        }
        break;
        
      case 'message_read': // 消息已读通知
        // 更新对应消息的状态为已读
        if (data.messageId) {
          this.updateMessageStatus(data.messageId, 'read');
        }
        break;
        
      case 'typing': // 对方正在输入
        // 可以显示"对方正在输入"的提示
        break;
        
      default:
        console.log('收到未知类型的WebSocket消息', data);
    }
  },
  
  /**
   * 更新消息状态
   * @param {String} messageId - 消息ID
   * @param {String} status - 新状态：sending, sent, read, failed
   */
  updateMessageStatus(messageId, status) {
    const updatedMessages = this.data.messages.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, status };
      }
      return msg;
    });
    
    this.setData({
      messages: updatedMessages
    });
  },
  
  /**
   * 检查WebSocket是否已连接
   * @return {Boolean} 连接状态
   */
  isSocketOpen() {
    return getApp().globalData.socketOpen === true;
	},
	
	  /**
   * 连接WebSocket服务器
   * @param {Function} callback - 连接成功后的回调函数
   */
  connectSocket(callback) {
    const app = getApp();
    
    // 如果已经连接，则直接执行回调
    if (app.globalData.socketOpen) {
      callback && callback();
      return;
    }
    
    // 显示连接中提示
    wx.showLoading({
      title: '连接中...',
    });
    
    // 使用app.js中的WebSocket初始化方法
    app.initWebSocket();
    
    // 设置一个超时检查，确保回调最终会被执行
    setTimeout(() => {
      wx.hideLoading();
      if (app.globalData.socketOpen) {
        callback && callback();
      } else {
        // 连接失败，更新UI
        wx.showToast({
          title: '连接失败，请稍后重试',
          icon: 'none'
        });
      }
    }, 3000);
  },
  
  /**
   * 滚动到消息列表底部
   */
  scrollToBottom() {
    setTimeout(() => {
      wx.createSelectorQuery()
        .select('#message-list')
        .boundingClientRect((rect) => {
          if (rect && rect.height) {
            wx.pageScrollTo({
              scrollTop: rect.height,
              duration: 300
            });
          }
        })
        .exec();
    }, 100);
  },
  
  // 处理输入框内容变化
  onInputChange(e) {
    this.setData({
      inputContent: e.detail.value
    });
  },
  
  // 打开媒体选择菜单
  openMediaMenu() {
    this.setData({
      showMediaMenu: true
    });
  },
  
  // 关闭媒体选择菜单
  closeMediaMenu() {
    this.setData({
      showMediaMenu: false
    });
  },
  
  // 打开表情选择器
  toggleEmojiPicker() {
    this.setData({
      showEmojiPicker: !this.data.showEmojiPicker,
      showMediaMenu: false
    });
  },
  
  // 选择表情
  selectEmoji(e) {
    const emoji = e.currentTarget.dataset.emoji;
    this.setData({
      inputContent: this.data.inputContent + emoji
    });
  },
  
  // 选择并发送图片
  chooseAndSendImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.uploadAndSendMedia(tempFilePath, 'image');
      }
    });
    this.closeMediaMenu();
  },
  
  // 选择并发送视频
  chooseAndSendVideo() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.uploadAndSendMedia(tempFilePath, 'video');
      }
    });
    this.closeMediaMenu();
  },
  
  // 选择并发送文件
  chooseAndSendFile() {
    wx.showToast({
      title: '小程序暂不支持选择文件',
      icon: 'none'
    });
    this.closeMediaMenu();
  },
  
  // 上传并发送媒体文件
  uploadAndSendMedia(filePath, type) {
    const newMessage = {
      id: Date.now().toString(),
      senderId: this.data.currentUser.id,
      content: filePath,
      type: type,
      timestamp: new Date().getTime(),
      status: 'sending'
    };
    
    const messages = [...this.data.messages, newMessage];
    
    this.setData({
      messages
    });
    
    // 模拟上传过程
    wx.showLoading({
      title: '发送中...',
    });
    
    setTimeout(() => {
      wx.hideLoading();
      
      const updatedMessages = this.data.messages.map(msg => {
        if (msg.id === newMessage.id) {
          return { ...msg, status: 'sent' };
        }
        return msg;
      });
      
      this.setData({
        messages: updatedMessages
      });
    }, 1500);
  },
  
  // 处理长按消息
  handleLongPress(e) {
    const messageId = e.currentTarget.dataset.id;
    const message = this.data.messages.find(msg => msg.id === messageId);
    
    if (!message) return;
    
    // 只有自己发送的消息才能执行某些操作
    let actionMenuItems = [...this.data.actionMenuItems];
    if (message.senderId !== this.data.currentUser.id) {
      actionMenuItems = actionMenuItems.filter(item => item.value === 'copy');
    }
    
    this.setData({
      currentMessage: message,
      showActionMenu: true,
      actionMenuItems
    });
  },
  
  // 处理长按菜单选择
  handleActionSelected(e) {
    const action = e.detail.selected.value;
    const message = this.data.currentMessage;
    
    if (!message) return;
    
    switch (action) {
      case 'copy':
        if (message.type === 'text') {
          wx.setClipboardData({
            data: message.content,
            success: () => {
              wx.showToast({ title: '已复制', icon: 'success' });
            }
          });
        }
        break;
      case 'delete':
        this.deleteMessage(message.id);
        break;
      case 'recall':
        this.recallMessage(message.id);
        break;
    }
    
    this.setData({
      showActionMenu: false,
      currentMessage: null
    });
  },
  
  // 删除消息
  deleteMessage(messageId) {
    const updatedMessages = this.data.messages.filter(msg => msg.id !== messageId);
    this.setData({
      messages: updatedMessages
    });
    
    wx.showToast({
      title: '已删除',
      icon: 'success'
    });
  },
  
  // 撤回消息
  recallMessage(messageId) {
    const now = new Date().getTime();
    const message = this.data.messages.find(msg => msg.id === messageId);
    
    // 仅允许2分钟内撤回
    if (now - message.timestamp > 2 * 60 * 1000) {
      wx.showToast({
        title: '超过2分钟的消息无法撤回',
        icon: 'none'
      });
      return;
    }
    
    const updatedMessages = this.data.messages.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          isRecalled: true,
          content: '此消息已撤回',
          originalContent: msg.content
        };
      }
      return msg;
    });
    
    this.setData({
      messages: updatedMessages
    });
    
    wx.showToast({
      title: '已撤回',
      icon: 'success'
    });
  },
  
  // 关注用户
  followUser() {
    wx.showLoading({
      title: '处理中...',
    });
    
    // 模拟API调用
    setTimeout(() => {
      wx.hideLoading();
      
      const newStatus = {
        ...this.data.followStatus,
        iFollowThem: true
      };
      
      this.setData({
        followStatus: newStatus,
        canSendFreely: newStatus.iFollowThem && newStatus.theyFollowMe
      });
      
      wx.showToast({
        title: '已关注',
        icon: 'success'
      });
    }, 800);
  },
  
  // 取消关注用户
  unfollowUser() {
    wx.showLoading({
      title: '处理中...',
    });
    
    // 模拟API调用
    setTimeout(() => {
      wx.hideLoading();
      
      const newStatus = {
        ...this.data.followStatus,
        iFollowThem: false
      };
      
      this.setData({
        followStatus: newStatus,
        canSendFreely: newStatus.iFollowThem && newStatus.theyFollowMe
      });
      
      wx.showToast({
        title: '已取消关注',
        icon: 'success'
      });
    }, 800);
  }
}) 