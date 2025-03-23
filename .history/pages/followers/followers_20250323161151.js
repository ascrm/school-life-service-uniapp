const app = getApp();
const { user } = require('../../api/index');

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
    // API没有分页功能，此处暂不实现加载更多功能
    // 如果后端支持分页，可以在此处添加加载更多逻辑
  },

  onPullDownRefresh: function () {
    this.refreshList(this.data.currentTab);
  },

  // 标签切换事件
  onTabChange: function (e) {
    const currentTab = e.detail.value;
    
    this.setData({ 
      currentTab
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
    
    let apiCall;
    let dataKey;
    
    // 根据标签页选择不同的API调用
    if (tabIndex === 0) {
      // 关注列表
      apiCall = user.getFolloweesApi();
      dataKey = 'followingList';
    } else if (tabIndex === 1) {
      // 粉丝列表
      apiCall = user.getFollowersApi();
      dataKey = 'followersList';
    } else {
      // 互关列表
      apiCall = user.getMutualsApi();
      dataKey = 'mutualList';
    }
    
    // 调用API
    apiCall.then(res => {
      // 处理API返回的数据
      const list = this.processUserList(res.data || []);
      
      this.setData({
        [dataKey]: list,
        loading: false,
        isEmpty: list.length === 0,
        hasMore: false // 当前API不支持分页，所以没有更多数据
      });
      
      wx.stopPullDownRefresh();
    }).catch(err => {
      console.error('获取列表失败:', err);
      this.setData({
        loading: false,
        isEmpty: true
      });
      
      wx.stopPullDownRefresh();
      
      wx.showToast({
        title: '获取列表失败',
        icon: 'none'
      });
    });
  },

  // 处理用户列表数据
  processUserList: function(list) {
    return list.map(user => {
      return {
        id: user.id,
        nickName: user.nickName,
        avatar: user.avatar,
        isFollowing: true, // 关注列表中的用户默认已关注
        isFollower: this.data.currentTab === 1 || this.data.currentTab === 2, // 粉丝和互关列表中的用户默认为粉丝
        signature: user.signature || ''
      };
    });
  },

  // 刷新列表数据
  refreshList: function (tabIndex) {
    this.loadList(tabIndex);
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
    
    wx.showLoading({
      title: '处理中...',
    });
    
    // 调用关注API
    user.followUserApi(userId).then(() => {
      wx.hideLoading();
      
      wx.showToast({
        title: '已关注',
        icon: 'success'
      });
      
      // 更新列表状态
      this.updateUserFollowState(userId, true);
    }).catch(err => {
      wx.hideLoading();
      console.error('关注失败:', err);
      
      wx.showToast({
        title: '关注失败',
        icon: 'none'
      });
    });
  },

  // 取消关注用户
  unfollowUser: function (e) {
    const userId = e.currentTarget.dataset.userId;
    
    wx.showModal({
      title: '提示',
      content: '确定要取消关注该用户吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中...',
          });
          
          // 调用取消关注API
          user.unfollowUserApi(userId).then(() => {
            wx.hideLoading();
            
            wx.showToast({
              title: '已取消关注',
              icon: 'success'
            });
            
            // 更新列表状态
            this.updateUserFollowState(userId, false);
          }).catch(err => {
            wx.hideLoading();
            console.error('取消关注失败:', err);
            
            wx.showToast({
              title: '取消关注失败',
              icon: 'none'
            });
          });
        }
      }
    });
  },
  
  // 更新用户关注状态
  updateUserFollowState: function(userId, isFollowing) {
    const { currentTab, followingList, followersList, mutualList } = this.data;
    
    // 根据当前标签页更新不同的列表
    if (currentTab === 0) {
      // 关注列表，取消关注后从列表中移除
      if (!isFollowing) {
        this.setData({
          followingList: followingList.filter(user => user.id.toString() !== userId.toString())
        });
      }
    } else if (currentTab === 1) {
      // 粉丝列表，更新关注状态
      const updatedList = followersList.map(user => {
        if (user.id.toString() === userId.toString()) {
          return { ...user, isFollowing };
        }
        return user;
      });
      
      this.setData({
        followersList: updatedList
      });
      
      // 如果关注了粉丝，应将该用户添加到互关列表
      if (isFollowing) {
        const user = followersList.find(u => u.id.toString() === userId.toString());
        if (user && !mutualList.some(u => u.id.toString() === userId.toString())) {
          this.setData({
            mutualList: [...mutualList, { ...user, isFollowing: true }]
          });
        }
      }
    } else if (currentTab === 2) {
      // 互关列表，取消关注后从列表中移除
      if (!isFollowing) {
        this.setData({
          mutualList: mutualList.filter(user => user.id.toString() !== userId.toString())
        });
        
        // 将用户添加到粉丝列表
        const user = mutualList.find(u => u.id.toString() === userId.toString());
        if (user) {
          this.setData({
            followersList: [...followersList, { ...user, isFollowing: false }]
          });
        }
      }
    }
  }
}); 