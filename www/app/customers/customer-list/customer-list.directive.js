(function() {

"use strict";

angular.module('app.customers')
	.directive('conglomCustomerList', directive);

// =======================
// Function definitions
// =======================

directive.$inject = ['$controller'];

function directive( $controller ) {
	return {
		restrict: 'E',
		scope: {
			onCustomerSelect: '&'
		},
		templateUrl: 'app/customers/customer-list/customer-list.html',
		controller: controller,
	};
}

// -----

controller.$inject = ['$scope', '$stateParams', '$state', 'localStorage', 'layoutLoading', 'authentication', 'customerSelector', 'layoutErrorModal', '$filter'];

function controller( $scope, $stateParams, $state, localStorage, layoutLoading, authentication, customerSelector, layoutErrorModal, $filter ) {
	$scope.customers = [];
	$scope.firstLoading = true;

	// See comment in item-list.controller.js for same attribute
	$scope.search = {
		value: '',
	};

	$scope.fetchCustomers = fetchCustomers;
	$scope.loadMoreCustomers = loadMoreCustomers;
	$scope.moreCustomersToLoad = moreCustomersToLoad;
	$scope.customerSelected = customerSelected;
	$scope.doSearch = doSearch;

	// -----------------

	var cursor = 0,
		nbToLoad = 50,
		moreToLoad = true,
		alreadyLoadingMore = false;

	function moreCustomersToLoad() {
		return moreToLoad;
	}

	function loadMoreCustomers() {
		var salesPerson = authentication.getUser();

		if( alreadyLoadingMore ) {
			return;
		}

		alreadyLoadingMore = true;
		
		layoutLoading.show('Building customer list');
		
		localStorage.getCustomers( salesPerson, { offset: cursor, nb: nbToLoad }, $scope.search.value )
			.then( function( customers ) {
				$scope.customers = $scope.customers.concat( customers );
				cursor += customers.length;
				moreToLoad = ( customers.length == nbToLoad );
			})
			.catch( function( error ) {
				moreToLoad = false;
				layoutErrorModal.show( error );
			})
			.finally( function() {
				$scope.firstLoading = false;
				layoutLoading.hide();
				alreadyLoadingMore = false;
				$scope.$broadcast('scroll.infiniteScrollComplete');
			});
	}

	function fetchCustomers() {
		layoutLoading.show($filter('translate')('DOWNLOADING_CUSTOMER_LIST'));

		localStorage.fetchCustomers()
			.then( success )
			.catch( error )
			.finally( function() {
				layoutLoading.hide();
				$scope.$broadcast('scroll.refreshComplete');
			});

		// ---------

		function success( response ) {
			resetList();
			loadMoreCustomers();
		}

		function error( error ) {
			layoutErrorModal.show( error );
		}
	}

	function customerSelected( customer ) {
		$scope.onCustomerSelect({ customer: customer });
	}

	function resetList() {
		cursor = 0;
		moreToLoad = true;
		$scope.customers = [];
	}

	function doSearch() {
		resetList();
		loadMoreCustomers();
	}
}

})();