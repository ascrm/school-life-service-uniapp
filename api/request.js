// api/request.js
// 基础请求封装

// 服务器基础地址
const BASE_URL = 'http://localhost:8080/school/web'; // 替换为您的实际API地址

/**
 * 封装网络请求
 * @param {String} url 请求地址
 * @param {String} method 请求方法
 * @param {Object} data 请求数据
 * @param {Boolean} needToken 是否需要token
 */
const request = (url, method = 'GET', data = {}, needToken = true) => {
  return new Promise((resolve, reject) => {
    // 拼接完整请求地址
    const requestUrl = `${BASE_URL}${url}`;
    
    // 获取token
    let header = {
      'content-type': 'application/json'
    };
    
    if (needToken) {
      const token = wx.getStorageSync('token');
      if (token) {
        header['Authorization'] = `${token}`;
      } else if (needToken) {
        // token不存在且需要token，跳转到登录页
        const app = getApp();
        app.checkLoginStatus();
        reject({ errMsg: '未登录' });
        return;
      }
    }
    
    // 显示加载中
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    
    wx.request({
      url: requestUrl,
      method,
      data,
      header,
      success: (res) => {
        // 服务器返回的数据格式可能需要根据实际情况调整
        if (res.statusCode === 200) {
          if (res.data.code === 0 || res.data.code === 200) {
            // 请求成功
            resolve(res.data.data);
          } else if (res.data.code === 401) {
            // token失效，需要重新登录
            wx.removeStorageSync('token');
            wx.removeStorageSync('userInfo');
            const app = getApp();
            app.globalData.isLoggedIn = false;
            app.checkLoginStatus();
            reject({ errMsg: '登录已过期，请重新登录' });
          } else {
            // 其他业务错误
            wx.showToast({
              title: res.data.msg || '请求失败',
              icon: 'none'
            });
            reject(res.data);
          }
        } else {
          // HTTP错误
          wx.showToast({
            title: `${res.statusCode} 请求失败`,
            icon: 'none'
          });
          reject({ errMsg: `HTTP错误 ${res.statusCode}` });
        }
      },
      fail: (err) => {
        // 网络错误
        wx.showToast({
          title: '网络错误，请检查网络连接',
          icon: 'none'
        });
        reject(err);
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  });
};

// 封装常用请求方法
const api = {
  get: (url, data = {}, needToken = true) => request(url, 'GET', data, needToken),
  post: (url, data = {}, needToken = true) => request(url, 'POST', data, needToken),
  put: (url, data = {}, needToken = true) => request(url, 'PUT', data, needToken),
  delete: (url, data = {}, needToken = true) => request(url, 'DELETE', data, needToken)
};

// 修改request.js，添加获取基础URL的方法
api.getBaseUrl = () => {
  return 'http://localhost:8080/school/web'; // 替换为您实际的API基础URL
};

module.exports = api;