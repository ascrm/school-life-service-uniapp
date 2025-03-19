const http = require('./request')

//查询所有分类
const getAllCategoriesApi=http.get('/categories')

module.exports = {
	getAllCategoriesApi,
}