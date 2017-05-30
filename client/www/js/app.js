// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
    'ionic',
    'ionic.cloud',
    'btford.socket-io',
    'starter.controllers',
    'starter.services',
    'starter.constants',
    'ngCordova'
    ])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        };

        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

.run(function($rootScope, $state, User, LOCAL_TOKEN_KEY) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        User.loadUserCredintals();
        if(toState.name === 'login') {
            return;
        }
        if(!$rootScope.user) {
            event.preventDefault();
            $state.go('login', {}, {reload: true});
        } else {
            return;
        };
    });
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider, $ionicCloudProvider) {
// Fix for CORS
$httpProvider.defaults.headers.common = {};
$httpProvider.defaults.headers.post = {};
$httpProvider.defaults.headers.put = {};
$httpProvider.defaults.headers.patch = {};


    $ionicCloudProvider.init({
        "core": {
            "app_id": "bcdd5960"
        },
        "push": {
            "sender_id": "GCM_PROJECT_NUMBER",
            "pluginConfig": {
                "ios": {
                    "badge": true,
                    "sound": true
                },
                "android": {
                    "iconColor": "#343434"
                }
            }
        }
    });



// Ionic uses AngularUI Router which uses the concept of states
// Learn more here: https://github.com/angular-ui/ui-router
// Set up the various states which the app can be in.
// Each state's controller can be found in controllers.js
$stateProvider

// setup an abstract state for the tabs directive
.state('login', {
    url: '/login',
    templateUrl: 'templates/tab-login.html',
    controller: 'LoginCtrl'
})

.state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'


})

// Each tab has its own nav history stack:

.state('tab.dash', {
    url: '/dash',
    views: {
        'tab-dash': {
            templateUrl: 'templates/tab-dash.html',
            controller: 'DashCtrl'
        }
    }
})

.state('tab.invite', {
    url: '/invite',
    views: {
        'tab-invite': {
            templateUrl: 'templates/tab-invite.html',
            controller: 'InviteCtrl'
        }
    }
})

.state('tab.settings', {
    url: '/settings',
    views: {
        'tab-settings': {
            templateUrl: 'templates/tab-settings.html',
            controller: 'SettingsCtrl'
        }
    }
});
// if none of the above states are matched, use this as the fallback
$urlRouterProvider.otherwise('/tab/dash');
});