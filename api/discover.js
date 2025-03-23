const http = require('./request')

//查询所有分类
const getAllCategoriesApi=()=> http.get('/categories',{},false)


//根据分类id查询所有帖子
const getPostsByCategoryIdApi=(params)=>http.get('/posts/category', params,false);

module.exports = {
	getAllCategoriesApi,
	getPostsByCategoryIdApi
}