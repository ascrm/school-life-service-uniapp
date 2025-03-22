const http = require('./request');

// 用户登录
const loginApi = (code, userInfo) => http.post(`/user/wx/login?code=${code}`, userInfo, false);

//退出登录
const logoutApi = () => http.post('/user/logout');

//修改用户数据
const updateUserInfoApi=( userInfo )=>http.post("/user",userInfo);

//获取用户数据
const getUserInfoApi=()=>http.get('/user');

module.exports = {
  loginApi,
	logoutApi,
  updateUserInfoApi,
  getUserInfoApi,
}; 