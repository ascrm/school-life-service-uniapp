const http = require('./request')

// 上传单个文件
const uploadImageApi = (file) => {
	return new Promise((resolve, reject) => {
		wx.uploadFile({
			url: http.getBaseUrl() + '/upload',
			filePath: file.path,
			header: {
				'Authorization': wx.getStorageSync('token')
			},
			name: 'file',
			success: (res) => {
				if (res.statusCode === 200) {
					try {
						const data = JSON.parse(res.data);
						if (data.code === 200 && data.data) {
							resolve(data.data);
						} else {
							reject(new Error(data.msg || '上传失败'));
						}
					} catch (e) {
						reject(new Error('解析响应失败'));
					}
				} else {
					reject(new Error(`上传失败，状态码：${res.statusCode}`));
				}
			},
			fail: (err) => {
				reject(err);
			}
		});
	});
}

// 发布帖子
const publishPostApi = (postsDto) => {
	return http.post('/post', postsDto);
}

// 获取所有标签
const getAllTagsApi = () => {
	return http.get('/tags');
}

module.exports = {
	uploadImageApi,
	publishPostApi,
	getAllTagsApi,
}