// pages/message/message.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    hasUnreadChat: true,
    hasUnreadNotification: true,
    chatMessages: [],
    notifications: []
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
    const { id } = e.currentTarget.dataset;
    // 在实际应用中，这里应该根据消息的id获取对应的用户id，然后跳转到聊天页面
    const message = this.data.chatMessages.find(msg => msg.id === id);
    
    if (!message) return;
    
    // 更新消息为已读状态
    const updatedMessages = this.data.chatMessages.map(msg => {
      if (msg.id === id) {
        return { ...msg, unread: 0 };
      }
      return msg;
    });
    
    this.setData({
      chatMessages: updatedMessages
    });
    
    // 检查是否还有未读消息
    this.checkUnreadStatus();
    
    // 跳转到聊天页面
    wx.navigateTo({
      url: `/pages/chat/chat?userId=${id}`
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