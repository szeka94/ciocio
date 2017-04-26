angular
	.module('starter.constants', [])
	.constant('API', {
		'url': 'http://localhost:5000/api/',
	})
	.constant('LOCAL_TOKEN_KEY', {
		'key': 'Key',
		'username': 'username'
	})
	.constant('SOCKET_URL', {
		'url': 'http://localhost:5000'
	});