// pages/message/message.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    hasUnreadChat: true,
    hasUnreadNotification: true,
    chatMessages: [
      {
        id: '1',
        avatar: '/images/avatars/avatar1.jpg',
        name: '李同学',
        lastMessage: '好的，我明天把书带过来',
        time: '10:30',
        unread: 2
      },
      {
        id: '2',
        avatar: '/images/avatars/avatar2.jpg',
        name: '王老师',
        lastMessage: '请各位同学准时提交作业',
        time: '昨天',
        unread: 0
      },
      {
        id: '3',
        avatar: '/images/avatars/avatar3.jpg',
        name: '张同学',
        lastMessage: '你好，我想问一下关于社团活动的事',
        time: '昨天',
        unread: 1
      },
      {
        id: '4',
        avatar: '/images/avatars/avatar4.jpg',
        name: '校园跑腿',
        lastMessage: '您的订单已送达，请及时取件',
        time: '周一',
        unread: 0
      },
      {
        id: '5',
        avatar: '/images/avatars/avatar5.jpg',
        name: '学习小组',
        lastMessage: '明天下午3点图书馆集合，别忘了带资料',
        time: '周日',
        unread: 0
      }
    ],
    notifications: [
      {
        id: '1',
        icon: 'notification',
        title: '系统公告',
        content: '校园生活服务小程序正式上线了！',
        time: '刚刚',
        read: false
      },
      {
        id: '2',
        icon: 'shop',
        title: '订单提醒',
        content: '您的跑腿订单已完成，请评价！',
        time: '1小时前',
        read: false
      },
      {
        id: '3',
        icon: 'heart',
        title: '点赞通知',
        content: '李同学赞了你的动态',
        time: '昨天',
        read: true
      },
      {
        id: '4',
        icon: 'comment',
        title: '评论通知',
        content: '王同学评论了你的二手商品：价格可以再便宜点吗？',
        time: '3天前',
        read: true
      },
      {
        id: '5',
        icon: 'calendar',
        title: '活动提醒',
        content: '你报名参加的校园歌手大赛将于明天开始',
        time: '5天前',
        read: true
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.checkUnreadStatus();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 检查是否有未读消息
  checkUnreadStatus() {
    const hasUnreadChat = this.data.chatMessages.some(item => item.unread > 0);
    const hasUnreadNotification = this.data.notifications.some(item => !item.read);
    this.setData({
      hasUnreadChat,
      hasUnreadNotification
    });
  },

  // 切换标签页
  onTabsChange(e) {
    this.setData({
      currentTab: e.detail.value
    });
  },

  // 导航到聊天详情
  navigateToChat(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../chat/chat?id=${id}`
    });
    
    // 更新已读状态
    const chatMessages = this.data.chatMessages.map(item => {
      if (item.id === id) {
        return { ...item, unread: 0 };
      }
      return item;
    });
    
    this.setData({ chatMessages }, () => {
      this.checkUnreadStatus();
    });
  },

  // 查看通知详情
  viewNotification(e) {
    const id = e.currentTarget.dataset.id;
    
    // 更新已读状态
    const notifications = this.data.notifications.map(item => {
      if (item.id === id) {
        return { ...item, read: true };
      }
      return item;
    });
    
    this.setData({ notifications }, () => {
      this.checkUnreadStatus();
    });
    
    // 视情况可以跳转到详情页
    wx.navigateTo({
      url: `../notification/detail?id=${id}`
    });
  },

  // 标记所有为已读
  markAllAsRead() {
    if (this.data.currentTab === 0) {
      // 标记所有聊天消息为已读
      const chatMessages = this.data.chatMessages.map(item => {
        return { ...item, unread: 0 };
      });
      this.setData({ chatMessages, hasUnreadChat: false });
    } else {
      // 标记所有系统通知为已读
      const notifications = this.data.notifications.map(item => {
        return { ...item, read: true };
      });
      this.setData({ notifications, hasUnreadNotification: false });
    }
  },

  // 发起新聊天
  startNewChat() {
    wx.navigateTo({
      url: '../contacts/contacts'
    });
  }
})