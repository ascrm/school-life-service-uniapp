const app = getApp();

Page({
  data: {
    goodsList: [],     // 商品列表
    categories: [      // 商品分类
      { id: 0, name: '全部' },
      { id: 1, name: '数码电子' },
      { id: 2, name: '生活日用' },
      { id: 3, name: '服装鞋帽' },
      { id: 4, name: '图书教材' },
      { id: 5, name: '运动器材' },
      { id: 6, name: '其他' }
    ],
    tabs: [           // 标签页
      { value: 0, label: '全部' },
      { value: 1, label: '我的发布' },
      { value: 2, label: '我的收藏' }
    ],
    currentTab: 0,     // 当前标签
    currentCategory: 0, // 当前分类
    loading: false,    // 加载状态
    hasMore: true,     // 是否还有更多
    isEmpty: false,    // 是否为空
    page: 1,           // 页码
    pageSize: 10,      // 每页大小
    keyword: ''        // 搜索关键词
  },

  onLoad: function (options) {
    // 初始化页面数据
    this.loadGoodsList();
  },

  onPullDownRefresh: function () {
    // 下拉刷新
    this.refreshList();
  },

  onReachBottom: function () {
    // 上拉加载更多
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreGoods();
    }
  },

  // 标签切换事件
  onTabChange: function (e) {
    const currentTab = e.detail.value;
    
    this.setData({ 
      currentTab,
      goodsList: [],
      page: 1,
      hasMore: true
    });
    
    this.loadGoodsList();
  },

  // 分类切换事件
  onCategoryChange: function (e) {
    const currentCategory = e.currentTarget.dataset.id;
    
    this.setData({
      currentCategory,
      goodsList: [],
      page: 1,
      hasMore: true
    });
    
    this.loadGoodsList();
  },

  // 搜索事件
  onSearch: function (e) {
    const keyword = e.detail.value;
    
    this.setData({
      keyword,
      goodsList: [],
      page: 1,
      hasMore: true
    });
    
    this.loadGoodsList();
  },

  // 清空搜索
  clearSearch: function () {
    this.setData({
      keyword: '',
      goodsList: [],
      page: 1,
      hasMore: true
    });
    
    this.loadGoodsList();
  },

  // 加载商品列表
  loadGoodsList: function () {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    // TODO: 替换为实际的API调用
    // 模拟API返回的数据
    setTimeout(() => {
      const mockData = this.getMockData();
      
      this.setData({
        goodsList: mockData,
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
      goodsList: []
    });
    
    this.loadGoodsList();
  },

  // 加载更多
  loadMoreGoods: function () {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({
      loading: true,
      page: this.data.page + 1
    });
    
    // TODO: 替换为实际的API调用
    // 模拟API返回的数据
    setTimeout(() => {
      const mockData = this.getMockData();
      
      this.setData({
        goodsList: [...this.data.goodsList, ...mockData],
        loading: false,
        hasMore: mockData.length >= this.data.pageSize
      });
    }, 1000);
  },

  // 获取模拟数据
  getMockData: function () {
    const { currentTab, currentCategory, page, keyword } = this.data;
    
    // 生成不同的模拟数据
    const mockGoodsList = [];
    const categories = this.data.categories;
    
    for (let i = 0; i < 10; i++) {
      const id = (page - 1) * 10 + i + 1;
      const categoryId = i % 6 + 1;
      
      mockGoodsList.push({
        id,
        title: `二手商品 #${id}`,
        price: Math.floor(Math.random() * 1000) + 50,
        originalPrice: Math.floor(Math.random() * 2000) + 100,
        images: ['/images/default-avatar.png'],
        categoryId,
        categoryName: categories.find(c => c.id === categoryId).name,
        condition: i % 3 === 0 ? '全新' : i % 3 === 1 ? '9成新' : '7成新',
        location: '校园内',
        isSold: i % 7 === 0,
        isCollected: i % 5 === 0,
        viewCount: Math.floor(Math.random() * 100),
        createTime: '2023-03-15 14:30',
        description: '这是一个二手商品描述，品质保证，价格实惠，有意者请联系我。',
        seller: {
          id: 100 + i,
          name: `用户${100 + i}`,
          avatar: '/images/default-avatar.png'
        }
      });
    }
    
    // 根据分类筛选
    let filteredList = mockGoodsList;
    
    if (currentCategory !== 0) {
      filteredList = filteredList.filter(item => item.categoryId === currentCategory);
    }
    
    // 根据关键词筛选
    if (keyword) {
      filteredList = filteredList.filter(item => 
        item.title.includes(keyword) || 
        item.description.includes(keyword) ||
        item.categoryName.includes(keyword)
      );
    }
    
    // 根据标签筛选
    if (currentTab === 1) {
      // 我的发布
      filteredList = filteredList.filter(item => item.seller.id % 2 === 0);
    } else if (currentTab === 2) {
      // 我的收藏
      filteredList = filteredList.filter(item => item.isCollected);
    }
    
    return filteredList;
  },

  // 发布新商品
  publishGoods: function () {
    wx.navigateTo({
      url: '/pages/service/secondhand/publish/publish'
    });
  },

  // 查看商品详情
  viewGoodsDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    
    wx.navigateTo({
      url: `/pages/service/secondhand/detail/detail?id=${id}`
    });
  },

  // 收藏商品
  toggleCollect: function (e) {
    const id = e.currentTarget.dataset.id;
    
    // 查找商品
    const goodsList = this.data.goodsList.map(item => {
      if (item.id === id) {
        return {
          ...item,
          isCollected: !item.isCollected
        };
      }
      return item;
    });
    
    this.setData({ goodsList });
    
    // 显示提示
    wx.showToast({
      title: goodsList.find(item => item.id === id).isCollected ? '已收藏' : '已取消收藏',
      icon: 'success'
    });
    
    // TODO: 实现收藏API调用
  }
}); 