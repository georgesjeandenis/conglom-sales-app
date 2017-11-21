(function() {

"use strict";

angular.module('app.customers')
	.controller('CustomerController', controller);

// =======================
// Function definitions
// =======================

controller.$inject = ['$scope', '$state', 'localStorage', 'layoutLoading', '$stateParams', 'authentication', 'layoutErrorModal', 'customerSelector', '$filter'];

function controller( $scope, $state, localStorage, layoutLoading, $stateParams, authentication, layoutErrorModal, customerSelectorm, $filter ) {
	var salesPerson = authentication.getUser();

	$scope.createOrder = createOrder;

	$scope.customer = null;
	$scope.orders = {
		inProgress: [],
		pushed: [],
	};

	loadCustomer();

	// -------------

	function loadCustomer() {
		layoutLoading.show($filter('translate')('LOADING'));

		localStorage.getCustomer( $stateParams.customerId, salesPerson )
			.then(function( customer ) {
				$scope.customer = customer;
				loadOrders( customer );
			})
			.catch(function( error ) {
				layoutErrorModal.show( error );
			})
			.finally(function() {
				layoutLoading.hide();
			});
	}

	function loadOrders( customer ) {
		localStorage.getOrders( 'in-progress', salesPerson, customer )
			.then(function( orders ) {
				$scope.orders.inProgress = orders;
			})
			.catch(function( error ) {
				layoutErrorModal.show( error );
			});

		localStorage.getOrders( 'pushed', salesPerson, customer )
			.then(function( orders ) {
				$scope.orders.pushed = orders;
			})
			.catch(function( error ) {
				layoutErrorModal.show( error );
			});
	}

	function createOrder() {
		customerSelector.setCustomer( $scope.customer );
		$state.go('main.orders-new');
	}

}

})();