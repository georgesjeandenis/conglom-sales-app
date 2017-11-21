(function() {

"use strict";

angular.module('app.orders')
	.controller('OrderListController', controller );

// =======================
// Function definitions
// =======================

controller.$inject = ['$scope', '$state', 'localStorage', 'layoutErrorModal', 'authentication'];

function controller( $scope, $state, localStorage, layoutErrorModal, authentication ) {
	$scope.orders = {};
	$scope.search = {
		value: ''
	};
	$scope.doSearch = doSearch;

	initOrders();

	// --------------

	function initOrders() {
		$scope.orders = {};

		localStorage.getOrders( 'in-progress', authentication.getUser(), null, null, $scope.search.value )
			.then(function( orders ) {
				$scope.orders.inProgress = orders;
			})
			.catch( errorCallback );
		
		localStorage.getOrders( 'pushed', authentication.getUser(), null, null, $scope.search.value )
			.then(function( orders ) {
				$scope.orders.pushed = orders;
			})
			.catch( errorCallback );
	}
	

	function errorCallback( error ) {
		layoutErrorModal.show( error );
	}

	function doSearch() {
		initOrders();
	}
}

})();