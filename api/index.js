// api/index.js
// API统一导出

const user = require('./user');
const activity = require('./activity');
const post = require('./post')

module.exports = {
  user,
  activity,
  post,
}; 