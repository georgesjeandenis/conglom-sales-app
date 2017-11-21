(function() {

"use strict";

angular.module('app.customers')
	.config( configBlock );

// =======================
// Function definitions
// =======================

configBlock.$inject = ['$stateProvider', '$urlRouterProvider'];

function configBlock( $stateProvider, $urlRouterProvider ) {
	$stateProvider
		.state('main.items-list', {
			url: '/items',
			templateUrl: 'app/items/templates/list.html',
			controller: 'ItemListController',
		})
		.state('main.items-single', {
			url: '/items/:itemNumber',
			templateUrl: 'app/items/templates/single.html',
			controller: 'ItemController',
		});
}

})();