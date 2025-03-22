const http = require('./request')

//查询所有分类
const getAllCategoriesApi=()=> http.get('/categories',{},false)


//根据分类id查询所有帖子
const getPostsByCategoryIdApi=(categoryId, earliestDateTimeStr)=>{
	let url = '/posts/category';
	const params = {};
	
	if(categoryId !== undefined && categoryId !== null) {
		params.categoryId = categoryId;
	}
	
	if(earliestDateTimeStr) {
		params.earliestDateTimeStr = earliestDateTimeStr;
	}
	
	return http.get(url, params,false);
}

module.exports = {
	getAllCategoriesApi,
	getPostsByCategoryIdApi
}