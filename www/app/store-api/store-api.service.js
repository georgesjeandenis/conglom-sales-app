(function() {

"use strict";

angular.module('app.StoreAPI')
	.factory('storeApi', storeApi );

// =======================
// Function definitions
// =======================
// 
storeApi.$inject = ['$http', '$q', 'Config', '$base64'];

function storeApi( $http, $q, Config, $base64 ) {
	var service = {
		getCustomers: getCustomers,
		getItems: getItems,
		getPriceLists: getPriceLists,
    getOrders: getOrders,
    postOrder: postOrder,
		getSalesPersons: getSalesPersons,
		call: call,
	};

	return service;

	// ---------

	/**
	 * Calls a method on the Store API.
	 *
	 * On success (HTTP and API call success), the returned Promise
	 * 'resolve' callback will be called with the 'data' attribute of
	 * the JSON response.
	 *
	 * On error (HTTP error or API call error), the returned Promise
	 * 'reject' callback will be called with an object:
	 * {
	 *   type: // {string} 'http' or 'api'
	 *   errorCode: // {string} HTTP or API error code
	 *   errorMessage: // {string} HTTP or API error message
	 *   apiResponse: // {object} If received, the returned JSON response
	 * }
	 *
	 * @param {string} httpMethod HTTP method to use (GET, POST)
	 * @param {string} apiMethod API method to call
	 * @param {object} params Request parameters to pass to the API as GET
	 * @return {$q} Promise object
	 */
	function call( httpMethod, apiMethod, params ) {
		var url = Config['storeApi.url'] + apiMethod,
			authData = $base64.encode( Config['storeApi.apiKey'] + ':' + Config['storeApi.apiSecret'] ),
			httpConfig = {
				method: httpMethod,
				url: url,
				headers: {
					'Authorization' : 'Basic ' + authData,
				},
			};

		if( httpMethod == 'GET' ) {
			httpConfig.params = params;
		} else {
			httpConfig.data = params;
		}

		return $http( httpConfig )
			.then( httpSuccess )
			.catch( httpError );

		// ----------

		function httpSuccess( response ) {
			var resolve, reject,
				promise = $q(function( resolveCallback, rejectCallback ) {
					resolve = resolveCallback;
					reject = rejectCallback;
				});

			if( response.status !== 200 ) {
				reject({
					type: 'http',
					errorCode: response.status,
					errorMessage: response.statusText,
					apiResponse: response.data,
				});

				return promise;
			}

			if( ! response.data.result || response.data.result !== 'ok' ) {
				reject({
					type: 'api',
					errorCode: response.data.errorCode || '__noErrorCode__',
					errorMessage: response.data.errorMessage || '__noErrorMessage__',
					apiResponse: response.data.data,
				});

				return promise;
			}

			resolve( response.data.data );

			return promise;
		}

		function httpError( response ) {
			return $q(function( resolve, reject ) {
				reject({
					type: 'http',
					errorCode: response.status,
					errorMessage: response.statusText,
					apiResponse: response.data,
				});
			});
		}
	}

	/**
	 * Queries all the customers.
	 * 
	 * @return {$q} Promise
	 */
	function getCustomers() {
		return service.call('GET', 'customers');
	}

	/**
	 * Queries all the items.
	 * 
	 * @return {$q} Promise
	 */
	function getItems() {
    var items = service.call('GET', 'items');
    console.log('got items: ', items);
    return items;
  }

	/**
	 * Queries all the price lists for a price level (because
	 * we generaly don't need to download all the price lists)
	 *
	 * @param {string} levelCode
	 * @return {$q} Promise
	 */
	function getPriceLists( levelCode ) {
		return service.call('GET', 'pricelists', { priceLevel: levelCode } );
	}

	/**
	 * Queries all the sales persons.
	 *
	 * @return {$q}
	 */
	function getSalesPersons() {
		return service.call('GET', 'salespersons');
	}

  /**
   * Gets the Orders list from the store Api.
   *
   * @return {$q}
   */
  function getOrders(  ) {
    var orders = service.call('GET', 'orders');
    console.log('got orders: ', orders);
    return orders;
  }

  /**
   * Posts an Order instance to the store Api.
   *
   * @param {Order} order
   * @return {$q}
   */
  function postOrder( order ) {
    return new $q(function( res, rej ) {
      console.warn('storeApi.postOrder: temp mode while waiting for working GPWS');
      res( order );
    });
    // var params = buildOrderPostObject( order );
    // return service.call('POST', 'orders', params );
  }

	/**
	 * From an Order instance, returns an object that can be send
	 * to the API when creating an order
	 */
	function buildOrderPostObject( order ) {
		var shippingAddress = buildAddress( order.customer.shippingAddress ),
		    billingAddress = buildAddress( order.customer.billingAddress ),
		    params = {
		    	referenceNumber: order.orderNumber,
		    	date: formatDate( order.date ),
		    	shippingMethod: order.shippingMethod,
		    	currency: order.customer.currency,
		    	customerAddress: billingAddress,
		    	items: order.items.map( buildItemObject ),
		    };

		if( ! angular.equals( shippingAddress, billingAddress ) ) {
			params.shippingAddress = shippingAddress;
		}

		return params;

		// ------

		function formatDate( date ) {
			var year = date.getFullYear(),
				month = date.getMonth(),
				day = date.getDate();

			if( month < 10 ) {
				month = '0' + month;
			}

			if( day < 10 ) {
				day = '0' + day;
			}

			return '' + year + month + day;
		}

		function buildItemObject( itemData ) {
			var quantity = itemData.quantity,
				item = itemData.item,
				res = {
					itemNumber: item.itemNumber,
					quantityOrdered: quantity,
					unitOfMeasure: item.priceLevelData.unitOfMeasure,
					unitPrice: item.priceLevelData.unitPrice,
				};

			return res;
		}

		function buildAddress( address ) {
			address.customerName = order.customer.name;
			return address;
		}
	}
}

})();

