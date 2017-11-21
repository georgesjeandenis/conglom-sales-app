(function() {

"use strict";

angular.module('app.Authentication')
	.factory('authentication', authentication );

// =======================
// Function definitions
// =======================

authentication.$inject = ['$q', 'Config', '$cordovaNetwork', '$window', 'localStorage'];

function authentication( $q, Config, $cordovaNetwork, $window, localStorage ) {
	var user = null,
		service = {
			authenticate: authenticate,
			getUser: getUser,
			isAuthenticated: isAuthenticated,
			logout: logout,
		};

	return service;

	// ---------------
	
	/**
	 * Checks if the username/password is valid.
	 * If a network connection is present, downloads, in
	 * localStorage, the list of credentials before querying.
	 * Then queries localStorage for the user.
	 * 
	 * If authenticate is successfull, sets the internal user.
	 * 
	 * Returns a promise object whose resolve() callback will
	 * return a boolean indicating if the user was successfully
	 * authenticated.
	 * 
	 * @param  {string} username
	 * @param  {string} password
	 * @return {$q}
	 */
	function authenticate( username, password ) {
		var isOnline = false;

		// If we are in a browser, the cordova network plugin
		// will not work and will generate an error so we fake it
		if( ! $window.connection ) {
			isOnline = true;
		} else {
			isOnline = $cordovaNetwork.isOnline();
		}

		if( isOnline ) {
			return localStorage.fetchSalesPersons()
				.then(function() {
					return checkUser();
				});
		} else {
			return checkUser();
		}

		function checkUser() {
			return localStorage.getSalesPerson( username, encodePassword( password ) )
				.then(function( salesPerson ) {
					user = salesPerson; // May be null if invalid credentials
					return ( salesPerson !== null );
				});
		}
	}

	function getUser() {
		if( Config.env == 'dev' && Config['env.dev.salesPersonId'] ) {
			return {
				id: Config['env.dev.salesPersonId']
			};
		}
		return user;
	}

	function isAuthenticated() {
		return getUser() !== null;
	}

	function logout() {
		user = null;
	}

	function encodePassword( password ) {
		var CryptoJS = $window.CryptoJS,
		    hash = CryptoJS.SHA512( password ),
		    encoded = hash.toString( CryptoJS.enc.Base64 );

		return encoded;
	}
}

})();