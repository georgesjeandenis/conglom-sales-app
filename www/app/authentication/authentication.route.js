(function() {

"use strict";

angular.module('app.Authentication')
	.run( runBlock );

// =======================
// Function definitions
// =======================

runBlock.$inject = ['$rootScope', '$state', 'authentication'];

function runBlock( $rootScope, $state, authentication ) {
	$rootScope.$on('$stateChangeStart', function( event, toState, toParams, fromState, fromParams ) {
		if( toState.data.authenticate && ! authentication.isAuthenticated() ) {
			$state.go('login');
			event.preventDefault();
		}
	});
}

})();