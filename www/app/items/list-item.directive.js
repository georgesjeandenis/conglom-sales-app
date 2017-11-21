(function() {

"use strict";

angular.module('app.items')
	.directive('conglomListItem', directive );

// =======================
// Function definitions
// =======================


directive.$inject = [];

function directive() {
	return {
		restrict: 'E',
		templateUrl: 'app/items/templates/list-item.html',
		scope: {
			item: '=',
			quantity: '=?',
			order: '=?',
		},
		controller: controller,
	};
}

// ---------------

controller.$inject = ['$scope', '$state', 'itemsAddToOrderModal', 'layoutErrorModal', 'customerSelector'];

function controller( $scope, $state, itemsAddToOrderModal, layoutErrorModal, customerSelector ) {
	$scope.canAddToOrder = ( typeof $scope.order === 'undefined' );
	$scope.canEditQuantity = ! $scope.canAddToOrder;
	$scope.useQuantity = $scope.canEditQuantity;
	$scope.addItemToOrder = addItemToOrder;
	$scope.editOrderItem = editOrderItem;
	$scope.itemClicked = itemClicked;

	// ------

	function addItemToOrder( item ) {
		itemsAddToOrderModal.show( $scope, item )
			.catch(function( error ) {
				layoutErrorModal.show( error );
			});
	}

	function editOrderItem( order, item ) {
		itemsAddToOrderModal.show( $scope, item, order )
			.catch(function( error ) {
				layoutErrorModal.show( error );
			});
	}

	function itemClicked( item ) {
		// If we are in an order, we set the customer in the customer selector
		if( $scope.order ) {
			customerSelector.setCustomer( $scope.order.customer );
		}

		$state.go( 'main.items-single', { itemNumber: item.itemNumber } );
	}
}

})();