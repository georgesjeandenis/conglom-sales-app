(function() {

"use strict";

angular.module('app.CustomerSelector')
	.controller('CustomerSelectorController', controller);

// =======================
// Function definitions
// =======================

controller.$inject = ['$scope'];

function controller( $scope ) {
	$scope.customerSelected = customerSelected;

	// ------------

	function customerSelected( customer ) {
		$scope.customerSelectorSelection( customer );
	}
}

})();