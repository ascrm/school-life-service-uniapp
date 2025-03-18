const http = require('./request');

// 用户登录
const loginApi = (code, userInfo) => http.post(`/user/wx/login?code=${code}`, userInfo, false);

//退出登录
const logoutApi = () => http.post('/user/logout');

module.exports = {
  loginApi,
  logoutApi,
}; 