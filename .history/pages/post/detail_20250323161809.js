import Toast from 'tdesign-miniprogram/toast/index';
const {post} = require('../../api/index');
const {user} = require('../../api/index');

Page({
  data: {
    postId: '',
    replyTo: '',
    commentText: '',
    postImages: [], // 存储所有图片用于轮播
    // 示例数据，实际应从服务器获取
    postData: {}
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
		post.getPostDetailApi({ postId: id }).then((data)=>{
			this.setData({
				postData: data,
				postImages: data.imageUrls
			})
			// 处理图片和日期格式
			this.processPostData();
		})
  },
  
  // 处理帖子数据，提取图片并格式化日期
  processPostData() {
    const { postData } = this.data;
		postData.createdAt = postData.createdAt.split('T')[0]
		this.setData({
			postData
		})
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
  
  // 轮播图中的图片预览
  previewSwiperImage(e) {
    const src = e.currentTarget.dataset.src;
    const urls = e.currentTarget.dataset.urls;
    
    wx.previewImage({
      current: src,
      urls: urls
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