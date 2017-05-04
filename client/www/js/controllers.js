angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, User, Match, Socket) {
    var username = User.getCurrentUsername();
    
    $scope.vm = {
        matchCreated: false,
        canJoin: false,
        playerNumber: 0,
        players: []
    };
        
    $scope.createMatch = function() {
        // use some logics in the templates
        // disable button, etc.
        $scope.vm.players.push(username);
        console.log($scope.vm.players);
        // Match.createMatch(username);
        Socket.emit('new match', username);
    };

    // Popup when somebody creates a match
    Socket.on('new match response', function(data) {
        data = JSON.parse(data);
        console.log(data.creator);
        console.log(username);
        // $scope.vm.canJoin = data.creator !== username ? true : false;
        // $scope.vm.matchCreated = true;
        // $scope.vm.playerNumber = data.player_num;
        Match.matchPopup(data);
    });

    // When somebody joins the game
    Socket.on('joined', function(data) {
        $scope.vm = Match.joined(data);
    });
})

.controller('InviteCtrl', function($scope, Match, User, Socket, LOCAL_TOKEN_KEY) {
// With the new view caching in Ionic, Controllers are only called
// when they are recreated or on app start, instead of every page change.
// To listen for when this page is active (for example, to refresh data),
// listen for the $ionicView.enter event:
//
//$scope.$on('$ionicView.enter', function(e) {
//});
    
    $scope.vm = {
        matchCreated: false,
        canJoin: false,
        playerNumber: 0,
        players: []
    };

    User.getUsers().then(function(data) {
        $scope.vm.people = data;
    });
    
    var current_user = User.getCurrentUsername();

    // Send invitation
    $scope.invite = function(person) {
        var data = {
            'person': person,
            'creator': current_user
        };
        Socket.emit('invite player', data);
    };
    
    // Recive invitation
    Socket.on(current_user, function(data) {
        console.log('You got an invitation from ' + data);
    });

    // Popup when somebody creates a match
    Socket.on('new match response', function(data) {
        data = JSON.parse(data);
        $scope.vm.matchCreated = true;
        $scope.vm.playerNumber = data.player_num;
        console.log(data.creator + ' created a match');
        Match.matchPopup(data);
    });
})

.controller('SettingsCtrl', function($state, Socket, Match, $scope, User) {
    $scope.vm = {
        settings: {
            enableFriends: true
        },
        destroyUser: destroyUser,
        matchCreated: false,
        playerNumber: 0
    };

    // Delete user locally and from DB
    function destroyUser() {
        User.destroyUserCredintals().then(function(success) {
            $state.go('login', {}, {reload: true});
        });
    }

    // Popup when somebody creates a match
    Socket.on('new match response', function(data) {
        data = JSON.parse(data);
        console.log(data);
        $scope.vm.matchCreated = true;
        $scope.vm.playerNumber = data.player_num;
        console.log(data.creator + ' created a match');
        Match.matchPopup(data);
    });
})

.controller('LoginCtrl', function($scope, $rootScope, API, User, $state) {
    $scope.data = {
        nickname: ''
    };
    $scope.errors = [];

    // Handle login
    $scope.login = function() {
        User.loginUser($scope.data).then(function(success) {
            $state.go('tab.dash');
        }, function(error) {
            console.log('Error');
        });
    };
});