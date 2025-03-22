const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    isSaving: false,
    
    // 性别选择器相关
    genderOptions: [
      { label: '男', value: '1' },
      { label: '女', value: '2' },
      { label: '保密', value: '0' }
    ],
    showGenderPicker: false,
    
    // 各种弹窗控制
    showNicknameDlg: false,
    showBriefDlg: false,
    showPhoneDlg: false,
    showEmailDlg: false,
    
    // 临时存储编辑的值
    tempNickname: '',
    tempBrief: '',
    tempGender: '0',
    tempPhone: '',
    tempEmail: '',
    
    // 性别显示文本
    genderText: '保密'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadUserInfo();
  },
  
  // 加载用户信息
  loadUserInfo() {
    const userInfo = app.globalData.userInfo || {};
    
    // 根据性别设置显示文本
    let genderText = '保密';
    if (userInfo.gender === '1') {
      genderText = '男';
    } else if (userInfo.gender === '2') {
      genderText = '女';
    }
    
    this.setData({
      userInfo: userInfo,
      genderText: genderText,
      tempNickname: userInfo.nickName || '',
      tempBrief: userInfo.brief || '',
      tempGender: userInfo.gender || '0',
      tempPhone: userInfo.phone || '',
      tempEmail: userInfo.email || ''
    });
  },
  
  // 显示昵称编辑弹窗
  showNicknameDialog() {
    this.setData({
      showNicknameDlg: true,
      tempNickname: this.data.userInfo.nickName || ''
    });
  },
  
  // 确认昵称修改
  confirmNickname() {
    if (!this.data.tempNickname.trim()) {
      wx.showToast({
        title: '昵称不能为空',
        icon: 'none'
      });
      return;
    }
    
    const userInfo = { ...this.data.userInfo, nickName: this.data.tempNickname };
    this.setData({
      userInfo: userInfo,
      showNicknameDlg: false
    });
  },
  
  // 取消昵称修改
  cancelNickname() {
    this.setData({
      showNicknameDlg: false
    });
  },
  
  // 显示个人简介编辑弹窗
  showBriefDialog() {
    this.setData({
      showBriefDlg: true,
      tempBrief: this.data.userInfo.brief || ''
    });
  },
  
  // 确认个人简介修改
  confirmBrief() {
    const userInfo = { ...this.data.userInfo, brief: this.data.tempBrief };
    this.setData({
      userInfo: userInfo,
      showBriefDlg: false
    });
  },
  
  // 取消个人简介修改
  cancelBrief() {
    this.setData({
      showBriefDlg: false
    });
  },
  
  // 显示性别选择器
  showGenderPicker() {
    this.setData({
      showGenderPicker: true
    });
  },
  
  // 确认性别选择
  confirmGender(e) {
    const { value } = e.detail;
    const genderValue = value[0];
    let genderText = '保密';
    
    if (genderValue === '1') {
      genderText = '男';
    } else if (genderValue === '2') {
      genderText = '女';
    }
    
    const userInfo = { ...this.data.userInfo, gender: genderValue };
    
    this.setData({
      userInfo: userInfo,
      genderText: genderText,
      tempGender: genderValue,
      showGenderPicker: false
    });
  },
  
  // 取消性别选择
  cancelGender() {
    this.setData({
      showGenderPicker: false
    });
  },
  
  // 显示手机号编辑弹窗
  showPhoneDialog() {
    this.setData({
      showPhoneDlg: true,
      tempPhone: this.data.userInfo.phone || ''
    });
  },
  
  // 确认手机号修改
  confirmPhone() {
    // 简单的手机号验证
    const phoneReg = /^1[3-9]\d{9}$/;
    if (this.data.tempPhone && !phoneReg.test(this.data.tempPhone)) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      });
      return;
    }
    
    const userInfo = { ...this.data.userInfo, phone: this.data.tempPhone };
    this.setData({
      userInfo: userInfo,
      showPhoneDlg: false
    });
  },
  
  // 取消手机号修改
  cancelPhone() {
    this.setData({
      showPhoneDlg: false
    });
  },
  
  // 显示邮箱编辑弹窗
  showEmailDialog() {
    this.setData({
      showEmailDlg: true,
      tempEmail: this.data.userInfo.email || ''
    });
  },
  
  // 确认邮箱修改
  confirmEmail() {
    // 简单的邮箱验证
    const emailReg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    if (this.data.tempEmail && !emailReg.test(this.data.tempEmail)) {
      wx.showToast({
        title: '邮箱格式不正确',
        icon: 'none'
      });
      return;
    }
    
    const userInfo = { ...this.data.userInfo, email: this.data.tempEmail };
    this.setData({
      userInfo: userInfo,
      showEmailDlg: false
    });
  },
  
  // 取消邮箱修改
  cancelEmail() {
    this.setData({
      showEmailDlg: false
    });
  },
  
  // 保存用户信息
  saveUserInfo() {
    this.setData({
      isSaving: true
    });
    
    // 在实际应用中，这里应该调用API保存用户信息
    setTimeout(() => {
      // 保存到全局数据
      app.globalData.userInfo = this.data.userInfo;
      
      this.setData({
        isSaving: false
      });
      
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        success: () => {
          // 延迟返回上一页
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      });
    }, 1000);
  }
}) 