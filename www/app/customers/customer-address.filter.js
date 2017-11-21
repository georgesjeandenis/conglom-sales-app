(function() {

"use strict";

angular.module('app.customers')
	.filter('customerAddress', customerAddress);

// =======================
// Function definitions
// =======================

/**
 * Takes a customer address object (ex: customer.shippingAddress)
 * and returns the address as a human friendly version.
 * 
 * @param  {object} address
 * @return {string}
 */
function customerAddress() {
	return function( address ) {
		if( typeof address !== 'object' ) {
			return '';
		}

		var addressPart = address.address1
			+ ' ' + address.address2,
		cityProvincePart = address.city
			+ ' '
			+ '(' + address.stateProvince + ') '
			+ address.zipPostalCode;

		return addressPart + ', ' + cityProvincePart;
	};
}
})();