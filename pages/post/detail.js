import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    postId: '',
    replyTo: '',
    commentText: '',
    // 示例数据，实际应从服务器获取
    postData: {
      id: 1,
      title: "校园中心湖的日落美景，分享这难忘瞬间",
      author: {
        name: "摄影爱好者",
        avatar: "/images/avatars/avatar1.jpg"
      },
      createTime: "2023-10-08 16:30",
      content: [
        {
          type: "text",
          content: "今天傍晚漫步在校园中心湖畔，被眼前的日落美景深深吸引。夕阳西下，余晖洒在湖面上，波光粼粼，景色格外迷人。迫不及待地拿出相机，记录下这难忘的瞬间，与大家分享这份美丽。"
        },
        {
          type: "image",
          content: "/images/posts/post1.jpg"
        },
        {
          type: "text",
          content: "校园的中心湖是许多同学课余放松的好去处，但很少有人会在落日时分来此。其实这个时候的湖面，在夕阳的映照下，呈现出金色的光芒，周围的建筑倒映在水中，构成了一幅绝美的画卷。"
        },
        {
          type: "image",
          content: "/images/posts/detail1.jpg"
        },
        {
          type: "text",
          content: "建议大家有空时可以来这里看看日落，感受大自然的魅力，给忙碌的学习生活增添一抹诗意。时间一般在下午5:30到6:30之间，根据季节有所不同。记得带上相机或者手机，捕捉属于你的美好瞬间！"
        }
      ],
      tags: ["校园风光", "摄影分享", "日落"],
      likeCount: 230,
      commentCount: 15,
      isLiked: false,
      isCollected: false,
      isFollowed: false,
      comments: [
        {
          id: 1,
          username: "风景爱好者",
          avatar: "/images/avatars/avatar2.jpg",
          content: "照片拍得真美！请问是用什么相机拍的呢？",
          time: "10-08 18:15",
          likes: 24,
          isLiked: false
        },
        {
          id: 2,
          username: "校园摄影社团",
          avatar: "/images/avatars/avatar3.jpg",
          content: "构图很赞，光影处理得也很到位！欢迎加入我们社团一起交流~",
          time: "10-08 19:30",
          likes: 18,
          isLiked: true
        },
        {
          id: 3,
          username: "文学青年",
          avatar: "/images/avatars/avatar4.jpg",
          content: "美不胜收！正如席慕蓉所说：'微风中摇曳的蓝花楹，像一首温柔的诗。'这景色也如诗如画。",
          time: "10-09 08:45",
          likes: 15,
          isLiked: false
        }
      ]
    }
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        postId: options.id
      });
      // 实际开发中应该根据id从服务器获取数据
      this.fetchPostDetail(options.id);
    }
  },

  // 获取文章详情数据
  fetchPostDetail(id) {
    // 模拟API请求，实际开发中应从服务器获取
    console.log(`获取文章ID: ${id} 的详情数据`);
    // 这里使用的是示例数据，实际应该使用API请求
  },

  // 点赞文章
  handleLike() {
    const app = getApp();
    
    app.checkLoginStatus(() => {
      // 已登录，执行点赞逻辑
      const { postData } = this.data;
      const isLiked = !postData.isLiked;
      const likeCount = isLiked ? postData.likeCount + 1 : postData.likeCount - 1;
      
      this.setData({
        'postData.isLiked': isLiked,
        'postData.likeCount': likeCount
      });
      
      // 调用点赞API
      // wx.request({ ... })
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: isLiked ? '已点赞' : '已取消点赞'
      });
    });
  },

  // 收藏文章
  handleCollect() {
    const { postData } = this.data;
    const isCollected = !postData.isCollected;
    
    this.setData({
      'postData.isCollected': isCollected
    });
    
    Toast({
      context: this,
      selector: '#t-toast',
      message: isCollected ? '已收藏' : '已取消收藏',
    });
  },

  // 分享文章
  handleShare() {
    // 实现分享逻辑
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 图片预览
  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.postData.content
      .filter(item => item.type === 'image')
      .map(item => item.content);
    
    const current = this.data.postData.content[index].content;
    
    wx.previewImage({
      current,
      urls: images
    });
  },

  // 聚焦评论框
  focusComment() {
    this.setData({
      replyTo: ''
    });
  },

  // 评论文本变化
  onCommentChange(e) {
    this.setData({
      commentText: e.detail.value
    });
  },

  // 提交评论
  submitComment() {
    const { commentText, replyTo, postData } = this.data;
    
    if (!commentText.trim()) return;
    
    // 构建新评论对象
    const newComment = {
      id: postData.comments.length + 1,
      username: "我", // 实际应使用用户信息
      avatar: "/images/avatars/avatar5.jpg", // 实际应使用用户头像
      content: replyTo ? `回复 ${replyTo}：${commentText}` : commentText,
      time: "刚刚",
      likes: 0,
      isLiked: false
    };
    
    // 更新评论列表和计数
    this.setData({
      'postData.comments': [newComment, ...postData.comments],
      'postData.commentCount': postData.commentCount + 1,
      commentText: '',
      replyTo: ''
    });
    
    Toast({
      context: this,
      selector: '#t-toast',
      message: '评论发布成功',
    });
  },

  // 点赞评论
  likeComment(e) {
    const commentId = e.currentTarget.dataset.id;
    const { postData } = this.data;
    const commentIndex = postData.comments.findIndex(item => item.id === commentId);
    
    if (commentIndex !== -1) {
      const isLiked = !postData.comments[commentIndex].isLiked;
      const likes = isLiked 
        ? postData.comments[commentIndex].likes + 1 
        : postData.comments[commentIndex].likes - 1;
      
      this.setData({
        [`postData.comments[${commentIndex}].isLiked`]: isLiked,
        [`postData.comments[${commentIndex}].likes`]: likes
      });
    }
  },

  // 回复评论
  replyComment(e) {
    const { id, name } = e.currentTarget.dataset;
    this.setData({
      replyTo: name
    });
  },

  // 点击标签
  onTagClick(e) {
    const tag = e.currentTarget.dataset.tag;
    wx.navigateTo({
      url: '../search/search?tag=' + tag
    });
  },

  // 显示操作菜单
  showActionSheet() {
    wx.showActionSheet({
      itemList: ['举报', '不感兴趣', '收藏'],
      success: (res) => {
        if (res.tapIndex === 2) {
          this.handleCollect();
        } else if (res.tapIndex === 0) {
          wx.showToast({
            title: '举报成功',
            icon: 'success'
          });
        } else if (res.tapIndex === 1) {
          wx.showToast({
            title: '已减少此类内容推荐',
            icon: 'success'
          });
        }
      }
    });
  },

  // 分享给朋友
  onShareAppMessage() {
    const { postData } = this.data;
    return {
      title: postData.title,
      path: `/pages/post/detail?id=${postData.id}`,
      imageUrl: postData.content.find(item => item.type === 'image')?.content
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    const { postData } = this.data;
    return {
      title: postData.title,
      query: `id=${postData.id}`,
      imageUrl: postData.content.find(item => item.type === 'image')?.content
    };
  },

  // 添加关注作者功能
  followAuthor() {
    const isFollowed = !this.data.postData.isFollowed;
    
    this.setData({
      'postData.isFollowed': isFollowed
    });
    
    Toast({
      context: this,
      selector: '#t-toast',
      message: isFollowed ? '已关注作者' : '已取消关注',
    });
  }
}); 