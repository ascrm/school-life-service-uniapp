Page({
  data: {
    current: 0,
    swiperList: [
      '/images/banner/banner1.jpg' ,
     	'/images/banner/banner2.jpeg',
      '/images/banner/banner3.jpg' ,
    ],
    frequentServices: [
      { 
        id: 1,
        title: '跑腿代取',
        icon: '/images/icons/跑腿代办.png',
        url: '../errand/errand'
      },
      { 
        id: 2,
        title: '二手交易',
        icon: '/images/icons/二手交易.png',
        url: '../market/market'
      },
      { 
        id: 3,
        title: '代课服务',
        icon: '/images/icons/代课服务.png',
        url: '../schedule/schedule'
      },
      { 
        id: 4,
        title: '失物招领',
        icon: '/images/icons/失物招领.png',
        url: '../lost/lost'
      }
    ],
    campusServices: [
      { 
        id: 1,
        title: '自习室',
        icon: '/images/icons/其他服务.png',
        url: '../study/study'
      },
      { 
        id: 2,
        title: '报修服务',
        icon: '/images/icons/其他服务.png',
        url: '../repair/repair'
      },
      { 
        id: 3,
        title: '校园地图',
        icon: '/images/icons/其他服务.png',
        url: '../map/map'
      },
      { 
        id: 4,
        title: '校园公告',
        icon: '/images/icons/其他服务.png',
        url: '../notice/notice'
      }
    ],
    lifeServices: [
      { 
        id: 1,
        title: '校园餐厅',
        icon: '/images/icons/其他服务.png',
        url: '../canteen/canteen'
      },
      { 
        id: 2,
        title: '宿舍服务',
        icon: '/images/icons/其他服务.png',
        url: '../dorm/dorm'
      },
      { 
        id: 3,
        title: '洗衣服务',
        icon: '/images/icons/其他服务.png',
        url: '../laundry/laundry'
      },
      { 
        id: 4,
        title: '快递服务',
        icon: '/images/icons/其他服务.png',
        url: '../express/express'
      }
    ],
    learningServices: [
      { 
        id: 1,
        title: '图书馆',
        icon: '/images/icons/其他服务.png',
        url: '../library/library'
      },
      { 
        id: 2,
        title: '成绩查询',
        icon: '/images/icons/其他服务.png',
        url: '../grade/grade'
      },
      { 
        id: 3,
        title: '学习资料',
        icon: '/images/icons/其他服务.png',
        url: '../resources/resources'
      },
      { 
        id: 4,
        title: '考试信息',
        icon: '/images/icons/其他服务.png',
        url: '../exam/exam'
      }
    ],
    activities: [
      {
        id: 1,
        title: '校园歌手大赛',
        image: '/images/activities/activity1.jpg',
        time: '10月15日 19:00',
        location: '学生活动中心',
        status: '招募中'
      },
      {
        id: 2,
        title: '创新创业讲座',
        image: '/images/activities/activity2.jpg',
        time: '10月18日 14:30',
        location: '图书馆报告厅',
        status: '进行中'
      }
    ]
  },
	
	
  onLoad() {

  },
  test(params){
		console.log("参数：",params)
	},
  // 设置今日日期
  setTodayDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
    
    this.setData({
      todayDate: `${month}月${day}日 ${weekday}`
    });
  },
  
  // 导航到对应页面
  navigateTo(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url
    });
  },
  
  // 查看全部服务
  viewAllServices() {
    wx.navigateTo({
      url: '../services/services'
    });
  },
  
  // 查看全部活动
  viewAllActivities() {
    wx.navigateTo({
      url: '../activity/list'
    });
  },
  
  // 跳转到活动详情
  navigateToActivity(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../activity/detail?id=${id}`
    });
  },
  
  // 搜索
  onSearch() {
    wx.navigateTo({
      url: '../search/search'
    });
  }
}); 