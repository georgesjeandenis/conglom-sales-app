(function() {

"use strict";

angular.module('app.layout')
	.directive('conglomTabs', factory );

// =======================
// Function definitions
// =======================

function factory() {
	return {
		restrict: 'E',
		scope: {},
		templateUrl: 'app/layout/conglom-tabs/conglom-tabs.html',
		transclude: true,
		controller: controller
	};
}

// ---------

controller.$inject = ['$scope'];

function controller( $scope ) {
	var panes = $scope.panes = [];

	$scope.showPane = function( pane ) {
		angular.forEach( panes, function( pane ) {
			pane.selected = false;
		});
		pane.selected = true;
	};

	this.addPane = function( pane ) {
		if( panes.length === 0 ) {
			$scope.showPane( pane );
		}
		panes.push( pane );
	};
}

})();