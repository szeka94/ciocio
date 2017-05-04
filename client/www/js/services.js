angular.module('starter.services', [])

.factory('User', function($rootScope, $http, API, $q, LOCAL_TOKEN_KEY) {
	// store user
	$rootScope.user = null;

	function getCurrentUsername() {
		return window.localStorage.getItem(LOCAL_TOKEN_KEY.username);
	};

	function StoreUserCredintals(token, username) {
		window.localStorage.setItem(LOCAL_TOKEN_KEY.key, token);
		window.localStorage.setItem(LOCAL_TOKEN_KEY.username, username)
	};

	// This is wrong, I should fix something here
	function LoadUserCredintals() {
		var token = window.localStorage.getItem(LOCAL_TOKEN_KEY.key);
		if(token) {
			$rootScope.user = true;
		} else {
			$rootScope.user = false;
		}
	};

	function destroyUserCredintals() {
		var token = window.localStorage.getItem(LOCAL_TOKEN_KEY.key);
		var username = getCurrentUsername();

		return $http({
			method: 'POST',
			url: API.url + 'users/' + username +'/delete',
			data: token
		}).then(function(success) {
			console.log('succsess');
			$rootScope.user = false;
			window.localStorage.removeItem(LOCAL_TOKEN_KEY.key);
			window.localStorage.removeItem(LOCAL_TOKEN_KEY.username);
			return success;
		}, function(error) {
			if(error.status === 404) {
				window.localStorage.removeItem(LOCAL_TOKEN_KEY.key);
				window.localStorage.removeItem(LOCAL_TOKEN_KEY.username);
			}
			return error;
		});
	};

	function getUsers() {
		return $http({
			method: 'GET',
			url: API.url + 'users'
		}).then(function(success) {
			return success.data;
		}, function(error) {
			return error;
		});
	};

	function loginUser(data) {		
		var defered = $q.defer();

		$http({
			method: 'POST',
			url: API.url + 'users',
			data: data
		}).then(function(success) {
			$rootScope.user = true;
			StoreUserCredintals(success.data.token, success.data.username);
			console.log(success);
			return defered.resolve(success);
		}, function(error) {
			$rootScope.user = false;
			return defered.reject('error');
		});
		return defered.promise;
	};

	return {
		getUsers: getUsers,
		loginUser: loginUser,
		loadUserCredintals: LoadUserCredintals,
		destroyUserCredintals: destroyUserCredintals,
		getCurrentUsername: getCurrentUsername
	};
})

.factory('Socket', function(socketFactory, SOCKET_URL) {
	var myIoSocket = io.connect(SOCKET_URL.url);

	mySocket = socketFactory({
		ioSocket: myIoSocket
	});

	return mySocket;
})

.factory('Match', function($ionicPopup, $http, API, LOCAL_TOKEN_KEY, Socket, User) {
	var current_user = User.getCurrentUsername();

	function matchPopup(data) {
		if(data.creator !== current_user) {
            var newMatchPopup = $ionicPopup.show({
                title: 'New Match Created by ' + data.creator,
                subTitle: 'Would you like to join?',
                buttons: [{
                    text: 'Cancel',
                    type: 'button button-outline button-stable'
                }, {
                    text: 'Join',
                    type: 'button, button-outline, button-positive',
                    onTap: function(e) {
                        // On this tapp send the
                        // user credintals to the server
                        // initialize game etc..
                        Socket.emit('join game', current_user);
                    }
                }
                ]
            });
        };
	};

	// Used for populate vm
	// In the controller
	function joined(data) {
		var canJoin = false;
        data = JSON.parse(data);

		if(data.players.indexOf(current_user) !== -1) {
            canJoin = false;
        } else {
            canJoin = true;
        };
        
		return {
			matchCreated: data.matchCreated,
	        canJoin: canJoin,
	        playerNumber: data.num_players,
	        players: data.players
		};
	};


	return {
		matchPopup: matchPopup,
		joined: joined
	}
})
