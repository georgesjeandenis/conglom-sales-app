(function() {

"use strict";

angular.module('app.login')
	.config( configBlock );

// =======================
// Function definitions
// =======================

configBlock.$inject = ['$stateProvider', '$urlRouterProvider'];

function configBlock( $stateProvider, $urlRouterProvider ) {
	$stateProvider
		.state('login', {
			url: '/login',
			templateUrl: 'app/login/login.html',
			controller: 'LoginController as vm',
			data: {
				authenticate: false,
			}
		});
}

})();