// pages/publish/publish.js
import Toast from 'tdesign-miniprogram/toast/index';
const { post } = require('../../api/index')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 'image', // 当前选中的标签页：image 或 video
    title: '', // 标题
    content: '', // 内容
    imageList: [], // 已选择的图片列表
    videoPath: '', // 已选择的视频路径
		location: '', // 位置信息
		selectedTags: [], //已选择的标签
		selectedTagsNames: [], // 已选择的标签的namess
		selectedTagsIds: [], // 已选择的标签ids
    isSubmitting: false, // 是否正在提交
    canPublish: false, // 是否可以发布
    
    // 标签选择相关
    showTagPopup: false, // 是否显示标签选择器
    recommendTags: [],
    tagsLoading: true, // 标签加载状态
    tagsError: false // 标签加载错误状态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 初始化页面
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 检查是否可以发布
  checkCanPublish() {
    const { activeTab, imageList, videoPath, title, content } = this.data;
    
    if (activeTab === 'image') {
      // 图文模式：至少有1张图片 + 标题或内容不为空
      const canPublish = imageList.length > 0 && (title.trim() !== '' || content.trim() !== '');
      this.setData({ canPublish });
    } else {
      // 视频模式：有视频 + 标题或内容不为空
      const canPublish = videoPath !== '' && (title.trim() !== '' || content.trim() !== '');
      this.setData({ canPublish });
    }
  },

  // 标签页切换
  onTabChange(e) {
    this.setData({
      activeTab: e.detail.value,
      title: '',
      content: '',
			selectedTags: [],
			selectedTagsNames:[],
			selectedTagsIds:[],
    }, () => {
      this.checkCanPublish();
    });
  },

  // 标题输入变化
  onTitleChange(e) {
    this.setData({
      title: e.detail.value
    }, () => {
      this.checkCanPublish();
    });
  },

  // 内容输入变化
  onContentChange(e) {
    this.setData({
      content: e.detail.value
    }, () => {
      this.checkCanPublish();
    });
  },

  // 选择图片
  chooseImage() {
    const { imageList } = this.data;
    const remainCount = 9 - imageList.length;
    
    wx.chooseMedia({
      count: remainCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (res) => {
        const tempFiles = res.tempFiles.map(file => file.tempFilePath);
        
        this.setData({
          imageList: [...imageList, ...tempFiles]
        }, () => {
          this.checkCanPublish();
        });
      }
    });
  },

  // 预览图片
  previewImage(e) {
    const { index } = e.currentTarget.dataset;
    const { imageList } = this.data;
    
    wx.previewImage({
      urls: imageList,
      current: imageList[index]
    });
  },

  // 删除图片
  deleteImage(e) {
    const { index } = e.currentTarget.dataset;
    const { imageList } = this.data;
    
    imageList.splice(index, 1);
    
    this.setData({
      imageList
    }, () => {
      this.checkCanPublish();
    });
  },

  // 选择视频
  chooseVideo() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      maxDuration: 60, // 最大时长60秒
      success: (res) => {
        this.setData({
          videoPath: res.tempFiles[0].tempFilePath
        }, () => {
          this.checkCanPublish();
        });
      }
    });
  },

  // 删除视频
  deleteVideo() {
    this.setData({
      videoPath: ''
    }, () => {
      this.checkCanPublish();
    });
  },

  // 选择位置
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          location: res.name
        });
      }
    });
  },

  // 清除位置
  clearLocation() {
    this.setData({
      location: ''
    });
  },

  // 显示标签选择器
  showTagSelector() {
    this.setData({ 
      tagsLoading: true,
      tagsError: false,
      showTagPopup: true 
    });
    
    // 从后端获取所有标签
    post.getAllTags()
      .then(res => {
        if (res && Array.isArray(res)) {
          // 处理标签数据，添加selected属性
          const { selectedTagsNames } = this.data;
          const formattedTags = res.map(tag => ({
            id: tag.id,
            name: tag.name,
            selected: selectedTagsNames.some(selectedTag => selectedTag === tag.name)
          }));
          
          this.setData({
            recommendTags: formattedTags,
            tagsLoading: false
          });
        } else {
          this.setData({
            tagsLoading: false,
            tagsError: true
          });
          
          Toast({
            context: this,
            selector: '#t-toast',
            message: '获取标签失败，请重试',
            theme: 'error'
          });
        }
      })
      .catch(err => {
        console.error('获取标签失败:', err);
        this.setData({
          tagsLoading: false,
          tagsError: true
        });
        
        Toast({
          context: this,
          selector: '#t-toast',
          message: '获取标签失败，请重试',
          theme: 'error'
        });
      });
  },

  // 隐藏标签选择器
  hideTagSelector() {
    this.setData({
      showTagPopup: false
    });
  },

  // 标签弹出层关闭事件
  onTagPopupClose(e) {
    if (!e.detail.trigger) {
      this.hideTagSelector();
    }
  },

  // 切换标签选中状态
  toggleTag(e) {
    const { index } = e.currentTarget.dataset;
    const { recommendTags } = this.data;
    
    // 如果已有3个选中标签且当前要选的是未选中状态，则提示
    const selectedCount = recommendTags.filter(tag => tag.selected).length;
    if (selectedCount >= 3 && !recommendTags[index].selected) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '最多只能选择3个标签',
      });
      return;
    }
    
    // 更新选中状态
    const updatedTags = [...recommendTags];
    updatedTags[index].selected = !updatedTags[index].selected;
    
    this.setData({
      recommendTags: updatedTags
    });
  },

  // 确认标签选择
  confirmTagSelection() {
		const { recommendTags } = this.data;
		const	selectedTags = recommendTags.filter(tag => tag.selected);
		
    this.setData({
			selectedTags,
			selectedTagsNames: selectedTags.map(tag=>tag.name),
			selectedTagsIds: selectedTags.map(tag=>tag.id),
      showTagPopup: false,
		});
  },

  // 移除已选标签
  removeTag(e) {
    const { index } = e.currentTarget.dataset;
		const { selectedTags } = this.data;
		
    selectedTags.splice(index, 1);

    this.setData({
			selectedTags,
			selectedTagsNames: selectedTags.map(tag=>tag.name),
			selectedTagsIds: selectedTags.map(tag=>tag.id),
    });
  },

  // 提交内容
  submitContent() {
    const app = getApp();
    
    // 检查登录状态
    if (!app.checkLoginStatus(() => {
      this.doSubmitContent();
    })) {
      return; // 如果未登录，该方法会处理登录提示，这里直接返回
    }
  },

  // 实际提交内容的方法
  doSubmitContent() {
    const { activeTab, title, content, imageList, videoPath, location, selectedTagsIds } = this.data;
    
    // 再次验证是否可以发布
    if (activeTab === 'image' && (imageList.length === 0 || (title.trim() === '' && content.trim() === ''))) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请添加图片和填写标题或内容',
      });
      return;
    }
    
    if (activeTab === 'video' && (videoPath === '' || (title.trim() === '' && content.trim() === ''))) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请添加视频和填写标题或内容',
      });
      return;
    }
    
    // 设置提交中状态
    this.setData({
      isSubmitting: true
    });

    // 准备文件列表
    let files = [];
    if (activeTab === 'image') {
      // 对于图文帖子，处理多张图片
      files = imageList.map(path => ({
        path: path,
        type: 'image'
      }));
    } else if (activeTab === 'video') {
      // 对于视频帖子，添加单个视频
      if (videoPath) {
        files.push({
          path: videoPath,
          type: 'video'
        });
      }
    }

    // 逐个上传文件
    const uploadPromises = files.map(file => post.uploadImageApi(file));
    
    Promise.all(uploadPromises)
      .then(urls => {
        // 检查是否有上传失败的（url为null）
        if (urls.some(url => !url)) {
          throw new Error('部分文件上传失败');
        }

        // 准备帖子数据
        const postsDto = {
          title: title,
          content: content,
					tagIds: selectedTagsIds,
					imageUrls: urls, // 添加所有上传成功的文件URL
          location: location,
          type: activeTab,
        };

        // 发布帖子
        return post.publishPostApi(postsDto);
      })
      .then(res => {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '发布成功',
          icon: 'check-circle'
        });
        
        // 发布成功后返回
        setTimeout(() => {
          wx.switchTab({
            url: '../discover/discover'
          });
        }, 1500);
      })
      .catch(err => {
        console.error('发布失败:', err);
        Toast({
          context: this,
          selector: '#t-toast',
          message: err.message || '发布失败，请重试',
          theme: 'error'
        });
      })
      .finally(() => {
        this.setData({
          isSubmitting: false
        });
      });
  }
})