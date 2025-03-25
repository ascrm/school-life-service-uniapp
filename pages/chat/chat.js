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
		console.log("你无敌了")
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
			setData({
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
    
    const newMessage = {
      id: Date.now().toString(),
      senderId: this.data.currentUser.id,
      content: this.data.inputContent,
      type: 'text',
      timestamp: new Date().getTime(),
      status: 'sending'
    };
    
    const messages = [...this.data.messages, newMessage];
    
    this.setData({
      messages,
      inputContent: ''
    });
    
    // 模拟发送消息
    setTimeout(() => {
      const updatedMessages = this.data.messages.map(msg => {
        if (msg.id === newMessage.id) {
          return { ...msg, status: 'sent' };
        }
        return msg;
      });
      
      this.setData({
        messages: updatedMessages
      });
    }, 500);
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