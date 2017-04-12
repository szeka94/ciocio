angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {
    $scope.createMatch = function() {
        console.log('Somebody wants to create a Match.')
    };
})

.controller('InviteCtrl', function($scope, User) {
// With the new view caching in Ionic, Controllers are only called
// when they are recreated or on app start, instead of every page change.
// To listen for when this page is active (for example, to refresh data),
// listen for the $ionicView.enter event:
//
//$scope.$on('$ionicView.enter', function(e) {
//});

    User.getUsers().then(function(data) {
        $scope.people = data;
    });

    $scope.invite = function(person) {
        console.log('One person: ' + person.name + ' got invited!');
    };
})

.controller('SettingsCtrl', function($scope) {
    $scope.settings = {
        enableFriends: true
    }
})

.controller('LoginCtrl', function($scope, API, User, $state) {
    $scope.data = {
        nickname: ''
    };
    $scope.errors = [];

    // Handle login
    $scope.login = function() {
        User.loginUser($scope.data).then(function(success) {
            // Login successfull
            // Some token should be saved on localStorage
            // Using some service
            $state.go('tab.dash');
        }, function(error) {
            console.log('Error');
        });
    };

});