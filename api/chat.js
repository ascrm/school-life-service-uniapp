const http = require('../utils/request');

//获取历史消息记录
const getHistoryMessageApi=(params)=>http.get('/chat/history',params)

module.exports = {
	getHistoryMessageApi,
}