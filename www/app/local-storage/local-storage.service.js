(function() {

"use strict";

angular.module('app.LocalStorage')
	.factory('localStorage', localStorage );

// =======================
// Function definitions
// =======================

localStorage.$inject = ['storeApi', '$window', '$q', 'Order'];

function localStorage( storeApi, $window, $q, Order ) {
	var dbName = 'conglom-salesapp.db',
		mainTableAlias = 't1';

	var service = {
		install: install,
		getCustomers: getCustomers,
		getCustomer: getCustomer,
		fetchCustomers: fetchCustomers,
		getItems: getItems,
		getItem: getItem,
		fetchItems: fetchItems,
		fetchPriceLists: fetchPriceLists,
		fetchItemsAndPriceLists: fetchItemsAndPriceLists,
		getOrders: getOrders,
		getOrder: getOrder,
		saveOrder: saveOrder,
		addItemToOrder: addItemToOrder,
		updateOrderItemQuantity: updateOrderItemQuantity,
		pushOrder: pushOrder,
		deleteOrder: deleteOrder,
		fetchSalesPersons: fetchSalesPersons,
    getSalesPerson: getSalesPerson,
    getLanguage: getLanguage,
    setLanguage: setLanguage,
		db: db,
	};

	return service;

	// ---------

	/**
	 * Returns the SQLite database for the local storage. Note that a cordova
	 * plugin is used for SQLite, but if tested in a browser with WebSQL capabilities,
	 * it will be used instead.
	 * 
	 * @requires https://github.com/litehelpers/Cordova-sqlite-storage
	 * @return Database object
	 */
	function db() {
		if( $window.sqlitePlugin ) {
			return $window.sqlitePlugin.openDatabase({ name: dbName, location: 2 });
		} else {
			// Special case for development : if window.sqlitePlugin is not set
			// and we are on a server (http://), we use the browser's WebSQL
			if( $window.location.protocol == 'http:' && $window.openDatabase ) {
				return $window.openDatabase( dbName, '1.0', dbName, 10 * 1024 * 1024 );
			}
		}

		return null;
	}

	/**
	 * Creates the DB schemas. Returns a promise object.
	 * 
	 * @return {$q}
	 */
	function install() {
		return $q( executor );

		// ----

		function executor( resolve, reject ) {
			var db = service.db();

			if( db === null ) {
				reject('Could not get database instance in localStorage.install');
			} else {
				db.transaction( function( tx ) {
					tx.executeSql('CREATE TABLE IF NOT EXISTS customers (id integer primary key, customerId text, salesPersonId text, searchTerms text, data text);');
					tx.executeSql('CREATE TABLE IF NOT EXISTS items (id integer primary key, itemNumber text, searchTerms text, data text);');
					tx.executeSql('CREATE TABLE IF NOT EXISTS pricelists (id integer primary key, itemNumber text, priceLevelCode text, data text);');
					tx.executeSql('CREATE TABLE IF NOT EXISTS orders (id integer primary key, orderNumber text, customerId text, salesPersonId text, state text, searchTerms text, data text, storeRef text);');
					tx.executeSql('CREATE TABLE IF NOT EXISTS orders_items (id integer primary key, orderId integer, itemNumber text, quantity real);');
          tx.executeSql('CREATE TABLE IF NOT EXISTS salespersons (id integer primary key, aliases text, password text, data text);');
          tx.executeSql('CREATE TABLE IF NOT EXISTS settings (name text primary key, value text);');
				}, function( e ) {
					reject('SQLite error for localStorage.install: ' + e.message );
				}, function() {
					resolve();
				});
			}
		}
	}

	/**
	 * Retrieves all the customers for a specific Sales Person.
	 * Returns a promise object.
	 *
	 * @param {object} forSalesPerson User object returned by Authentication
	 * @param {object} params Passed to getObjects
	 * @param {string} search Optionnal search string
	 * @return {$q}
	 */
	function getCustomers( forSalesPerson, params, search ) {
		params = initSQLParams( params );
		params.where.salesPersonId = forSalesPerson.id;

		search = ( search ? search.toString().trim().toLowerCase() : '' );

		if( search ) {
			params.where.searchTerms = {
				operator: 'LIKE',
				value: '%' + search + '%',
			};
		}

		return getObjects( 'customers', params );
	}

	/**
	 * Retrieves a single customer. Returns a promise object.
	 *
	 * @param {object} string customerId
	 * @param {object} forSalesPerson User object returned by Authentication
	 * @param {object} params Passed to getObjects
	 * @return {$q}
	 */
	function getCustomer( customerId, forSalesPerson, params ) {
		params = initSQLParams( params );
		params.where.customerId = customerId;

		return getCustomers( forSalesPerson, params )
			.then(function( customers ) {
				if( customers.length ) {
					return customers[0];
				}
				return null;
			});
	}

	/**
	 * Retrieves all the items for a specific price level.
	 * All items have their attributes adjusted for the price level.
	 * Returns a promise object.
	 *
	 * @param {string} forPriceLevel
	 * @param {object} params Passed to getObjects
	 * @param {string} search Optionnal search string
	 * @return {$q}
	 */
	function getItems( forPriceLevel, params, search ) {
		params = angular.extend( initSQLParams( params ), {
			additionalSelect: 'pricelists.data as priceLevelData',
			join: 'INNER JOIN pricelists USING (itemNumber)',
			groupBy: 'GROUP BY ' + mainTableAlias + '.itemNumber',
		});
		params.where.priceLevelCode = forPriceLevel;

		search = ( search ? search.toString().trim().toLowerCase() : '' );

		if( search ) {
			params.where.searchTerms = {
				operator: 'LIKE',
				value: '%' + search + '%',
			};
		}

		return getObjects( 'items', params, false, ['priceLevelData'] )
			.then(function( itemsData ) {
				// For each itemsData, we have the following fields :
				// data: objects representing the item
				// priceLevelData: object representing price data for this item
				// We want to return the content of 'data' which has 'priceLevelData' added
				return itemsData.map(function( itemData ) {
					itemData.data.priceLevelData = itemData.priceLevelData;
					delete itemData.priceLevelData;
					return itemData.data;
				});
			});
	}

  /**
   * Retrieves a single item. The item has its attributes
   * (ex: price) adjusted for the price level.
   * Returns a promise object.
   *
   * @param {string} itemNumber
   * @param {string} forPriceLevel
   * @param {object} params Passed to getObjects
   * @return {$q}
   */
  function getItem( itemNumber, forPriceLevel, params ) {
    params = initSQLParams( params );
    params.where.itemNumber = itemNumber;

    return getItems( forPriceLevel, params )
      .then(function( items ) {
        if( items.length ) {
          return items[0];
        }
        return null;
      });
  }

  /**
   * Retrieves language configuration for user interface.
   * Default value is French.
   * Returns a promise object.
   *
   * @return {$q}
   */
  function getLanguage( ) {
    return localStorage.language;
  }

  function setLanguage( lang ) {
    return localStorage.language = lang;
  }

  /**
   * Returns a salesperson that has the username and password.
   * The returned promise' resolve function will receive the
   * salesperson object or null if none found
   * (i.e. bad username / password).
   * 
   * @param  {string} username
   * @param  {string} encodedPassword
   * @return {$q}
   */
  function getSalesPerson( username, encodedPassword ) {
    var params = initSQLParams();
    params.where.aliases = {
      operator: 'LIKE',
      value: '%--' + username + '--%',
    };
    params.where.password = encodedPassword;

    return getObjects( 'salespersons', params )
      .then(function( salespersons ) {
        if( salespersons.length ) {
          var salesPerson = salespersons[0];
          salesPerson.id = salesPerson.salesPersonId;
          return salesPerson;
        }
        return null;
      });
  }

  /**
   * Sets the language to be used for the user interface.
   * Default is French.
   * 
   * @param  {string} language
   * @return {$q}
   */
  function getSalesPerson( username, encodedPassword ) {
    var params = initSQLParams();
    params.where.aliases = {
      operator: 'LIKE',
      value: '%--' + username + '--%',
    };
    params.where.password = encodedPassword;

    return getObjects( 'salespersons', params )
      .then(function( salespersons ) {
        if( salespersons.length ) {
          var salesPerson = salespersons[0];
          salesPerson.id = salesPerson.salesPersonId;
          return salesPerson;
        }
        return null;
      });
  }

	/**
	 * Function used by getCustomer/s() and getItem/s() to retrieve
	 * their respective objects from the database. Returns an array
	 * of all the objects. Each object is the value of the data column
	 * (i.e. what was returned by the Store API).
	 *
	 * Valid attributes for params object:
	 * nb: (int) number of records to return (LIMIT)
	 * offset: (int) used with nb (OFFSET)
	 * where: (object) WHERE clauses (see buildSQLWhere())
	 * join: (string) complete JOIN clause to add to the query (ex: INNER JOIN ...)
	 * additionalSelect: (string) columns to add to the SELECT
	 * groupBy: (string) complete GROUP BY clause
	 * 
	 * @param  {string} tableName Table name of the object
	 * @param  {object} params  Optionnal parameter object for query
	 * @param  {boolean} onlyData  Optionnal (true) if true, only the data column will be decoded and its content returned
	 * @param  {array} jsonColumns Optionnal : columns in this array will be parsed as JSON
	 * @return {$q}
	 */
	function getObjects( tableName, params, onlyData, jsonColumns ) {
		var db = service.db(),
			objects = [],
			resolve, reject, sql, sqlResult,
			sqlParts = {
				select: '',
				where: [], // Will be set to keys in params.where
				limit: '',
			},
			promise = $q(function( resCb, rejCb ) {
				resolve = resCb;
				reject = rejCb;
			});

		onlyData = ( onlyData === undefined ? true : onlyData );

		if( ! jsonColumns ) {
			jsonColumns = [];
		}

		params = initSQLParams( params );

		sqlParts.select = 'SELECT ' + mainTableAlias + '.data as object_data';

		if( params.additionalSelect.length ) {
			sqlParts.select += ', ' + params.additionalSelect;
		}

		sqlParts.select += ' FROM ' + tableName + ' AS ' + mainTableAlias;

		if( params.nb > 0 ) {
			sqlParts.limit = ' LIMIT ' + params.nb;

			if( params.offset ) {
				sqlParts.limit += ' OFFSET ' + params.offset;
			}
		}

		sql = sqlParts.select
			+ ' ' + params.join + ' '
			+ buildSQLWhere( params.where )
			+ ' ' + params.groupBy + ' '
			+ sqlParts.limit
			+ ';';

		db.readTransaction( function( tx ) {
			tx.executeSql( sql, getSQLWhereValues( params.where ), treatSqlResult );
		}, function( error ) {
			reject('SQLite error in localStorage.getObjects: ' + error.message );
		}, function() {
			resolve( objects, sqlResult );
		});

		return promise;

		// ---------

		function treatSqlResult( tx, result ) {
			for( var i = 0; i < result.rows.length; i++ ) {
				var row = result.rows.item(i),
					mainData = {};

				if( onlyData ) {
					mainData = angular.fromJson( row.object_data );
				} else {
					mainData.data = angular.fromJson( row.object_data );
					addOtherColumnsToData( mainData, row );
				}

				objects.push( mainData );
			}
		}

		function addOtherColumnsToData( mainData, row ) {
			// Add all columns to mainData and decode the ones in jsonColumn
			angular.forEach( row, function( value, column ) {
				if( column !== 'object_data' ) {
					if( jsonColumns.indexOf( column ) !== -1 ) {
						mainData[ column ] = angular.fromJson( row[ column ] );
					} else {
						mainData[ column ] = row[ column ];
					}
				}
			});
		}
	}

	/**
	 * Reloads the customer list from the store api (replaces all customers
	 * in local storage).
	 *
	 * @return {$q}
	 */
	function fetchCustomers() {
		var fieldsToFill = [
			'customerId',
			'salesPersonId',
			[ 'searchTerms', generateSearchTerms ],
		];

		return storeApi.getCustomers()
			.then( treatFetchedObjects('customers', fieldsToFill ) );

		// -----

		/**
		 * Generates the string to save in the 'searchTerms' column
		 * 
		 * @param  {object} customerData Received from the API
		 * @return {string} The terms to save, comma separated
		 */
		function generateSearchTerms( customerData ) {
			return [
				customerData.customerId,
				customerData.name,
			].join(',').toLowerCase();
		}
	}

	/**
	 * Reloads the item list from the store api (replaces all items
	 * in local storage).
	 *
	 * @return {$q}
	 */
	function fetchItems() {
		var fieldsToFill = [
			'itemNumber',
			[ 'searchTerms', generateSearchTerms ],
		];

		return storeApi.getItems()
			.then( treatFetchedObjects('items', fieldsToFill ) );

		// -----

		/**
		 * Generates the string to save in the 'searchTerms' column
		 * 
		 * @param  {object} itemData Received from the API
		 * @return {string} The terms to save, comma separated
		 */
		function generateSearchTerms( itemData ) {
			return [
				itemData.itemNumber,
				itemData.localization.en.description,
				itemData.localization.fr.description,
			].join(',').toLowerCase();
		}
	}

	/**
	 * Reloads the price lists for a specific levelCode from the store
	 * api (replaces all price lists with same level code in local storage).
	 *
	 * @param {string} levelCode
	 * @return {$q}
	 */
	function fetchPriceLists( levelCode ) {
		return storeApi.getPriceLists( levelCode )
			.then( treatFetchedObjects('pricelists', ['itemNumber', 'priceLevelCode'], { priceLevelCode: levelCode } ) );
	}

	/**
	 * Function that calls fetchItems and fetchPriceLists (for the specified
	 * price level code) and returns a promise object that resolves once both
	 * are finished
	 *
	 * @param {string} levelCode
	 * @return {$q}
	 */
	function fetchItemsAndPriceLists( levelCode ) {
		return fetchItems()
			.then(function() {
				return fetchPriceLists( levelCode );
			});
	}

	/**
	 * Reloads the sales persons list from the store api
	 * (replaces all items in local storage).
	 *
	 * @return {$q}
	 */
	function fetchSalesPersons() {
		return storeApi.getSalesPersons()
			.then( treatFetchedObjects('salespersons', [
				'password',
				['aliases', generateAliases]
			] ) );

		// --------

		/**
		 * Generates the value of the salesPersonIdAliases column:
		 * all possible aliases separated by '--'
		 * 
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		function generateAliases( data ) {
			var separator = '--',
				aliases = [];

			aliases.push( data.salesPersonId );

			if( data.salesPersonIdAliases ) {
				aliases = aliases.concat( data.salesPersonIdAliases );
			}

			return separator + aliases.join( separator ) + separator;
		}
	}

	/**
	 * Function called by fetchCustomers() and fetchItems() success
	 * promise callback. Will return the function that will get
	 * the objects retrieved and which will update the database.
	 *
	 * Note that this function returns a function that will be used
	 * as a resolve function in a promise object. So the returned
	 * function will get the objects as its parameter. This function,
	 * since it is executing SQL, will itself return a promise object.
	 *
	 * @param {string} tableName SQLite table name where to save the fields
	 * @param {array} fieldsToFill Attributes in the received object to save in the
	 *                             same name column. If an element is an array, first
	 *                             element is column name, second is a function to
	 *                             generate the value
	 * @param {object} deleteWhere Object used to build a WHERE clause when deleting
	 * @return {function}
	 */
	function treatFetchedObjects( tableName, fieldsToFill, deleteWhere ) {
		return function( objects ) {
			var db = service.db(),
				sqlValuesPlaceholder = [],
				sqlFields = '',
				sql = '',
				deleteSql = '';

			if( ! fieldsToFill ) {
				fieldsToFill = [];
			}

			deleteSql = 'DELETE FROM ' + tableName
			            + buildSQLWhere( deleteWhere )
			            + ';';

			/* Build the SQL query */
			sqlFields = makeSqlFields( fieldsToFill );
			// The following line will create a string of '?, ' with the same number as fieldsToFill
			sqlValuesPlaceholder = Array( fieldsToFill.length + 1 ).join('?, ') + '?'; // Keep the last '?' for data
			sql = 'INSERT INTO ' + tableName + ' (' + sqlFields + ') VALUES (' + sqlValuesPlaceholder + ');';

			return $q(function( resolve, reject ) {
				db.transaction( function( tx ) {
					tx.executeSql( deleteSql, getSQLWhereValues( deleteWhere ) );

					for( var i = 0; i < objects.length; i++ ) {
						var sqlValues = makeSqlValues( fieldsToFill, objects[ i ] );
						sqlValues.push( angular.toJson( objects[ i ] ) );
						tx.executeSql( sql, sqlValues );
					}

				}, function( e ) {
					reject('SQLite error for localStorage.treatFetchedObjects: ' + e.message );
				}, function() {
					resolve();
				});
			});

			// --------------

			function makeSqlFields( fields ) {
				return fields.reduce(function( prev, curr ) {
					var fieldName = Array.isArray( curr ) ? curr[0] : curr;
					return prev + fieldName + ', ';
				}, '') + 'data';
			}

			function makeSqlValues( fields, obj ) {
				return fields.map(function( field ) {
					// If field is a string, we use it to get the
					// same attribute in the object. If it is an
					// array, first element is the column name, the
					// second is a function to generate the value.
					if( Array.isArray( field ) ) {
						return field[1]( obj );
					} else {
						return obj[ field ];
					}
				});
			}
		};
	}

	/**
	 * Returns a promise object whose resolve function
	 * receives an array of Order that correspond to the
	 * parameters.
	 *
	 * Valid states:
	 * - in-progress
	 * - not-synced
	 * - synced
	 *
	 * @param {string} state Optionnal: orders must have the state
	 * @param {object} salesPerson The owner of the order
	 * @param {object} customer Optionnal: orders of the specified customer
	 * @param {object} params Optionnal: SQL parameters
	 * @param {string} search Optionnal: search term
	 * @return {$q}
	 */
	function getOrders( state, salesPerson, customer, params, search ) {

    // return storeApi.getOrders()
    //   .then( function(orders) {
    //     console.log('got orders from API? ', orders);
    //   });


		params = initSQLParams( params );

		params.additionalSelect = mainTableAlias + '.id, c.data as customerData';
		params.join = 'INNER JOIN customers as c USING (customerId)';
		params.where[mainTableAlias + '.salesPersonId'] = salesPerson.id;

		if( state !== undefined && state !== null ) {
			params.where.state = state;
		}

		if( customer !== undefined && customer !== null ) {
			params.where.customerId = customer.customerId;
		}

		search = ( search ? search.toString().trim().toLowerCase() : '' );

		if( search ) {
			params.where[ mainTableAlias + '.searchTerms'] = {
				operator: 'LIKE',
				value: '%' + search + '%',
			};
		}

		return getObjects('orders', params, false, ['customerData'] )
			.then(function( ordersData ) {
				return createOrderInstances( ordersData );
			});

		// ------

		function createOrderInstances( ordersData ) {
			return ordersData.map(function( orderData ) {
				return createOrderInstance( orderData.data, salesPerson, orderData.id, orderData.customerData );
			});
		}
	}

	/**
	 * Returns a promise object whose resolve function
	 * receives the order with the supplied orderId.
	 * (Note that we use the id in the DB, not the orderNumber
	 * since the orderNumber can change anytime or even be empty).
	 * The items of the order are also loaded from the database.
	 *
	 * @param {string} orderId
	 * @param {object} salesPerson
	 * @param {object} params Optionnal: SQL parameters
	 * @return {$q}
	 */
	function getOrder( orderId, salesPerson, params ) {
		params = initSQLParams( params );
		params.where[mainTableAlias + '.id'] = orderId;

		return getOrders( null, salesPerson, null, params )
			.then(function( orders ) {
				var order = orders[0];

				if( ! order.frozen ) {
					return loadOrderItems( order );
				}

				return order;
			});
	}

	/**
	 * For the specified Order, loads its items and adds them
	 * to its items property. Returns a promise object whose
	 * resolve function receives the augmented Order instance
	 *
	 * @param {Order} order
	 * @return {$q}
	 */
	function loadOrderItems( order ) {

		var params = initSQLParams(),
			itemsNumber = [],
			itemsToQuantity = {};

		params.where.orderId = order.localStorageId;
		params.additionalSelect = 'orders_items.quantity as quantity';
		params.join = 'INNER JOIN orders_items USING (itemNumber)';

		return getObjects('items', params, false )
			.then(function( itemsData ) {
				itemsData.forEach(function( itemData ) {
					itemsNumber.push( itemData.data.itemNumber );
					itemsToQuantity[ itemData.data.itemNumber ] = itemData.quantity;
				});
				return addItemsToOrder( itemsData );
			});

		// ------------

		function addItemsToOrder( itemsData ) {
			var params = initSQLParams();
			params.where.itemNumber = {
				operator: 'IN',
				value: itemsNumber,
			};
			order.items = [];

			return getItems( order.customer.priceLevelCode, params )
				.then(function( items ) {
					items.forEach(function( item ) {
						order.items.push({
							quantity: itemsToQuantity[ item.itemNumber ],
							item: item,
						});
					});
					return order;
				});
		}
	}

	/**
	 * Save an order in the local database
	 *
	 * @param {Order} order
	 */
	function saveOrder( order ) {
		var db = service.db(),
			cleanOrder = createOrderObjectToSave( order ),
			isNew = ( order.localStorageId === null ),
			sqlParams = [
				order.orderNumber,
				cleanOrder.customerId,
				order.salesPersonId,
				order.state,
				generateSearchTerms( order ),
				angular.toJson( cleanOrder )
			],
			sql;

		if( isNew ) {
			sql = 'INSERT INTO orders ( orderNumber, customerId, salesPersonId, state, searchTerms, data ) VALUES (?, ?, ?, ?, ?, ?);';
		} else {
			sql = 'UPDATE orders SET orderNumber = ?, customerId = ?, salesPersonId = ?, state = ?, searchTerms = ?, data = ? WHERE id = ' + order.localStorageId + ';';
		}

		return $q(function( resolve, reject ) {
			db.transaction( function( tx ) {
				tx.executeSql( sql, sqlParams, function( tx, results ) {
					if( isNew ) {
						order.localStorageId = results.insertId;
					}
				});

			}, function( e ) {
				reject('SQLite error for localStorage.saveOrder: ' + e.message );
			}, function() {
				resolve( order );
			});
		});

		/**
		 * Generates the string to save in the 'searchTerms' column
		 * 
		 * @param  {object} itemData Received from the API
		 * @return {string} The terms to save, comma separated
		 */
		function generateSearchTerms( orderData ) {
			return [
				orderData.orderNumber,
				orderData.customer.name,
				orderData.customer.customerId,
			].join(',').toLowerCase();
		}
	}

	/**
	 * Deletes an order and all its items in the database. Returns
	 * a promise object.
	 *
	 * @param {Order} order
	 * @return {$q}
	 */
	function deleteOrder( order ) {
		return new $q( executor );

		// -------------

		function executor( resolve, reject ) {
			var db = service.db(),
			    sql,
			    sqlParams = [ order.localStorageId ];

			db.transaction( function( tx ) {
				sql = 'DELETE FROM orders_items WHERE orderId = ?;';
				tx.executeSql( sql, sqlParams );

				sql = 'DELETE FROM orders WHERE id = ?;';
				tx.executeSql( sql, sqlParams );
			}, function( e ) {
				reject('SQLite error for localStorage.deleteOrder: ' + e.message );
			}, function() {
				resolve();
			});
		}
	}

	/**
	 * Adds an item (with a quantity) to an order. If the relation
	 * between the item and the order does not exist yet, an INSERT
	 * is done. Else, an UPDATE is done where the quantity is added
	 * to the one already present.
	 *
	 * The passed Order instance is also updated.
	 *
	 * @param {object} item
	 * @param {Order} order
	 * @param {float} quantity
	 */
	function addItemToOrder( item, order, quantity ) {
		var db = service.db(),
			resolve, reject,
			newQuantity,
			q = new $q(function( resFn, rejFn ) {
				resolve = resFn;
				reject = rejFn;
			});

		quantity = parseFloat( quantity );

		updateDb();

		return q;

		// ------

		// First queries the DB to see if this order already has the item. If
		// so, will add the quantity to the old one. Else, will add the item
		// to the order and set its quantity
		function updateDb() {
			var sql = 'SELECT quantity FROM orders_items WHERE orderId = ? AND itemNumber = ? LIMIT 1;',
				sqlParams = [ order.localStorageId, item.itemNumber ];

			db.transaction( function( tx ) {
				tx.executeSql( sql, sqlParams, function( tx, results ) {
					var previousQuantity = 0;
					if( results.rows.length === 0 ) {
						sql = 'INSERT INTO orders_items ( quantity, orderId, itemNumber ) VALUES (?, ?, ?);';
					} else {
						previousQuantity = parseFloat( results.rows.item(0).quantity );
						sql = 'UPDATE orders_items SET quantity = ? WHERE orderId = ? AND itemNumber = ?;';
					}
					newQuantity = previousQuantity + quantity;
					sqlParams = [ newQuantity, order.localStorageId, item.itemNumber ];
					tx.executeSql( sql, sqlParams );
				});

			}, function( e ) {
				reject('SQLite error for localStorage.addItemToOrder: ' + e.message );
			}, function() {
				updateOrderInstanceItemQuantity( order, item, newQuantity );
				resolve();
			});
		}
	}

	/**
	 * Updates the quantity of an item in an order. If the quantity is
	 * 0, this item is removed from the order. Also updates the order
	 * instance.
	 *
	 * @param {Order} order
	 * @param {object} item
	 * @param {string|number} quantity
	 */
	function updateOrderItemQuantity( order, item, quantity ) {
		var db = service.db(),
			resolve, reject,
			q = new $q(function( resFn, rejFn ) {
				resolve = resFn;
				reject = rejFn;
			});

		updateDb();

		return q;

		// ------

		function updateDb() {
			var sql = 'UPDATE orders_items SET quantity = ? WHERE orderId = ? AND itemNumber = ?;',
				sqlParams = [ quantity, order.localStorageId, item.itemNumber ];

			if( parseInt( quantity ) === 0 ) {
				sql = 'DELETE FROM orders_items WHERE orderId = ? AND itemNumber = ?';
				sqlParams = [ order.localStorageId, item.itemNumber ];
			}

			db.transaction( function( tx ) {
				tx.executeSql( sql, sqlParams, function( tx, results ) {
					tx.executeSql( sql, sqlParams );
				});

			}, function( e ) {
				reject('SQLite error for localStorage.updateOrderItemQuantity: ' + e.message );
			}, function() {
				updateOrderInstanceItemQuantity( order, item, quantity );
				resolve();
			});
		}
	}

	/**
	 * Updates an instance of Order to set the quantity of the item.
	 * If quantity is 0, removes the item from the order.
	 * 
	 * @param  {Order} order
	 * @param  {object} item
	 * @param  {float} quantity
	 */
	function updateOrderInstanceItemQuantity( order, item, quantity ) {
		// Look for the item
		if( ! order.items ) {
			order.items = [];
		}

		quantity = parseFloat( quantity );

		for( var i = 0; i < order.items.length; i++ ) {
			var currentItem = order.items[i];

			if( currentItem.item.itemNumber === item.itemNumber ) {
				if( quantity === 0 ) {
					order.items.splice( i, 1 );
					return;
				}
				currentItem.quantity = quantity;
				return;
			}
		}

		// Item not found, we add it
		if( quantity > 0 ) {
			order.items.push({
				item: item,
				quantity: quantity,
			});
		}
	}

	/**
	 * From an Order instance, returns an object representing the order
	 * that can be serialized in the database. Note that if the Order
	 * is frozen, nothing will be changed
	 * 
	 * @param  {Order} order
	 * @return {object}
	 */
	function createOrderObjectToSave( order ) {
		if( order.frozen ) {
			return order;
		}

		var cleanedOrder = angular.copy( order );

		cleanedOrder.customerId = ( order.customer ? order.customer.customerId : null );

		delete cleanedOrder._customer;
		delete cleanedOrder.localStorageId;
		delete cleanedOrder.items;

		return cleanedOrder;
	}

	/**
	 * From the values of the columns of an order entry, creates and
	 * returns an Order instance. Note that if the order is frozen,
	 * only its main data will be used.
	 * 
	 * @param  {object} data
	 * @param  {object} salesPerson The owner of the order
	 * @param  {string} localStorageId
	 * @param  {object} customerData
	 * @return {Order}
	 */
	function createOrderInstance( data, salesPerson, localStorageId, customerData ) {
		var order = new Order( salesPerson );

		angular.extend( order, data );

		if( ! order.frozen ) {
			order.localStorageId = localStorageId;
			order.customer = customerData;
			order.date = data._date;
			order.requestedShipDate = data._requestedShipDate;
		}

		return order;
	}

	/**
	 * Pushes an order to the store api. Once pushed, the order in
	 * local storage is updated to reflect its new status.
	 * 
	 * @param  {Order} order
	 * @return {$q}
	 */
	function pushOrder( order ) {
		return storeApi.postOrder( order )
			.then(function( apiResponse ) {
				order.state = 'pushed';
				return freezeOrder( order );
			});
	}

	/**
	 * Freezes an order: all information about the order will be
	 * kept inside the order and will not change, this includes
	 * the customer information and the items (so even if the original
	 * customer changes or if one of the item changes, this order
	 * will not be touched).
	 *
	 * Also updates the DB and removes all entries in orders_items
	 *
	 * @param {Order} order
	 */
	function freezeOrder( order ) {
		order.frozen = true;

		return saveOrder( order )
			.then(function( order ) {
				return deleteFromOrdersItems( order );
			});

		// ----------

		function deleteFromOrdersItems( order ) {
			var db = service.db(),
			    resolve, reject,
			    sql, sqlParams,
			    promise = new $q(function( resFn, rejFn ) {
			    	resolve = resFn;
			    	reject = rejFn;
			    });

			sql = 'DELETE FROM orders_items WHERE orderId = ?;';
			sqlParams = [order.localStorageId];

			db.transaction( function( tx ) {
				tx.executeSql( sql, sqlParams );
			}, function( e ) {
				reject('SQLite error for localStorage.freezeOrder: ' + e.message );
			}, function() {
				resolve( order );
			});

			return promise;
		}
	}

	/**
	 * From a whereObj (see below), returns a simple 'WHERE' clause
	 * with placeholders '?'. The parts are joined by AND and
	 * each part is an equality '='
	 *
	 * A whereObj is an object where each key is a column name and
	 * the corresponding value is used as the 'equals value'.
	 *
	 * Ex:
	 * {
	 *    'customerId' : '123',
	 *    'state': 'in-progress'
	 * }
	 * 
	 * @param  {object} whereObj
	 * @return {string}
	 */
	function buildSQLWhere( whereObj ) {
		var whereFields = [];

		if( ! whereObj ) {
			return '';
		}

		angular.forEach( whereObj, function( fieldValue, fieldName ) {
			if( typeof fieldValue === 'object' ) {
				var sql = fieldName + ' ' + fieldValue.operator;

				if( Array.isArray( fieldValue.value ) ) {
					sql += ' (';
					for( var i = 0; i < fieldValue.value.length; i++ ) {
						if( i > 0 ) {
							sql += ', ';
						}
						sql += '?';
					}
					sql += ')';
				} else {
					sql += ' ?';
				}

				whereFields.push( sql );
			} else {
				whereFields.push( fieldName + ' = ?' );
			}
		});

		return ( whereFields.length ? ' WHERE ' + whereFields.join(' AND ') : '' );
	}

	/**
	 * From a whereObj (see buildSQLWhere()), returns an array of
	 * the values of the whereObj
	 * 
	 * @param  {object} whereObj
	 * @return {array}
	 */
	function getSQLWhereValues( whereObj ) {
		var whereValues = [];

		if( ! whereObj ) {
			return [];
		}

		angular.forEach( whereObj, function( fieldValue, fieldName ) {
			if( typeof fieldValue === 'object') {
				fieldValue = fieldValue.value;
			}

			if( Array.isArray( fieldValue ) ) {
				whereValues = whereValues.concat( fieldValue );
			} else {
				whereValues.push( fieldValue );
			}

		});

		return whereValues;
	}

	/**
	 * Returns an object that can be passed as params to getObjects().
	 * If an object is passed, its values will be used in the
	 * returned object.
	 * 
	 * @param  {object} params Optionnal
	 * @return {object}
	 */
	function initSQLParams( params ) {
		if( params === undefined ) {
			params = {};
		}

		return angular.extend({
			nb: 0,
			offset: 0,
			where: {},
			join: '',
			additionalSelect: '',
			groupBy: '',
		}, params );
	}

}

})();