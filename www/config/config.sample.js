(function() {

"use strict";

var config = {
	'storeApi.url' : 'http://conglomapis.com/v1/',
	'storeApi.apiKey' : 'APIKEY',
	'storeApi.apiSecret' : 'APISECRET',
	'env': 'prod',
	//'env.dev.salesPersonId' : 'ZZ',
};

// ---------------

angular.module('app')
	.constant( 'Config', config );

})();