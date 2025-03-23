const app = getApp();

Page({
  data: {
    errandList: [],  // 跑腿订单列表
    tabs: [
      { value: 0, label: '全部' },
      { value: 1, label: '我的发布' },
      { value: 2, label: '我的接单' }
    ],
    currentTab: 0,
    loading: false,
    hasMore: true,
    isEmpty: false,
    page: 1,
    pageSize: 10
  },

  onLoad: function (options) {
    console.log('跑腿代取页面加载');
    this.loadErrandList();
  },

  onPullDownRefresh: function () {
    this.refreshList();
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreErrand();
    }
  },

  // 标签切换事件
  onTabChange: function (e) {
    const currentTab = e.detail.value;
    
    this.setData({ 
      currentTab,
      errandList: [],
      page: 1,
      hasMore: true
    });
    
    this.loadErrandList();
  },

  // 加载跑腿列表
  loadErrandList: function () {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    // 模拟API返回的数据
    setTimeout(() => {
      const mockData = this.getMockData();
      
      this.setData({
        errandList: mockData,
        loading: false,
        isEmpty: mockData.length === 0,
        hasMore: mockData.length >= this.data.pageSize
      });
      
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 刷新列表
  refreshList: function () {
    this.setData({
      page: 1,
      errandList: []
    });
    
    this.loadErrandList();
  },

  // 加载更多
  loadMoreErrand: function () {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({
      loading: true,
      page: this.data.page + 1
    });
    
    // 模拟API返回的数据
    setTimeout(() => {
      const mockData = this.getMockData();
      
      this.setData({
        errandList: [...this.data.errandList, ...mockData],
        loading: false,
        hasMore: mockData.length >= this.data.pageSize
      });
    }, 1000);
  },

  // 获取模拟数据
  getMockData: function () {
    const { currentTab, page } = this.data;
    
    // 根据当前标签页和页码生成不同的模拟数据
    const mockErrandList = [];
    
    for (let i = 0; i < 10; i++) {
      const id = (page - 1) * 10 + i + 1;
      
      mockErrandList.push({
        id,
        title: `跑腿订单 #${id}`,
        type: i % 3 === 0 ? '取快递' : i % 3 === 1 ? '买饭' : '其他',
        status: i % 4 === 0 ? '待接单' : i % 4 === 1 ? '进行中' : i % 4 === 2 ? '已完成' : '已取消',
        price: Number((Math.floor(Math.random() * 50) + 5).toFixed(2)),
        location: '校园主教学楼',
        destination: '6号宿舍楼',
        createTime: '2023-03-15 14:30',
        deadlineTime: '2023-03-15 18:00',
        description: '帮忙从快递点取一个小包裹，大约一斤重，送到6号宿舍楼302室。',
        publisher: {
          id: 100 + i,
          name: `用户${100 + i}`,
          avatar: '/images/default-avatar.png'
        }
      });
    }
    
    // 根据标签筛选数据
    if (currentTab === 1) {
      // 我的发布
      return mockErrandList.filter(item => item.publisher.id % 2 === 0);
    } else if (currentTab === 2) {
      // 我的接单
      return mockErrandList.filter(item => item.status === '进行中' || item.status === '已完成');
    }
    
    return mockErrandList;
  },

  // 发布新的跑腿订单
  publishErrand: function () {
    wx.navigateTo({
      url: '/pages/service/errand/publish/publish'
    });
  },

  // 查看订单详情
  viewErrandDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    
    wx.navigateTo({
      url: `/pages/service/errand/detail/detail?id=${id}`
    });
  },

  // 接单
  takeErrand: function (e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '接单确认',
      content: '确定要接此跑腿单吗？接单后请及时联系发布者并在规定时间内完成任务。',
      success: (res) => {
        if (res.confirm) {
          // 模拟接单成功
          wx.showToast({
            title: '接单成功',
            icon: 'success'
          });
          
          // 更新订单状态
          const errandList = this.data.errandList.map(item => {
            if (item.id === id) {
              return {
                ...item,
                status: '进行中'
              };
            }
            return item;
          });
          
          this.setData({ errandList });
        }
      }
    });
  }
}); 