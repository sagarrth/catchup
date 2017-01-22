(function () {
  var catchUpMod = angular.module('catchUp',['ui.router']);

  catchUpMod.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('profile', {
      templateUrl : 'profile/profile.html',
      controller  : profileCtrl
    });
    $urlRouterProvider.otherwise('/profile');
  });
})();
