(function() {

"use strict";

angular.module('app.items')
	.controller('ItemController', controller);

// =======================
// Function definitions
// =======================

controller.$inject = ['$scope', '$state', 'localStorage', 'layoutLoading', '$stateParams', 'customerSelector', 'layoutErrorModal', 'itemsAddToOrderModal', '$filter', '$translate'];

function controller( $scope, $state, localStorage, layoutLoading, $stateParams, customerSelector, layoutErrorModal, itemsAddToOrderModal, $filter, $translate ) {
	$scope.addToOrder = addToOrder;

	// If no customer is selected (should not happen, but just in case),
	// we redirect to customer list
	if( customerSelector.getCustomer() === null ) {
		$state.go('main.items-list');
		return;
	}

	loadItem();

	// -----------

	function loadItem() {
		var priceLevelCode = customerSelector.getCustomer().priceLevelCode;

		layoutLoading.show($filter('translate')('LOADING'));
		$scope.currentLanguage = $translate.use();
		console.log($scope.currentLanguage);
		localStorage.getItem( $stateParams.itemNumber, priceLevelCode )
			.then(function( item ) {
				$scope.item = item;
			})
			.catch(function( error ) {
				layoutErrorModal.show( error );
			})
			.finally(function() {
				layoutLoading.hide();
			});
	}

	function addToOrder() {
		itemsAddToOrderModal.show( $scope, $scope.item )
			.catch(function( error ) {
				layoutErrorModal.show( error );
			});
	}
}

})();