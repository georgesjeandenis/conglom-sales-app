(function() {

"use strict";

angular.module('app', [
		'app.core',

		'app.login',
		'app.customers',
		'app.items',
		'app.settings',
    'app.orders',
	])
	.run( runBlock );

// =======================
// Function definitions
// =======================

runBlock.$inject = ['$ionicPlatform'];

function runBlock( $ionicPlatform ) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
			window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}

		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			window.StatusBar.styleLightContent();
		}
	});
}

})();