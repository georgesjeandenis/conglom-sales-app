(function() {

"use strict";

angular.module('app.orders')
	.controller('OrderViewController', controller );

// =======================
// Function definitions
// =======================

controller.$inject = ['$scope', '$state', '$stateParams', 'localStorage', 'Order', 'customerSelector', 'layoutErrorModal', '$ionicHistory', 'authentication'];

function controller( $scope, $state, $stateParams, localStorage, Order, customerSelector, layoutErrorModal, $ionicHistory, authentication ) {
	initOrder();

	// ---------------

	function initOrder() {
		localStorage.getOrder( $stateParams.orderId, authentication.getUser() )
			.then( function( order ) {
				console.log( order );
				$scope.order = order;
			})
			.catch(function( error ) {
				layoutErrorModal.show( error );
			});
	}
}

})();