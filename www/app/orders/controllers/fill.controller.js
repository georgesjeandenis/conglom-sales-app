(function() {

"use strict";

angular.module('app.orders')
	.controller('OrderFillController', controller );

// =======================
// Function definitions
// =======================

controller.$inject = ['$scope', '$state', '$stateParams', 'localStorage', 'layoutErrorModal', 'customerSelector', '$ionicPopup', 'layoutLoading', 'authentication', '$filter'];

function controller( $scope, $state, $stateParams, localStorage, layoutErrorModal, customerSelector, $ionicPopup, layoutLoading, authentication, $filter ) {
	$scope.order = {};
	$scope.addItems = addItems;
	$scope.send = send;
	$scope.deleteOrder = deleteOrder;

	localStorage.getOrder( $stateParams.orderId, authentication.getUser() )
		.then( function( order ) {
			$scope.order = order;
		})
		.catch( function( error ) {
			layoutErrorModal.show( error );
		});

	// -------------

	function addItems() {
		customerSelector.setCustomer( $scope.order.customer );
		$state.go('main.items-list');
	}

	function send() {
		$ionicPopup.confirm({
			title: $filter('translate')('CONFIRM_ORDER_SEND'),
			template: $filter('translate')('FINALIZE_ORDER_WARNING'),
		})
		.then(function( res ) {
			if( res ) {
				doSendOrder();
			}
		});

		// ----------------

		function doSendOrder() {
			layoutLoading.show($filter('translate')('PLEASE_WAIT_SENDING_ORDER'));

			localStorage.pushOrder( $scope.order )
				.then(function() {
					$state.go('main.orders-view', { orderId: $scope.order.localStorageId });
				})
				.catch(function( error ) {
					layoutErrorModal.show( error );
				})
				.finally(function() {
					layoutLoading.hide();
				});
		}
	}

	function deleteOrder() {
		$ionicPopup.confirm({
			title: $filter('translate')('DELETE_ORDER_CONFIRMATION'),
			template: $filter('translate')('DELETE_ORDER_WARNING')
		})
			.then(function( confirmed ) {
				if( confirmed ) {
					localStorage.deleteOrder( $scope.order )
						.then(function() {
							$state.go('main.orders-list');
						})
						.catch( function( error ) {
							layoutErrorModal.show( error );
						});
				}
			});
	}
}

})();