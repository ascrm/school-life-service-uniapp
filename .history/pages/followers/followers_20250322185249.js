const app = getApp();

Page({
  data: {
    // 当前选中的标签
    currentTab: 0,
    // 标签列表
    tabs: [
      { value: 0, label: '关注' },
      { value: 1, label: '粉丝' },
      { value: 2, label: '互关' }
    ],
    // 关注列表
    followingList: [],
    // 粉丝列表
    followersList: [],
    // 互关列表
    mutualList: [],
    // 是否加载中
    loading: false,
    // 是否还有更多数据
    hasMore: true,
    // 页码
    page: 1,
    // 每页数量
    pageSize: 20,
    // 是否展示空状态
    isEmpty: false,
    // 用户ID
    userId: null
  },

  onLoad: function (options) {
    // 获取用户ID，如果没有则使用当前登录用户的ID
    const userId = options.userId || app.globalData.userInfo?.id;
    this.setData({ userId });
    
    // 根据选项设置初始标签页
    if (options.tab && ['0', '1', '2'].includes(options.tab)) {
      this.setData({ currentTab: parseInt(options.tab) });
    }
    
    // 根据当前标签页加载数据
    this.loadList(this.data.currentTab);
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreList(this.data.currentTab);
    }
  },

  onPullDownRefresh: function () {
    this.refreshList(this.data.currentTab);
  },

  // 标签切换事件
  onTabChange: function (e) {
    const currentTab = e.detail.value;
    
    this.setData({ 
      currentTab,
      page: 1,
      hasMore: true
    });
    
    // 如果对应列表为空，则加载数据
    if (currentTab === 0 && this.data.followingList.length === 0) {
      this.loadList(currentTab);
    } else if (currentTab === 1 && this.data.followersList.length === 0) {
      this.loadList(currentTab);
    } else if (currentTab === 2 && this.data.mutualList.length === 0) {
      this.loadList(currentTab);
    }
  },

  // 加载列表数据
  loadList: function (tabIndex) {
    if (this.data.loading) return;
    
    this.setData({ 
      loading: true,
      isEmpty: false
    });
    
    // 模拟API调用
    setTimeout(() => {
      let list = [];
      
      // 根据标签页生成不同的模拟数据
      if (tabIndex === 0) {
        // 关注列表
        list = this.generateMockFollowingList();
      } else if (tabIndex === 1) {
        // 粉丝列表
        list = this.generateMockFollowersList();
      } else {
        // 互关列表
        list = this.generateMockMutualList();
      }
      
      const dataKey = tabIndex === 0 ? 'followingList' : (tabIndex === 1 ? 'followersList' : 'mutualList');
      
      this.setData({
        [dataKey]: list,
        loading: false,
        isEmpty: list.length === 0,
        hasMore: list.length >= this.data.pageSize
      });
      
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 加载更多列表数据
  loadMoreList: function (tabIndex) {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({ 
      loading: true,
      page: this.data.page + 1
    });
    
    // 模拟API调用
    setTimeout(() => {
      let list = [];
      
      // 根据标签页生成不同的模拟数据
      if (tabIndex === 0) {
        // 关注列表
        list = this.generateMockFollowingList();
      } else if (tabIndex === 1) {
        // 粉丝列表
        list = this.generateMockFollowersList();
      } else {
        // 互关列表
        list = this.generateMockMutualList();
      }
      
      const dataKey = tabIndex === 0 ? 'followingList' : (tabIndex === 1 ? 'followersList' : 'mutualList');
      const originalList = this.data[dataKey];
      
      // 如果是第5页，模拟没有更多数据
      const hasMore = this.data.page < 5 && list.length >= this.data.pageSize;
      
      this.setData({
        [dataKey]: [...originalList, ...list],
        loading: false,
        hasMore
      });
    }, 1000);
  },

  // 刷新列表数据
  refreshList: function (tabIndex) {
    this.setData({ 
      page: 1,
      hasMore: true
    });
    
    this.loadList(tabIndex);
  },

  // 生成模拟关注列表
  generateMockFollowingList: function () {
    const list = [];
    const startIndex = (this.data.page - 1) * this.data.pageSize;
    
    for (let i = 0; i < this.data.pageSize; i++) {
      const userId = startIndex + i + 1;
      
      // 如果页数超过3页，返回较少的数据，模拟到了末尾
      if (this.data.page > 3 && i > 5) break;
      
      list.push({
        id: `following_${userId}`,
        userId: userId.toString(),
        nickName: `关注用户${userId}`,
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
        isFollowing: true,
        isFollower: Math.random() > 0.5,
        signature: `这是关注用户${userId}的个性签名`
      });
    }
    
    return list;
  },

  // 生成模拟粉丝列表
  generateMockFollowersList: function () {
    const list = [];
    const startIndex = (this.data.page - 1) * this.data.pageSize;
    
    for (let i = 0; i < this.data.pageSize; i++) {
      const userId = startIndex + i + 1;
      
      // 如果页数超过3页，返回较少的数据，模拟到了末尾
      if (this.data.page > 3 && i > 5) break;
      
      list.push({
        id: `follower_${userId}`,
        userId: userId.toString(),
        nickName: `粉丝用户${userId}`,
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
        isFollowing: Math.random() > 0.5,
        isFollower: true,
        signature: `这是粉丝用户${userId}的个性签名`
      });
    }
    
    return list;
  },

  // 生成模拟互关列表
  generateMockMutualList: function () {
    const list = [];
    const startIndex = (this.data.page - 1) * this.data.pageSize;
    
    for (let i = 0; i < this.data.pageSize; i++) {
      const userId = startIndex + i + 1;
      
      // 如果页数超过3页，返回较少的数据，模拟到了末尾
      if (this.data.page > 3 && i > 5) break;
      
      list.push({
        id: `mutual_${userId}`,
        userId: userId.toString(),
        nickName: `互关用户${userId}`,
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
        isFollowing: true,
        isFollower: true,
        signature: `这是互关用户${userId}的个性签名`
      });
    }
    
    return list;
  },

  // 跳转到用户主页
  navigateToUserProfile: function (e) {
    const userId = e.currentTarget.dataset.userId;
    
    wx.navigateTo({
      url: `/pages/userProfile/userProfile?userId=${userId}`
    });
  },

  // 跳转到聊天页面
  navigateToChat: function (e) {
    const userId = e.currentTarget.dataset.userId;
    
    wx.navigateTo({
      url: `/pages/chat/chat?userId=${userId}`
    });
  },

  // 关注用户
  followUser: function (e) {
    const userId = e.currentTarget.dataset.userId;
    const listType = e.currentTarget.dataset.listType;
    
    wx.showLoading({
      title: '处理中...',
    });
    
    // 模拟API调用
    setTimeout(() => {
      wx.hideLoading();
      
      let listKey, list;
      
      if (listType === 'following') {
        listKey = 'followingList';
        list = [...this.data.followingList];
      } else if (listType === 'followers') {
        listKey = 'followersList';
        list = [...this.data.followersList];
      } else {
        listKey = 'mutualList';
        list = [...this.data.mutualList];
      }
      
      const userIndex = list.findIndex(user => user.userId === userId);
      
      if (userIndex > -1) {
        const user = list[userIndex];
        list[userIndex] = {
          ...user,
          isFollowing: true
        };
        
        this.setData({
          [listKey]: list
        });
        
        // 如果是粉丝列表关注了一个用户，检查是否需要添加到互关列表
        if (listType === 'followers' && !user.isFollowing) {
          const mutualList = [...this.data.mutualList];
          mutualList.unshift({
            ...user,
            isFollowing: true,
            id: `mutual_${user.userId}`
          });
          
          this.setData({
            mutualList
          });
        }
      }
      
      wx.showToast({
        title: '已关注',
        icon: 'success'
      });
    }, 800);
  },

  // 取消关注用户
  unfollowUser: function (e) {
    const userId = e.currentTarget.dataset.userId;
    const listType = e.currentTarget.dataset.listType;
    
    wx.showModal({
      title: '提示',
      content: '确定要取消关注该用户吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中...',
          });
          
          // 模拟API调用
          setTimeout(() => {
            wx.hideLoading();
            
            let listKey, list;
            
            if (listType === 'following') {
              listKey = 'followingList';
              list = [...this.data.followingList];
            } else if (listType === 'followers') {
              listKey = 'followersList';
              list = [...this.data.followersList];
            } else {
              listKey = 'mutualList';
              list = [...this.data.mutualList];
            }
            
            const userIndex = list.findIndex(user => user.userId === userId);
            
            if (userIndex > -1) {
              const user = list[userIndex];
              
              // 如果是互关列表，取消关注后从互关列表中移除
              if (listType === 'mutual') {
                list.splice(userIndex, 1);
                
                // 将用户添加到粉丝列表
                const followersList = [...this.data.followersList];
                followersList.unshift({
                  ...user,
                  isFollowing: false,
                  id: `follower_${user.userId}`
                });
                
                this.setData({
                  followersList
                });
              } else {
                list[userIndex] = {
                  ...user,
                  isFollowing: false
                };
                
                // 如果用户在互关列表中，也需要从互关列表中移除
                if (user.isFollower) {
                  const mutualList = [...this.data.mutualList];
                  const mutualIndex = mutualList.findIndex(u => u.userId === userId);
                  
                  if (mutualIndex > -1) {
                    mutualList.splice(mutualIndex, 1);
                    
                    this.setData({
                      mutualList
                    });
                  }
                }
              }
              
              this.setData({
                [listKey]: list
              });
            }
            
            wx.showToast({
              title: '已取消关注',
              icon: 'success'
            });
          }, 800);
        }
      }
    });
  }
}); 