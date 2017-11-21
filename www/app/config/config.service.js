(function() {

"use strict";

angular.module('app.Config')
	.factory('Config', config );

// =======================
// Function definitions
// =======================

function config() {
	var internalConfig = {};

	var service = {
		get: get,
		set: set,
	};

	// -------------

	function get( key ) {
		return internalConfig[ key ];
	}

	function set( key, value ) {
		internalConfig[ key ] = value;
	}
}
})();