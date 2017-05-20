angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, User, Match, Socket, $state) {
    var username = User.getCurrentUsername();
    
    $scope.$on('$ionicView.enter', function(e) {
        Match.initState().then(function(data) {
            console.log(data);
            $scope.vm = data;
        });
    });


    // Match creation
    $scope.createMatch = function() {
        Match.createNewMatch(username).then(function(data) {
            $scope.vm = data;
        })
        // Socket.emit('new match', username);
    };
    // Brodacasted 'new match' msg from the server
    Socket.on('new match response', function(data) {
        data = JSON.parse(data);
        // populating vm
        $scope.vm = Match.formatVM(data);
        Match.matchPopup(data).then(function(data) {
            console.log(data);
            $scope.vm = data.data;
        });
    });


    // Delete Match
    $scope.deleteMatch = function() {
        Match.deleteMatch(username);
    };
    // broadcasted ping from the server
    Socket.on('refresh', function(players) {
        // refresh on the new-state
        Match.initState().then(function(data) {
            console.log(data);
            $scope.vm = data;
        });
    });

    // When somebody joins the game
    Socket.on('joined', function() {
        Match.initState().then(function(data) {
            $scope.vm = data;
        });
    });





})

.controller('InviteCtrl', function($scope, Match, User, Socket, LOCAL_TOKEN_KEY) {
// With the new view caching in Ionic, Controllers are only called
// when they are recreated or on app start, instead of every page change.
// To listen for when this page is active (for example, to refresh data),
// listen for the $ionicView.enter event:
//
    $scope.$on('$ionicView.enter', function(e) {
        User.getUsers().then(function(data) {
            $scope.people = data;
        })
    });
    
    $scope.vm = {
        matchCreated: false,
        canJoin: false,
        playerNumber: 0,
        players: []
    };

    
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
        console.log('Invite fires');
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