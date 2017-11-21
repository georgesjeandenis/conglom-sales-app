(function() {

"use strict";

/**
 * Returns a service used to show error messages in a modal.
 */

angular.module('app.layout')
	.factory('layoutErrorModal', layoutErrorModal );

// =======================
// Function definitions
// =======================

layoutErrorModal.$inject = ['$rootScope', '$ionicModal'];

function layoutErrorModal( $rootScope, $ionicModal ) {
	var modal;
	
	$rootScope.closeErrorModal = closeModal;

	return {
		show: show
	};

	// ---------------

	function show( message ) {
		$rootScope.errorMessage = message;

		if( ! modal ) {
			$ionicModal.fromTemplateUrl('app/layout/error-modal.html', {
				scope: $rootScope,
				hardwareBackButtonClose: false,
			}).then( function( ionicModalController ) {
				modal = ionicModalController;
				showModal( message );
			});
		} else {
			showModal( message );
		}
	}

	function showModal( message ) {
		modal.show();
	}

	function closeModal() {
		modal.hide();
	}
}

})();