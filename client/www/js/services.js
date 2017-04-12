angular.module('starter.services', [])

.factory('User', function($http, API, $q) {
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

	function loginUser(user) {
		var defered = $q.defer();

		errors = validateUserCredintals(user);

		if(errors.length > 0) {
			return defered.reject('errors');
		};

		$http({
			method: 'POST',
			url: API.url + 'users',
			data: user
		}).then(function(success) {
			console.log('We have succeded in service!');
			return defered.resolve(success);
		}, function(error) {
			console.log('We got an error in service!');
			return defered.reject('error');
		});

		return defered.promise;
	};

	function validateUserCredintals(data) {
		var errors = [];
		var users = [];

        if((data.nickname == '') || (data.nickname === undefined)) {
            errors.push('Nickname field should not be empty');
        }

        getUsers().then(function(users) {
        	users = users;
	    	users.filter(function(value) {
	    		console.log(value.name);
	            if(value.name === data.nickname) {
	                errors.push(value.name + ' is already in use.');
	            }
	        });
        }, function(error) {
        	console.log('Something went wrong!');
        });
        return errors;  
	};

	return {
		getUsers: getUsers,
		loginUser: loginUser
	};
});
