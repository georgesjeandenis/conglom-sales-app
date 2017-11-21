(function() {

"use strict";

angular.module('app.orders')
	.controller('OrderEditController', controller );

// =======================
// Function definitions
// =======================

controller.$inject = ['$scope', '$state', '$stateParams', 'localStorage', 'Order', 'customerSelector', 'layoutErrorModal', '$ionicHistory', 'authentication'];

function controller( $scope, $state, $stateParams, localStorage, Order, customerSelector, layoutErrorModal, $ionicHistory, authentication ) {
	var isNew = $scope.isNew = ( $stateParams.orderId === undefined );

	$scope.save = save;
	$scope.selectCustomer = selectCustomer;
	$scope.isNew = isNew;

	initOrder();

	// ---------------

	function initOrder() {
		if( isNew ) {
			var order = $scope.order = new Order( authentication.getUser() );
			order.customer = customerSelector.getCustomer();
		} else {
			localStorage.getOrder( $stateParams.orderId, authentication.getUser() )
				.then( function( order ) {
					if( ! order.customer ) {
						order.customer = customerSelector.getCustomer();
					}
					$scope.order = order;
				})
				.catch(function( error ) {
					layoutErrorModal.show( error );
				});
		}
	}

	function save() {
		localStorage.saveOrder( $scope.order )
			.then(function() {
				$ionicHistory.goBack();
			})
			.catch(function( error ) {
				layoutErrorModal.show( error );
			});
	}

	function selectCustomer() {
		customerSelector.showSelector()
			.then(function( customer ) {
				$scope.order.customer = customer;
			})
			.catch(function( error ) {
				layoutErrorModal.show( error );
			});
	}
}

})();