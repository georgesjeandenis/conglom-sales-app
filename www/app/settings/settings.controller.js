(function() {

"use strict";

angular.module('app.settings')
	.controller('SettingsController', controller);

// =======================
// Function definitions
// =======================

controller.$inject = ['$scope', '$state', 'localStorage', 'layoutErrorModal', 'authentication', '$translate'];

function controller( $scope, $state, localStorage, layoutErrorModal, authentication, $translate ) {
  $scope.dropTable = dropTable;
	$scope.logout = logout;

	// ----------

	function dropTable( tableName ) {
		var db = localStorage.db();

		db.transaction( function( tx ) {
			tx.executeSql('DROP TABLE ' + tableName );
		}, function( error ) {
			layoutErrorModal.show( error.message );
		});
	}

  $scope.language = $translate.use();

  $scope.switchLanguage = function(key) {
    $translate.use(key);
  };

	function logout() {
		authentication.logout();
		console.log('all');
		$state.go('login');
	}
}

})();