// pages/discover/discover.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    isLoading: false,
    // 分类标签数据
    categories: [
      { label: "推荐", value: 0 },
      { label: "活动", value: 1 },
      { label: "学习", value: 2 },
      { label: "生活", value: 3 },
      { label: "二手", value: 4 },
      { label: "社交", value: 5 }
    ],
    hotTags: [
      "校园摄影", "期末复习", "美食推荐", "寝室神器", 
      "运动健身", "考研经验", "社团活动", "实习经历", 
      "考证干货", "学习笔记", "校园剧本杀", "自习小组"
    ],
    recommendPosts: [
      {
        id: 1,
        title: "校园中心湖的日落美景，分享这难忘瞬间",
        image: "/images/posts/post1.jpg",
        author: "摄影爱好者",
        avatar: "/images/avatars/avatar1.jpg",
        likes: 230,
        isLiked: false
      },
      {
        id: 2,
        title: "考研英语背单词技巧，三个月搞定词汇",
        image: "/images/posts/post2.jpg",
        author: "考研人",
        avatar: "/images/avatars/avatar2.jpg",
        likes: 189,
        isLiked: true
      },
      {
        id: 3,
        title: "校园周边平价美食推荐，人均20必吃榜单",
        image: "/images/posts/post3.jpg",
        author: "美食达人",
        avatar: "/images/avatars/avatar3.jpg",
        likes: 312,
        isLiked: false
      },
      {
        id: 4,
        title: "寝室收纳神器推荐，空间利用率提升200%",
        image: "/images/posts/post4.jpg",
        author: "宿舍生活家",
        avatar: "/images/avatars/avatar4.jpg",
        likes: 156,
        isLiked: false
      }
    ],
    eventPosts: [
      {
        id: 1,
        title: "校园歌手大赛",
        brief: "展示你的才华，赢取丰厚奖品。本次比赛将邀请专业评委，优胜者有机会获得校外演出机会。",
        image: "/images/events/event1.jpg",
        time: "10月15日 19:00",
        location: "学生活动中心",
        status: "招募中",
        participants: 68
      },
      {
        id: 2,
        title: "创新创业讲座",
        brief: "邀请知名企业家分享创业经验，帮助你了解创业流程和注意事项。",
        image: "/images/events/event2.jpg",
        time: "10月18日 14:30",
        location: "图书馆报告厅",
        status: "进行中",
        participants: 125
      },
      {
        id: 3,
        title: "校园马拉松",
        brief: "全程5公里，绕校园一周。参与即可获得纪念品，前十名还有精美奖品。",
        image: "/images/events/event3.jpg",
        time: "10月25日 8:00",
        location: "校园东门集合",
        status: "招募中",
        participants: 230
      },
      {
        id: 4,
        title: "电影之夜",
        brief: "露天电影放映，本周放映《肖申克的救赎》，带上零食和好心情一起来吧！",
        image: "/images/events/event4.jpg",
        time: "本周五 19:30",
        location: "中心草坪",
        status: "已结束",
        participants: 186
      }
    ],
    categoryPosts: [
      {
        id: 1,
        title: "期末复习资料分享",
        description: "整理了高数、大物、英语等课程的复习重点和模拟题，过来拿资料的同学别忘了点赞哦～",
        image: "/images/category/study1.jpg",
        author: "学霸笔记",
        avatar: "/images/avatars/avatar5.jpg",
        likes: 213,
        isLiked: true
      },
      {
        id: 2,
        title: "校园里最适合约会的五个地方",
        description: "校园里这些隐藏的浪漫地点你都知道吗？和喜欢的人一起去感受不一样的校园氛围～",
        image: "/images/category/life1.jpg",
        author: "恋爱顾问",
        avatar: "/images/avatars/avatar6.jpg",
        likes: 178,
        isLiked: false
      },
      {
        id: 3,
        title: "考研政治冲刺笔记",
        description: "马原、毛中特、史纲、思修法基重点整理，配合肖四肖八复习，冲刺70+不是梦！",
        image: "/images/category/study2.jpg",
        author: "考研人",
        avatar: "/images/avatars/avatar7.jpg",
        likes: 298,
        isLiked: false
      },
      {
        id: 4,
        title: "宿舍小型果蔬种植指南",
        description: "在宿舍也能种菜！分享我的阳台小菜园经验，一周就能收获自己种的生菜～",
        image: "/images/category/life2.jpg",
        author: "绿植达人",
        avatar: "/images/avatars/avatar8.jpg",
        likes: 156,
        isLiked: true
      },
      {
        id: 5,
        title: "转让九成新自行车",
        description: "搬宿舍了，闲置的自行车便宜转让，才用了半年，很新，有需要的同学联系我",
        image: "/images/category/market1.jpg",
        author: "二手交易",
        avatar: "/images/avatars/avatar9.jpg",
        likes: 42,
        isLiked: false
      },
      {
        id: 6,
        title: "寻找志同道合的跑步伙伴",
        description: "每天早上6:30校园跑，寻找1-2位志同道合的伙伴一起坚持，互相监督更有动力～",
        image: "/images/category/social1.jpg",
        author: "运动爱好者",
        avatar: "/images/avatars/avatar10.jpg",
        likes: 89,
        isLiked: false
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 页面加载时的逻辑
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
    // 模拟刷新数据
    this.loadData();
    
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // 模拟加载更多数据
    this.loadData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

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
    this.setData({
      currentTab: e.detail.value
    });
    
    // 模拟加载数据
    this.loadData();
  },

  // 处理标签点击
  onTagClick(e) {
    const tag = e.currentTarget.dataset.tag;
    wx.navigateTo({
      url: '../search/search?tag=' + tag
    });
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
  },

  // 模拟加载数据
  loadData() {
    this.setData({ isLoading: true });
    
    setTimeout(() => {
      this.setData({ isLoading: false });
    }, 1000);
  }
})