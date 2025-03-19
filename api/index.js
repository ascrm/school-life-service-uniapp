// api/index.js
// API统一导出

const activity = require('./activity');
const discover = require('./discover');
const post = require('./post')
const publish = require('./publish');
const user = require('./user');

module.exports = {
	activity,
	discover,
	post,
	publish,
	user,
}; 