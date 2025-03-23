const http = require('./request')

//帖子点赞
const addLikePostApi=(params) => http.get("/post/like",params)

//根据帖子Id查询帖子详情
const getPostDetailApi=(params)=> http.get("/post",params)


module.exports={
	addLikePostApi,
}