(function() {

"use strict";

angular.module('app.layout')
	.directive('conglomTab', factory );

// =======================
// Function definitions
// =======================

function factory() {
	return {
		restrict: 'E',
		scope: {
			title: '@',
		},
		templateUrl: 'app/layout/conglom-tabs/conglom-tab.html',
		transclude: true,
		link: link,
		require: '^^conglomTabs'
	};
}

// ------

function link( scope, iElement, iAttrs, tabsController ) {
	tabsController.addPane( scope );
}

})();