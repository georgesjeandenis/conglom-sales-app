(function() {

"use strict";

angular.module('app.CustomerSelector')
	.factory('customerSelector', customerSelector);

// =======================
// Function definitions
// =======================

customerSelector.$inject = ['$state', '$q', '$ionicModal'];

function customerSelector( $state, $q, $ionicModal ) {
	var selectorModal = null,
		selectorResolve, selectorReject,
	    customer = null;

	var service = {
		getCustomer: getCustomer,
		setCustomer: setCustomer,
		showSelector: showSelector,
	};

	return service;

	// ---------

	function getCustomer() {
		return customer;
	}

	function setCustomer( newCustomer ) {
		customer = newCustomer;
	}

	/**
	 * Shows a modal that allows selecting a customer. Returns
	 * a promise object whose resolve function will receive
	 * the customer selected.
	 *
	 * @return {$q}
	 */
	function showSelector() {
		return new $q(function( resFn, rejFn ) {
				selectorResolve = resFn;
				selectorReject = rejFn;
				executor();
		    });

		// ---

		function executor() {
	    	if( selectorModal === null ) {
				buildSelectorModal()
					.then(function() {
						selectorModal.show();
					});
			} else {
				selectorModal.show();
			}
		}
	}

	function buildSelectorModal() {
		return $ionicModal.fromTemplateUrl('app/customer-selector/selector-modal.html', {
		})
			.then(function( modal ) {
				selectorModal = modal;
				selectorModal.scope.customerSelectorSelection = function( customer ) {
					service.setCustomer( customer );
					selectorResolve( customer );
					selectorModal.hide();
					return modal;
				};
			});
	}
}

})();