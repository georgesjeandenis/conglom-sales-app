(function() {

"use strict";

angular.module('app.items')
	.controller('ItemListController', controller);

// =======================
// Function definitions
// =======================

controller.$inject = ['$scope', 'localStorage', 'layoutLoading', 'customerSelector', 'layoutErrorModal', 'itemsAddToOrderModal', '$filter'];

function controller( $scope, localStorage, layoutLoading, customerSelector, layoutErrorModal, itemsAddToOrderModal, $filter ) {
	$scope.firstLoading = true;
	$scope.customer = customerSelector.getCustomer();
	$scope.items = [];

	// search must be an object since we need 2 way binding and
	// it can cause problem with a string primitive
	// see: https://github.com/angular/angular.js/wiki/Understanding-Scopes
	$scope.search = {
		value: '',
	};

	$scope.fetchItems = fetchItems;
	$scope.loadMoreItems = loadMoreItems;
	$scope.moreItemsToLoad = moreItemsToLoad;
	$scope.showCustomerSelector = showCustomerSelector;
	$scope.doSearch = doSearch;

	// -----------------

	var cursor = 0,
		nbToLoad = 99, // % 3 == 0
		alreadyLoadingMoreItems = false,
		moreToLoad = true;

	function moreItemsToLoad() {
		if( $scope.customer === null ) {
			return false;
		}

		return moreToLoad;
	}

	function loadMoreItems() {
		if( $scope.customer === null ) {
			return;
		}

		// Since different part of the code may call loadMoreItems,
		// we ignore any call until the last one is finished
		if( alreadyLoadingMoreItems ) {
			return;
		}

		alreadyLoadingMoreItems = true;

		var priceLevelCode = $scope.customer.priceLevelCode;

		layoutLoading.show($filter('translate')('BUILDING_ITEM_LIST'));

		localStorage.getItems( priceLevelCode, { offset: cursor, nb: nbToLoad }, $scope.search.value )
			.then( function( items ) {
				$scope.items = $scope.items.concat( items );
				cursor += items.length;
				moreToLoad = ( items.length == nbToLoad );
			})
			.catch( function( error ) {
				layoutErrorModal.show( error );
			})
			.finally( function() {
				$scope.firstLoading = false;
				alreadyLoadingMoreItems = false;
				layoutLoading.hide();
				$scope.$broadcast('scroll.infiniteScrollComplete');
			});
	}

	function fetchItems() {
		if( $scope.customer === null ) {
			return;
		}

		var priceLevelCode = $scope.customer.priceLevelCode;
		
		layoutLoading.show($filter('translate')('DOWNLOADING_ITEM_LIST'));

		localStorage.fetchItemsAndPriceLists( priceLevelCode )
			.then( success )
			.catch( error )
			.finally( function() {
				$scope.$broadcast('scroll.refreshComplete');
				layoutLoading.hide();
			});

		// ---------

		function success( response ) {
			resetItems();
			loadMoreItems();
		}

		function error( error ) {
			layoutErrorModal.show( error );
		}
	}

	function showCustomerSelector() {
		customerSelector.showSelector()
			.then(function( newCustomer ) {
				$scope.customer = newCustomer;
				resetItems();
				loadMoreItems();
			});
	}

	function doSearch() {
		resetItems();
		loadMoreItems();
	}

	function resetItems() {
		$scope.items = [];
		cursor = 0;
		moreToLoad = true;
	}
}

})();