(function() {

"use strict";

angular.module('app.orders')
	.factory('Order', OrderFactory );

// =======================
// Function definitions
// =======================

function OrderFactory() {
	return Order;
}

// =======================
// Class definitions
// =======================

function Order( salesPerson ) {
	this.localStorageId = null;
	this.state = 'in-progress';
	this.orderNumber = '';
	this.shippingMethod = '';
	this._date = new Date();
	this._requestedShipDate = new Date();
	this._customer = null;
	this.salesPersonId = salesPerson.id;
	this.frozen = false;
}

angular.extend( Order.prototype, {
	getItemQuantity: function( item ) {
		if( ! this.items ) {
			return 0;
		}

		for( var i = 0; i < this.items.length; i++ ) {
			var itemData = this.items[i];
			
			if( itemData.item.itemNumber === item.itemNumber ) {
				return itemData.quantity;
			}
		}
	},

	calculateTotalPrice: function() {
		var total = 0;

		this.items.forEach(function( itemData ) {
			total += itemData.quantity * itemData.item.priceLevelData.price;
		});

		return total;
	},

	calculateNbItems: function() {
		var total = 0;

		this.items.forEach(function( itemData ) {
			total += itemData.quantity;
		});
		
		return total;
	},
});


Object.defineProperties( Order.prototype, {
	'customer': {
		get: function() { return this._customer; },
		/**
		 * When setting the customer, update some other properties
		 * (like currency).
		 * 
		 * @param  {object} customer customer object
		 */
		set: function( customer ) {
			this._customer = customer;
			if( customer ) {
				this.currency = customer.currency;
			}
		},
	},

	/**
	 * When setting the date, if a string, creates a new Date object
	 */
	'date': {
		get: function() { return this._date; },
		set: function( date ) { this._date = new Date( date ); }
	},

	/**
	 * Same as 'date'
	 */
	'requestedShipDate': {
		get: function() { return this._requestedShipDate; },
		set: function( date ) { this._requestedShipDate = new Date( date ); }
	},
});

})();