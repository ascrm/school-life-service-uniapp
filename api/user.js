const http = require('../utils/request');

// 用户登录
const loginApi = (code, userInfo) => http.post(`/user/wx/login?code=${code}`, userInfo, false);

//退出登录
const logoutApi = () => http.post('/user/logout');

//修改用户数据
const updateUserInfoApi=( params )=>http.post("/user",params);

//获取用户数据
const getUserInfoApi=(params)=>http.get('/user',params);

//获取粉丝列表
const getFollowersApi=()=>http.get('/follow/fans');

//获取关注列表
const getFolloweesApi=()=>http.get('/follow/followees');

//获取互关列表
const getMutualsApi=()=>http.get('/follow/mutual');

//关注用户
const followUserApi=(userId)=>http.post(`/follow/${userId}`);

//取消关注用户
const unfollowUserApi=(userId)=>http.delete(`/follow/${userId}`);

//切换关注状态（关注/取消关注）
const toggleFollowApi=(followeeId)=>http.post(`/follow/change?followeeId=${followeeId}`);

//获取关注状态，是否关注
const getFollowStatusApi=(params)=>http.get('/follow/status',params)

module.exports = {
  loginApi,
	logoutApi,
  updateUserInfoApi,
	getUserInfoApi,
	getFollowersApi,
	getFolloweesApi,
	getMutualsApi,
  followUserApi,
  unfollowUserApi,
	toggleFollowApi,
	getFollowStatusApi
}; 