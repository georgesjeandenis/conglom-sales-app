(function() {

"use strict";

/**
 * A special service wrapped around $ionicLoading to display
 * the same loading across all the application. Also, if multiple
 * show() are called, an internal counter is used so the same
 * number of hide() must be called.
 */

angular.module('app.layout')
	.factory('layoutLoading', layoutLoading );

// =======================
// Function definitions
// =======================

layoutLoading.$inject = ['$ionicLoading'];

function layoutLoading( $ionicLoading ) {
	var counter = 0;

	return {
		show: show,
		hide: hide
	};

	// ---------------

	function show( template ) {
		counter += 1;
		$ionicLoading.show({ template: template });
	}

	function hide() {
		counter -= 1;

		if( counter <= 0 ) {
			$ionicLoading.hide();
			counter = 0;
		}
	}
}

})();