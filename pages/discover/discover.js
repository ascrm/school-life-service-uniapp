const { discover,post } = require('../../api/index')

// pages/discover/discover.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    isLoading: false,
    hasMore: true, // 是否还有更多数据
    // 分类标签数据
    categories: [], // 改为空数组，从接口获取
    hotTags: [
      "校园摄影", "期末复习", "美食推荐", "寝室神器", 
      "运动健身", "考研经验", "社团活动", "实习经历", 
      "考证干货", "学习笔记", "校园剧本杀", "自习小组"
    ],
    recommendPosts: [], // 推荐内容，改为空数组
    eventPosts: [], // 活动内容，改为空数组
    categoryPosts: [], // 其他分类内容，改为空数组
    
    // 分页加载相关
		earliestDateTimes: {}, // 存储每个分类的最早时间，用于分页加载
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取所有分类
    this.getCategories();
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
    // 下拉刷新，重新加载当前分类的数据
    this.refreshCurrentCategory();
    
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // 上拉加载更多
    if (this.data.isLoading || !this.data.hasMore) return;
    
    this.loadMoreForCurrentCategory();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 获取所有分类
  getCategories() {
		
    wx.showLoading({
      title: '加载中',
    });
    
    discover.getAllCategoriesApi()
      .then(res => {

        if (res && Array.isArray(res)) {
          // 转换后端返回的分类数据为前端需要的格式
          const categories = res.map((item, index) => ({
            label: item.name,
            value: index,
            id: item.id
          }));
          
          this.setData({
            categories: categories
          }, () => {
            // 加载默认分类的帖子
            this.loadPostsByCategory(0);
          });
        } else {
          wx.showToast({
            title: '获取分类失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('获取分类失败:', err);
        wx.showToast({
          title: '获取分类失败',
          icon: 'none'
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  // 按分类加载帖子
  loadPostsByCategory(tabIndex, isLoadMore = false) {
    const { categories, earliestDateTimes } = this.data;
    
    if (!categories || categories.length === 0) {
      return;
    }
    
    // 设置加载状态
    this.setData({
      isLoading: true
    });
    
    // 获取当前分类ID
    const categoryId = categories[tabIndex].id;
    
    // 获取最早时间，用于分页加载
    const earliestDateTime = isLoadMore ? earliestDateTimes[categoryId] : null;
    
    discover.getPostsByCategoryIdApi(categoryId, earliestDateTime)
      .then(res => {
        if (res && Array.isArray(res)) {
          let posts = [];
          let dataKey = '';
          
          // 根据tabIndex确定数据保存的位置
          if (tabIndex === 0) {
            dataKey = 'recommendPosts';
          } else if (tabIndex === 1) {
            dataKey = 'eventPosts';
          } else {
            dataKey = 'categoryPosts';
          }
          
          // 如果是加载更多，则拼接数据
          if (isLoadMore) {
            posts = [...this.data[dataKey], ...res];
          } else {
            posts = res;
          }
          
          const updateData = {
            isLoading: false,
            hasMore: res.length >= 30, // 如果返回的数据不足30条，认为没有更多数据
          };
          
          updateData[dataKey] = posts;
          
          // 如果有数据，更新最早时间
          if (res.length > 0) {
            const lastPost = res[res.length - 1];
            if (lastPost.createdAt) {
              const newEarliestDateTimes = { ...earliestDateTimes };
              newEarliestDateTimes[categoryId] = lastPost.createdAt;
              updateData.earliestDateTimes = newEarliestDateTimes;
            }
          } else {
            updateData.hasMore = false;
          }
          
          this.setData(updateData);
        } else {
          this.setData({
            isLoading: false,
            hasMore: false
          });
          
          if (!isLoadMore) {
            wx.showToast({
              title: '暂无数据',
              icon: 'none'
            });
          }
        }
      })
      .catch(err => {
        console.error('获取帖子失败:', err);
        this.setData({
          isLoading: false
        });
        
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      });
  },

  // 刷新当前分类
  refreshCurrentCategory() {
    const { currentTab } = this.data;
    
    // 重置最早时间，重新加载数据
    this.loadPostsByCategory(currentTab, false);
  },

  // 加载当前分类的更多帖子
  loadMoreForCurrentCategory() {
    const { currentTab } = this.data;
    
    this.loadPostsByCategory(currentTab, true);
  },

  // 处理搜索输入变化
  onSearchChange(e) {
    console.log('搜索内容变化:', e.detail.value);
  },

  // 处理搜索按钮点击
  onSearchAction(e) {
    wx.navigateTo({
      url: '../search/search?keyword=' + e.detail.value
    });
  },

  // 处理搜索框获取焦点
  onSearchFocus() {
    wx.navigateTo({
      url: '../search/search'
    });
  },

  // 处理标签页切换
  onTabsChange(e) {
    const newTabIndex = e.detail.value;
    const { currentTab } = this.data;
    
    // 切换分类
    this.setData({
      currentTab: newTabIndex,
      hasMore: true // 重置加载更多状态
    });
    
    // 如果切换到的分类没有数据，则加载数据
    if (newTabIndex === 0 && this.data.recommendPosts.length === 0) {
      this.loadPostsByCategory(newTabIndex);
    } else if (newTabIndex === 1 && this.data.eventPosts.length === 0) {
      this.loadPostsByCategory(newTabIndex);
    } else if (newTabIndex > 1 && this.data.categoryPosts.length === 0) {
      this.loadPostsByCategory(newTabIndex);
    } else if (currentTab !== newTabIndex) {
      // 切换到不同的分类，重新加载数据
      this.loadPostsByCategory(newTabIndex);
    }
  },

  // 处理标签点击
  onTagClick(e) {
    const tag = e.currentTarget.dataset.tag;
    wx.navigateTo({
      url: '../search/search?tag=' + tag
    });
	},
	
	//点赞实现
	onClickLikes(e){
	
		const { recommendPosts } = this.data
		const id = e.currentTarget.dataset.id;
		post.addLikePostApi(id);
		
		recommendPosts.forEach(item=>{
			if(item.id==id) {
				item.isLiked=!item.isLiked
				item.likes = item.isLiked ? item.likes+1 : item.likes-1
			}
		})

		this.setData({
			recommendPosts,
		})
	},

  // 跳转到文章详情
  navigateToPost(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../post/detail?id=' + id
    });
  },

  // 跳转到活动详情
  navigateToEvent(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../activity/detail?id=' + id
    });
  },

  // 跳转到内容详情
  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../post/detail?id=' + id
    });
  }
})