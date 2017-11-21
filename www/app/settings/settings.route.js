(function() {

"use strict";

angular.module('app.settings')
	.config( configBlock );

// =======================
// Function definitions
// =======================

configBlock.$inject = ['$stateProvider', '$urlRouterProvider'];

function configBlock( $stateProvider, $urlRouterProvider ) {
	$stateProvider
		.state('main.settings', {
			url: '/settings',
			templateUrl: 'app/settings/settings.html',
			controller: 'SettingsController',
		});
}

})();