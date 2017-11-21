(function() {

"use strict";

angular.module('app.customers')
	.controller('CustomerListController', controller);

// =======================
// Function definitions
// =======================

controller.$inject = ['$scope', '$state'];

function controller( $scope, $state ) {
	$scope.customerClicked = customerClicked;

	// ------

	function customerClicked( customer ) {
		$state.go( 'main.customer-single', { customerId: customer.customerId } );
	}
}

})();