(function() {

"use strict";

angular.module('app')
	.config( configBlock );

// =======================
// Function definitions
// =======================

configBlock.$inject = ['$stateProvider', '$urlRouterProvider'];

function configBlock( $stateProvider, $urlRouterProvider ) {
	$stateProvider
		// setup an abstract state for the tabs directive
		.state('main', {
			abstract: true,
			templateUrl: "app/layout/main.html",
			data: {
				authenticate: true,
			}
		});

	// When root, go to login
	$urlRouterProvider.when('', '/login');
}

})();