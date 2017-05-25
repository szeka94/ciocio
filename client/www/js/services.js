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

.factory('Match', function($ionicPopup, $http, Socket, User, API, $state, $q) {
	var current_user = User.getCurrentUsername();

	
	// Used to format the response
	// and populate $scope.vm
	function formatVM(data) {
		var obj = {
			isCreator: data.creator === current_user,
			matchCreated: data.match_created,
	        canJoin: data.players.indexOf(current_user) === -1 ? true : false,
	        playerNumber: data.num_players,
	        players: data.players
		};
		return obj;
	}

	function joinCurrentUser() {
		return $http({
			method: 'POST',
			url: API.url + 'match/join',
			data: { username: current_user }
		});
	}

	function acceptInvitation() {
		return $http({
			method: 'POST',
			url: API.url + 'invitation/accept',
			data: { username: current_user }
		});
	}


	function matchPopup(data) {
		var defered = $q.defer();
		var title = (data.type === 'invitation' ? 'You Are Invited by ' : 'New Match Created by ');
		if(data.creator !== current_user) {
            var newMatchPopup = $ionicPopup.show({
                title: title + data.creator,
                subTitle: 'Would you like to join?',
                buttons: [{
                    text: 'Cancel',
                    type: 'button button-outline button-stable'
                }, {
                    text: 'Join',
                    type: 'button, button-outline, button-positive',
                    onTap: function(e) {
                        // Socket.emit('join game', current_user);
                        if(data.type === 'invitation') {
                        	acceptInvitation()
                        		.then(function(success) {
                        			console.log('Success');
                        			defered.resolve(success);
                        		})
                        		.catch(function(error) {
                        			console.log('Error');
                        			defered.reject(error);
                        		});
                        } else {
	                        joinCurrentUser().then(function(success) {
	                        	console.log('Success');
	                        	defered.resolve(success);
	                        }, function(error) {
	                        	console.log('Error');
	                        	defered.reject(error);
	                        });
                        }
                    }
                }]
            });
        };
        return defered.promise;
	}


	// Initializing the vm
	// populating the obj from server
	function initState() {
		return $http({
			method: 'GET',
			url: API.url + 'match/initialize',
		}).then(function(success) {
			return formatVM(success.data);
		});
	}

	function deleteMatch(username) {
		return $http({
			method: 'POST',
			url: API.url + 'match/delete',
			data: { username: username }
		});
	}

	function createNewMatch(data) {
		return $http({
			method: 'POST',
			url: API.url + 'match/new',
			data: data
		}).then(function(success) {
			console.log(success);
			return success.data;
		}, function(error) {
			console.log(error);
			return error;
		});
	}

	function invitePerson(data) {
		return $http({
			method: 'POST',
			url: API.url + 'match/invite',
			data: data
		});
	}


	return {
		matchPopup: matchPopup,
		formatVM: formatVM,
		deleteMatch: deleteMatch,
		initState: initState,
		createNewMatch: createNewMatch,
		invitePerson: invitePerson
	}
})
