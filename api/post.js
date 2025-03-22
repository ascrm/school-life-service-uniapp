const http = require('./request')

//帖子点赞
const addLikePostApi=(id) => http.get("/post/like",{postId:id})


module.exports={
	addLikePostApi,
}