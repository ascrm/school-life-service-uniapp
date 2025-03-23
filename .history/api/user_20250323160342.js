const http = require('../utils/request');

// 用户登录
const loginApi = (code, userInfo) => http.post(`/user/wx/login?code=${code}`, userInfo, false);

//退出登录
const logoutApi = () => http.post('/user/logout');

//修改用户数据
const updateUserInfoApi=( params )=>http.post("/user",params);

//获取用户数据
const getUserInfoApi=()=>http.get('/user');

//获取粉丝列表
const getFollowersApi=()=>{}

//获取关注列表
const getFolloweesApi=()=>{}

//获取互关列表
const getMutualsApi=()=>{}

module.exports = {
  loginApi,
	logoutApi,
  updateUserInfoApi,
	getUserInfoApi,
	getFollowersApi,
	getFolloweesApi,
	getMutualsApi,
}; 