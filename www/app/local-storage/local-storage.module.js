(function() {

"use strict";

angular.module('app.LocalStorage', ['app.core'])
	.run( runBlock );

// =======================
// Function definitions
// =======================

runBlock.$inject = ['$ionicPlatform', 'localStorage', 'layoutErrorModal'];

function runBlock( $ionicPlatform, localStorage, layoutErrorModal ) {
	$ionicPlatform.ready(function() {
		localStorage.install()
			.catch(function( error ) {
				layoutErrorModal.show( error );
			});
	});
}

})();