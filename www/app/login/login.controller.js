(function() {

"use strict";

angular.module('app.login')
	.controller('LoginController', controller);

// =======================
// Function definitions
// =======================

controller.$inject = ['$scope', '$state', 'authentication', 'layoutLoading', 'layoutErrorModal'];

function controller( $scope, $state, authentication, layoutLoading, layoutErrorModal ) {
	$scope.signIn = signIn;
	$scope.invalidLoginCredentials = false;
	$scope.user = { username: '', password: '' };

	// --------

	function signIn() {
		var user = $scope.user;

		user.username = user.username ? user.username.trim() : '';

		if( ! user.username || ! user.password ) {
			return;
		}

		$scope.invalidLoginCredentials = false;

		layoutLoading.show();

		authentication.authenticate( user.username, user.password )
			.then(function( isAuthenticated ) {
				if( isAuthenticated ) {
					clearLoginForm();
					$state.go('main.customer-list');
				} else {
					$scope.invalidLoginCredentials = true;
				}
			})
			.catch(function( error ) {
				layoutErrorModal.show( error );
			})
			.finally(function() {
				layoutLoading.hide();
			});
	}

	function clearLoginForm() {
		$scope.user.username = $scope.user.password = '';
	}

}

})();