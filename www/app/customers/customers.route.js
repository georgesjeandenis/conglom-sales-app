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
		.state('main.customer-list', {
			url: '/customers?customerSelector',
			templateUrl: 'app/customers/list.html',
			controller: 'CustomerListController',
		})
		.state('main.customer-single', {
			url: '/customers/:customerId',
			templateUrl: 'app/customers/single.html',
			controller: 'CustomerController',
		});
}

})();