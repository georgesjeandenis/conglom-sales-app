(function() {

"use strict";

angular.module('app.items')
	.factory('itemsAddToOrderModal', factory);

// =======================
// Function definitions
// =======================

factory.$inject = ['$ionicModal', 'customerSelector', 'localStorage', '$q', 'Order', '$state', 'authentication'];

function factory( $ionicModal, customerSelector, localStorage, $q, Order, $state, authentication ) {
	var modal, reject, resolve, q, itemsAddToOrder;

	var service = {
		show: show,
	};

	return service;

	// ---------------

	/**
	 * Shows the modal for the specified item. If order is specified
	 * the modal will be to add the item to the specified order
	 * (else an 'order' select will be shown).
	 * 
	 * @param  {scope} Scope the modal is a child
	 * @param  {object} item
	 * @param  {Order} order  Optionnal
	 */
	function show( scope, item, order ) {
		q = new $q( function( resFn, rejFn ) {
			resolve = resFn;
			reject = rejFn;
		});
		setupScope();
		showModal( scope );

		return q;

		// ------

		function setupScope() {
			itemsAddToOrder = scope.itemsAddToOrder = {
				item: item,
				quantity: 0,
				order: order,
				orders: null,
				mode: ( ! order ? 'add':'edit' ),
				close: close,
				save: save,
				removeItem: removeItem,
			};

			// If no order is specified, we get all the orders
			// of the current customer
			if( ! order ) {
				localStorage.getOrders( 'in-progress', authentication.getUser(), customerSelector.getCustomer() )
					.then(function( orders ) {
						itemsAddToOrder.orders = orders;
					});
			} else {
				itemsAddToOrder.quantity = order.getItemQuantity( item );
			}

		}
	}

	function showModal( scope ) {
		if( modal === undefined ) {
			$ionicModal.fromTemplateUrl('app/items/templates/add-to-order-modal.html', {
				scope: scope,
			}).then( function( createdModal ) {
				modal = createdModal;
				modal.show();
			});

			scope.$on('modal.removed', function() {
				modal = undefined;
			});
		} else {
			modal.show();
		}

	}

	function close() {
		resolve('cancelled');
		modal.hide()
			.then(function() {
				modal.remove();
			});
	}

	function save() {
		var item = itemsAddToOrder.item,
		    orderNumber = itemsAddToOrder.order,
		    quantity = itemsAddToOrder.quantity,
		    order = itemsAddToOrder.order;

		if( itemsAddToOrder.mode === 'add' ) {
			addToOrder( item, orderNumber, quantity );
		} else {
			updateQuantity( item, order, quantity );
		}
	}

	function removeItem() {
		var item = itemsAddToOrder.item,
		    order = itemsAddToOrder.order;

		updateQuantity( item, order, 0 );
	}

	function addToOrder( item, orderNumber, quantity ) {
		var order,
			isNewOrder = ( orderNumber === '__new__' );

		quantity = parseFloat( quantity );

		if( quantity === 0 ) {
			close();
		}

		if( ! orderNumber ) {
			return;
		}

		if( isNewOrder ) {
			order = new Order( authentication.getUser() );
			order.customer = customerSelector.getCustomer();

			localStorage.saveOrder( order )
				.then(function() {
					addItemToOrder();
				})
				.catch(function( error ) {
					reject( error );
				});
		} else {
			// The order received is a string of the orderNumber,
			// we must thus find the Order instance
			order = itemsAddToOrder.orders.reduce( function( prev, currentOrder ) {
				if( currentOrder.orderNumber === orderNumber ) {
					return currentOrder;
				} else {
					return prev;
				}
			}, null);

			addItemToOrder();
		}

		// ----------

		function addItemToOrder() {
			localStorage.addItemToOrder( item, order, quantity )
				.then(function() {
					resolve('saved');

					if( isNewOrder ) {
						$state.go('main.orders-edit', {orderId: order.localStorageId});
					}
				})
				.catch(function( error ) {
					reject( error );
				})
				.finally(function() {
					close();
				});
		}

	}

	function updateQuantity( item, order, quantity ) {
		localStorage.updateOrderItemQuantity( order, item, quantity )
			.then(function() {
				resolve('saved');
			})
			.catch(function( error ) {
				reject( error );
			})
			.finally(function() {
				close();
			});
	}
}

})();