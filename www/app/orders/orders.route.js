(function() {

"use strict";

angular.module('app.orders')
	.config( configBlock );

// =======================
// Function definitions
// =======================

configBlock.$inject = ['$stateProvider', '$urlRouterProvider'];

function configBlock( $stateProvider, $urlRouterProvider ) {
	$stateProvider
		.state('main.orders-list', {
			url: '/orders',
			templateUrl: 'app/orders/templates/list.html',
			controller: 'OrderListController',
		})
		.state('main.orders-new', {
			url: '/orders/new',
			templateUrl: 'app/orders/templates/edit.html',
			controller: 'OrderEditController',
			cache: false,
		})
		.state('main.orders-edit', {
			url: '/orders/edit/:orderId',
			templateUrl: 'app/orders/templates/edit.html',
			controller: 'OrderEditController',
			cache: false,
		})
		.state('main.orders-view', {
			url: '/orders/view/:orderId',
			templateUrl: 'app/orders/templates/view.html',
			controller: 'OrderViewController',
		})
		.state('main.orders-fill', {
			url: '/orders/fill/:orderId',
			templateUrl: 'app/orders/templates/fill.html',
			controller: 'OrderFillController',
			cache: false,
		})
		.state('main.orders-finalize', {
			url: '/orders/finalize',
			templateUrl: 'app/orders/templates/finalize.html',
		})
		.state('main.orders-complete', {
			url: '/orders/complete',
			templateUrl: 'app/orders/templates/complete.html',
		});
}

})();