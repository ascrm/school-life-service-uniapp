const app = getApp();

Page({
  data: {
    navHeight: app.globalData.navHeight,
    navTop: app.globalData.navTop,
    windowHeight: app.globalData.windowHeight,
    orders: [],
    page: 1,
    size: 10,
    hasMore: true,
    loading: false,
    tabs: [
      { title: '全部', value: 'all' },
      { title: '我的发布', value: 'my' },
      { title: '我的接单', value: 'taken' },
    ],
    activeTab: 'all',
    refreshing: false,
  },

  onLoad: function() {
    this.loadOrders();
  },

  onShow: function() {
    // 每次显示页面时刷新数据
    this.setData({
      page: 1,
      orders: [],
      hasMore: true
    });
    this.loadOrders();
  },

  onPullDownRefresh: function() {
    this.setData({
      refreshing: true,
      page: 1,
      orders: [],
      hasMore: true
    });
    this.loadOrders().then(() => {
      wx.stopPullDownRefresh();
      this.setData({ refreshing: false });
    });
  },

  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadOrders();
    }
  },

  loadOrders: function() {
    if (!this.data.hasMore || this.data.loading) {
      return Promise.resolve();
    }

    this.setData({ loading: true });
    
    // 模拟加载数据，实际项目中应替换为真实API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        const newOrders = this.getMockOrders();
        
        this.setData({
          orders: [...this.data.orders, ...newOrders],
          page: this.data.page + 1,
          hasMore: newOrders.length === this.data.size,
          loading: false
        });
        
        resolve();
      }, 1000);
    });
  },

  // 模拟订单数据，实际项目中应删除
  getMockOrders: function() {
    const mockData = [];
    const types = ['快递代取', '外卖代取', '文件传递', '校园跑腿'];
    const statuses = ['待接单', '进行中', '已完成'];
    
    const count = Math.min(this.data.size, Math.floor(Math.random() * 5) + 3);
    
    for (let i = 0; i < count; i++) {
      mockData.push({
        id: `order_${Date.now()}_${i}`,
        type: types[Math.floor(Math.random() * types.length)],
        title: `${types[Math.floor(Math.random() * types.length)]}任务`,
        location: '第${Math.floor(Math.random() * 10) + 1}教学楼',
        reward: Math.floor(Math.random() * 20) + 5,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createTime: new Date().toLocaleString(),
        description: '请尽快帮我取快递，地点在学校北门菜鸟驿站，取件码12345，感谢！'
      });
    }
    
    return mockData;
  },

  changeTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab !== this.data.activeTab) {
      this.setData({
        activeTab: tab,
        page: 1,
        orders: [],
        hasMore: true
      });
      this.loadOrders();
    }
  },

  goToDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/service/errand/detail/detail?id=${id}`
    });
  },

  createOrder: function() {
    // 检查是否已登录
    if (!app.globalData.isLoggedIn) {
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/service/errand/create/create'
    });
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  showToast: function(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  }
}); 