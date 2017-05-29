angular.module('starter.controllers', [])

.controller('DashCtrl', function($ionicDeploy, $scope, User, Match, Socket, $state) {
    var username = User.getCurrentUsername();
    
    $scope.$on('$ionicView.enter', function(e) {
        Match.initState().then(function(data) {
            console.log(data);
            $scope.vm = data;
        });
    });


    // Match creation
    $scope.createMatch = function() {
        Match.createNewMatch({ username: username }).then(function(data) {
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

    $scope.joinMatch = function() {
        Match.joinCurrentUser()
            .then(function(success) {
                console.log(success);
            })
            .catch(function(error) {
                console.log(error);
            });
    };


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

    // Listening to push notification
    $scope.$on('cloud:push:notification', function(event, data) {
        var msg = data.msg;
        alert(msg.title + ': ' + msg.text);
    });
})

.controller('InviteCtrl', function($ionicDeploy, $scope, Match, User, Socket, LOCAL_TOKEN_KEY) {
// With the new view caching in Ionic, Controllers are only called
// when they are recreated or on app start, instead of every page change.
// To listen for when this page is active (for example, to refresh data),
// listen for the $ionicView.enter event:
//
    $scope.$on('$ionicView.enter', function(e) {
        User.getUsers().then(function(data) {
            $scope.people = data
                .filter(function(person) {
                    return person.name !== current_user;
                })
                // .map(function(person) {
                //     person.invited = false;
                //     person.pending = false;
                //     person.approved = false;
                //     return person;
                // });
        });
        if($scope.inv.players.length > 0) {
            $scope.inv.invitation = true;
        }
    });
    
    $scope.vm = {
        matchCreated: false,
        canJoin: false,
        playerNumber: 0,
        players: []
    };
    $scope.inv = {
        players: [],
        invitation: false,
    };

    
    var current_user = User.getCurrentUsername();

    // Invite player
    $scope.invite = function(person) {
        // Socket.emit('invite player', data);
        var tmp = $scope.inv.players.filter(function(player) {
            return player.name === current_user;
        });
        if(tmp.length === 0) {
            $scope.inv.players.push({name: current_user});
        }
        $scope.inv.invitation = true;
        person.invited = true;
        $scope.inv.players.push(person);
        Match.invitePerson({ person: person, creator: current_user });
    };
    // Listen to accept/join
    Socket.on('accepted', function(data) {
        data = JSON.parse(data);
        if(data.creator === current_user) {
            $scope.inv.players = $scope.inv.players
                .map(function(player) {
                    if(player.name === data.username) {
                        player.approved = data.approved;
                    }
                    return player;
                });
        }
    });

    // Remove from invitation list
    $scope.remove = function(person) {
        person.invited = false;
        $scope.inv.players = $scope.inv.players.filter(function(p) {
            return p.name !== person.name;  
        });
        if($scope.inv.players.length == 0) {
            $scope.inv.invitation = false;
        }
    }
  




    // // Sending the invitations
    // $scope.sendInvitations = function() {
    //     data = {
    //         username: current_user,
    //         players: $scope.inv.players,
    //         type: 'invitation'
    //     };

    //     Match.sendInvitations(data.players)
    //         .then(function() {
    //             // Change the x to a pending sign
    //         });
    //     // Match.createNewMatch(data)
    //     //     .then(function(data) {
    //     //         console.log(data);
    //     //     });
    // }

    // Recive invitation
    Socket.on(current_user, function(data) {
        Match.matchPopup({
            type: 'invitation',
            creator: data
        });
    });

    // Popup when somebody creates a match
    Socket.on('new match response', function(data) {
        data = JSON.parse(data);
        $scope.vm.matchCreated = true;
        console.log('Invite fires');
        Match.matchPopup(data);
    });
})

.controller('SettingsCtrl', function($ionicDeploy, $state, Socket, Match, $scope, User) {
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
            $ionicPush.unregister();
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

.controller('LoginCtrl', function($ionicDeploy, $scope, $rootScope, API, User, $state, $ionicPush) {
    $scope.data = {
        nickname: ''
    };
    $scope.errors = [];

    // Handle login
    $scope.login = function() {
        User.loginUser($scope.data).then(function(success) {
            $ionicPush.register().then(function(t) {
                return $ionicPush.saveToken(t);
            }).then(function(t) {
                console.log('Token saved:', t.token);
            })
            $state.go('tab.dash');
        }, function(error) {
            console.log('Error');
        });
    };
});