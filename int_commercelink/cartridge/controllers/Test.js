'use strict';

/**
 * Controller that renders the home page.
 *
 * @module controllers/Test
 */

var HookMgr = require('dw/system/HookMgr');
var Status = require('dw/system/Status');

var app = require('app_storefront_controllers/cartridge/scripts/app');
var guard = require('app_storefront_controllers/cartridge/scripts/guard');

var CommerceLinkFactory = require('~/cartridge/scripts/utils/CommerceLinkFactory');

/**
 * Renders the JSON response of Chanel Publish Service
 */
function chanelPublish() {
	var chanelTest = dw.system.HookMgr.callHook(CommerceLinkFactory.HOOKS.CHANNEL.PUBLISH.ID, CommerceLinkFactory.HOOKS.CHANNEL.PUBLISH.SCRIPT, {});
	var responseDetails = chanelTest.getDetail("RESPONSE");
	response.setContentType("application/json");
    response.getWriter().print(responseDetails);
    return;
}


/**
 * Renders the JSON response of Create Sales Order Transaction Service
 */
function createSalesOrderTransaction() {
	var orderId = request.httpParameterMap.oid.stringValue;
	
	if(!empty(orderId)) {
		var order = dw.order.OrderMgr.getOrder(orderId);
		if(!empty(order)) {
			var clOrderCreationTest = dw.system.HookMgr.callHook('commercelink.api.order.create', 'CreateOrder', order);
			var responseDetails = clOrderCreationTest.getDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT);
			response.setContentType("application/json");
		    response.getWriter().print(responseDetails);
		}
		else {
			response.setContentType("text/html; charset=UTF-8");
		    response.getWriter().print("<div><style>div {position:fixed;top:50%;left:50%;}</style><h1>No Order Matched with Provided Order Id</h1></div>");
		}
	}
	else {
		response.setContentType("text/html; charset=UTF-8");
	    response.getWriter().print("<div><style>div {position:fixed;top:50%;left:50%;}</style><h1>Order Id Not Provided</h1></div>");
	}
    return;
}

/**
 * Renders the JSON response of Create Customer Service
 */
function createCustomer() {
	var customerId = request.httpParameterMap.id.stringValue;
	
	if(!empty(customerId)) {
		var customerObj = dw.customer.CustomerMgr.getCustomerByLogin(customerId);
		customerObj = (!empty(customerObj) ? customerObj : dw.customer.CustomerMgr.getCustomerByCustomerNumber(customerId));
		if(!empty(customerObj)) {
			var clCustomerCreationStatus = dw.system.HookMgr.callHook(CommerceLinkFactory.HOOKS.CUSTOMER.CREATE.ID, CommerceLinkFactory.HOOKS.CUSTOMER.CREATE.SCRIPT, {customerObj: customerObj});
			var responseDetails = clCustomerCreationStatus.getDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT);
			response.setContentType("application/json");
		    response.getWriter().print('responseDetails: '+responseDetails);
		}
		else {
			response.setContentType("text/html; charset=UTF-8");
		    response.getWriter().print("<div><style>div {position:fixed;top:50%;left:50%;}</style><h1>No Customer Matched with Provided Id</h1></div>");
		}
	}
	else {
		response.setContentType("text/html; charset=UTF-8");
	    response.getWriter().print("<div><style>div {position:fixed;top:50%;left:50%;}</style><h1>Customer Id Not Provided</h1></div>");
	}
    return;
}

function createCustomerJSON() {
	var jsonRequestBody = request.httpParameterMap.getRequestBodyAsString();
	
	try {
		var requestCustomerObj = JSON.parse(jsonRequestBody);
		var clCustomerCreationStatus = dw.system.HookMgr.callHook(CommerceLinkFactory.HOOKS.CUSTOMER.CREATE.ID, CommerceLinkFactory.HOOKS.CUSTOMER.CREATE.SCRIPT, requestCustomerObj);
		var responseDetails = clCustomerCreationStatus.getDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT);
		response.setContentType("application/json");
	    response.getWriter().print('responseDetails: '+responseDetails);
	} catch(e) {
		var msg = e;
		response.setContentType("text/html; charset=UTF-8");
	    response.getWriter().print("<div><style>div {position:fixed;top:50%;left:50%;}</style><h1>Error Message: '${msg}'</h1></div>");
	}
    return;
}

/**
 * Renders the JSON response of Update Customer Service
 */
function updateCustomer() {
	var jsonRequestBody = request.httpParameterMap.getRequestBodyAsString();
	
	try {
		var requestUpdateCustomerObj = JSON.parse(jsonRequestBody);
		var clUpdateCustomerStatus = dw.system.HookMgr.callHook(CommerceLinkFactory.HOOKS.CUSTOMER.UPDATE.ID, CommerceLinkFactory.HOOKS.CUSTOMER.UPDATE.SCRIPT, requestUpdateCustomerObj);
		var responseDetails = clUpdateCustomerStatus.getDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT);
		response.setContentType("application/json");
	    response.getWriter().print('responseDetails: '+responseDetails);
	} catch(e) {
		var msg = e;
		response.setContentType("text/html; charset=UTF-8");
	    response.getWriter().print(msg);
	}
    return;
}

/**
 * Renders the JSON response of Get Customer Service
 */
function getCustomer() {
	var customerId = request.httpParameterMap.id.stringValue;
	
	if(!empty(customerId)) {
		var clGetCustomerStatus = dw.system.HookMgr.callHook(CommerceLinkFactory.HOOKS.CUSTOMER.GET.ID, CommerceLinkFactory.HOOKS.CUSTOMER.GET.SCRIPT, {customerId: customerId});
		var responseDetails = clGetCustomerStatus.getDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT);
		response.setContentType("application/json");
	    response.getWriter().print(responseDetails);
	}
	else {
		response.setContentType("text/html; charset=UTF-8");
	    response.getWriter().print("<div><style>div {position:fixed;top:50%;left:50%;}</style><h1>Customer Id Not Provided</h1></div>");
	}
    return;
}

function getCustomerJSON() {
var jsonRequestBody = request.httpParameterMap.getRequestBodyAsString();
	
	try {
		var requestCustomerObj = JSON.parse(jsonRequestBody);
		var clGetCustomerStatus = dw.system.HookMgr.callHook(CommerceLinkFactory.HOOKS.CUSTOMER.GET.ID, CommerceLinkFactory.HOOKS.CUSTOMER.GET.SCRIPT, requestCustomerObj);
		var responseDetails = clGetCustomerStatus.getDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT);
		response.setContentType("application/json");
	    response.getWriter().print('responseDetails: '+responseDetails);
	} catch(e) {
		var msg = e;
		response.setContentType("text/html; charset=UTF-8");
	    response.getWriter().print("<div><style>div {position:fixed;top:50%;left:50%;}</style><h1>Error Message: '${msg}'</h1></div>");
	}
    return;
}

/**
 * Renders the JSON response of Create Wishlist Service
 */
function createWishlist() {
	var jsonRequestBody = request.httpParameterMap.getRequestBodyAsString();
	
	try {
		var requestObject = JSON.parse(jsonRequestBody);
		var clWishlistCreateStatus = dw.system.HookMgr.callHook(CommerceLinkFactory.HOOKS.WISHLIST.CREATE.ID, CommerceLinkFactory.HOOKS.WISHLIST.CREATE.SCRIPT, requestObject);
		
		var responseDetails = clWishlistCreateStatus.getDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT);
		response.setContentType("application/json");
	    response.getWriter().print('responseDetails: ' + responseDetails);
	} catch(e) {
		var msg = e;
		response.setContentType("text/html; charset=UTF-8");
	    response.getWriter().print("<div><style>div {position:fixed;top:50%;left:50%;}</style><h1>Wishlist Object was empty </h1></div>");
	}
	
    return;
}

/**
 * Renders the JSON response of Get Wishlist Service
 */
function getWishlist() {
	var wishlistId = request.httpParameterMap.id.stringValue;
	
	if(!empty(wishlistId)) {
		var clGetWishlistStatus = dw.system.HookMgr.callHook(CommerceLinkFactory.HOOKS.WISHLIST.GET.ID, CommerceLinkFactory.HOOKS.WISHLIST.GET.SCRIPT, {wishlistId: wishlistId});
		var responseDetails = clGetCustomerStatus.getDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT);
		response.setContentType("application/json");
	    response.getWriter().print(responseDetails);
	}
	else {
		response.setContentType("text/html; charset=UTF-8");
	    response.getWriter().print("<div><style>div {position:fixed;top:50%;left:50%;}</style><h1>Wishlist Id Not Provided</h1></div>");
	}
    return;
}

/**
 * Renders the JSON response of Issue GiftCard Service
 */
function issueGiftCard() {
	var jsonRequestBody = request.httpParameterMap.getRequestBodyAsString();
	
	try {
		var requestObject = JSON.parse(jsonRequestBody);
		var clGiftCardIssuanceStatus = dw.system.HookMgr.callHook(CommerceLinkFactory.HOOKS.GIFT_CARD.ISSUE.ID, CommerceLinkFactory.HOOKS.GIFT_CARD.ISSUE.SCRIPT, requestObject);
		
		var responseDetails = clGiftCardIssuanceStatus.getDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT);
		response.setContentType("application/json");
	    response.getWriter().print('responseDetails: ' + responseDetails);
	} catch(e) {
		var msg = e;
		response.setContentType("text/html; charset=UTF-8");
	    response.getWriter().print("<div><style>div {position:fixed;top:50%;left:50%;}</style><h1>Gift Card Object was empty </h1></div>");

	}

    return;
}

/**
 * Renders the JSON response of Unlock GiftCard Service
 */
function unlockGiftCard() {
	var giftCardId = request.httpParameterMap.gcid.stringValue;
	if (!empty(giftCardId)) {
		var clGiftCardUnlockStatus = dw.system.HookMgr.callHook(CommerceLinkFactory.HOOKS.GIFT_CARD.UNLOCK.ID, CommerceLinkFactory.HOOKS.GIFT_CARD.UNLOCK.SCRIPT, {giftCardId: giftCardId});
		var responseDetails = clGiftCardUnlockStatus.getDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT);
		response.setContentType("application/json");
	    response.getWriter().print('responseDetails: ' + responseDetails);
	} else {
		response.setContentType("text/html; charset=UTF-8");
	    response.getWriter().print("<div><style>div {position:fixed;top:50%;left:50%;}</style><h1>Gift Card ID was not provided</h1></div>");
	}
	
    return;
}

/**
 * Renders the JSON response of Lock GiftCard Service
 */
function lockGiftCard() {
	var giftCardId = request.httpParameterMap.gcid.stringValue;
	if (!empty(giftCardId)) {
		var clGiftCardLockStatus = dw.system.HookMgr.callHook(CommerceLinkFactory.HOOKS.GIFT_CARD.LOCK.ID, CommerceLinkFactory.HOOKS.GIFT_CARD.LOCK.SCRIPT, {giftCardId: giftCardId});
		var responseDetails = clGiftCardLockStatus.getDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT);
		response.setContentType("application/json");
	    response.getWriter().print('responseDetails: ' + responseDetails);
	} else {
		response.setContentType("text/html; charset=UTF-8");
	    response.getWriter().print("<div><style>div {position:fixed;top:50%;left:50%;}</style><h1>Gift Card ID was not provided</h1></div>");
	}
	
    return;
}

/**
 * Renders the JSON response of Get GiftCard Balance Service
 */
function getGiftCardBalance() {
	var giftCardId = request.httpParameterMap.gcid.stringValue;
	if (!empty(giftCardId)) {
		var clGetGiftCardBalanceStatus = dw.system.HookMgr.callHook(CommerceLinkFactory.HOOKS.GIFT_CARD.GET_BALANCE.ID, CommerceLinkFactory.HOOKS.GIFT_CARD.GET_BALANCE.SCRIPT, {giftCardId: giftCardId});
		var responseDetails = clGetGiftCardBalanceStatus.getDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT);
		response.setContentType("application/json");
	    response.getWriter().print('responseDetails: ' + responseDetails);
	} else {
		response.setContentType("text/html; charset=UTF-8");
	    response.getWriter().print("<div><style>div {position:fixed;top:50%;left:50%;}</style><h1>Gift Card ID was not provided</h1></div>");
	}
	
    return;
}

/**
 * Renders the JSON response of Pay GiftCard Service
 */
function payGiftCard() {
	var jsonRequestBody = request.httpParameterMap.getRequestBodyAsString();
	
	try {
		var requestObject = JSON.parse(jsonRequestBody);
		var clPayGiftCardStatus = dw.system.HookMgr.callHook(CommerceLinkFactory.HOOKS.GIFT_CARD.PAY.ID, CommerceLinkFactory.HOOKS.GIFT_CARD.PAY.SCRIPT, requestObject);
		var responseDetails = clPayGiftCardStatus.getDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT);
		response.setContentType("application/json");
	    response.getWriter().print('responseDetails: ' + responseDetails);
	} catch(e) {
		var msg = e;
		response.setContentType("text/html; charset=UTF-8");
	    response.getWriter().print("<div><style>div {position:fixed;top:50%;left:50%;}</style><h1>Gift Card Object was empty </h1></div>");

	}

    return;
}

/**
 * Renders the JSON response of Get Store Availability Service
 */
function getStoreAvailability() {
	var CommerceLinkFactory = require('~/cartridge/scripts/utils/CommerceLinkFactory');
	var itemId = request.httpParameterMap.iid.stringValue,
		variantId = request.httpParameterMap.vid.stringValue;
	if (!empty(itemId) && !empty(variantId)) {
		var clGetStoreAvailabilityStatus = dw.system.HookMgr.callHook(CommerceLinkFactory.HOOKS.STORE.AVAILABILITY.ID, CommerceLinkFactory.HOOKS.STORE.AVAILABILITY.SCRIPT, {itemId: itemId, variantId: variantId});
		var responseDetails = clGetStoreAvailabilityStatus.getDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT);
		response.setContentType("application/json");
	    response.getWriter().print('responseDetails: ' + responseDetails);
	} else {
		response.setContentType("text/html; charset=UTF-8");
	    response.getWriter().print("<div><style>div {position:fixed;top:50%;left:50%;}</style><h1>itemId and/or variantId was not provided</h1></div>");
	}
	
    return;
}


/*
 * Export the publicly available controller methods
 */
/** Renders the JSON response of Chanel Publish Service by Just Calling URL Test-ChanelPublish
 * @see module:controllers/Test-chanelPublish */
exports.ChanelPublish = guard.ensure(['get'], chanelPublish);

/** Renders the JSON response of Create Sales Order Transaction Service by Just Calling URL Test-CreateSalesOrder?oid=00012345
 * @see module:controllers/Test-createSalesOrderTransaction */
exports.CreateSalesOrder = guard.ensure(['get'], createSalesOrderTransaction);

/** Renders the JSON response of Create Customer by Just Calling URL Test-CreateCustomer?id=test@test.com or id=00012345
 * @see module:controllers/Test-createCustomer */
exports.CreateCustomer = guard.ensure(['get'], createCustomer);

/** Renders the JSON response of Create Customer by Just Calling URL Test-CreateCustomerJSON
 * @see module:controllers/Test-createCustomerJSON */
exports.CreateCustomerJSON = guard.ensure(['post'], createCustomerJSON);

/** Renders the JSON response of Create Customer by Just Calling URL Test-UpdateCustomer
 * @see module:controllers/Test-updateCustomer */
exports.UpdateCustomer = guard.ensure(['post'], updateCustomer);

/** Renders the JSON response of Create Customer by Just Calling URL Test-GetCustomer?id=test@test.com or id=00012345
 * @see module:controllers/Test-getCustomer */
exports.GetCustomer = guard.ensure(['get'], getCustomer);

/** Renders the JSON response of Create Customer by Just Calling URL Test-GetCustomerJSON
 * @see module:controllers/Test-getCustomerJSON */
exports.GetCustomerJSON = guard.ensure(['post'], getCustomerJSON);

/** Renders the JSON response of Issue GiftCard by Just Calling URL Test-IssueGiftCard
 * @see module:controllers/Test-issueGiftCard */
exports.IssueGiftCard = guard.ensure(['post'], issueGiftCard);

/** Renders the JSON response of Unlock GiftCard by Just Calling URL Test-UnlockGiftCard
 * @see module:controllers/Test-unlockGiftCard */
exports.UnlockGiftCard = guard.ensure(['get'], unlockGiftCard);

/** Renders the JSON response of Lock GiftCard by Just Calling URL Test-LockGiftCard
 * @see module:controllers/Test-lockGiftCard */
exports.LockGiftCard = guard.ensure(['get'], lockGiftCard);

/** Renders the JSON response of Get GiftCard Balance by Just Calling URL Test-GetGiftCardBalance
 * @see module:controllers/Test-getGiftCardBalance */
exports.GetGiftCardBalance = guard.ensure(['get'], getGiftCardBalance);

/** Renders the JSON response of Pay GiftCard Balance by Just Calling URL Test-PayGiftCard
 * @see module:controllers/Test-payGiftCard */
exports.PayGiftCard = guard.ensure(['post'], payGiftCard);

/** Renders the JSON response of Create Wishlist by Just Calling URL Test-CreateWishlist
 * @see module:controllers/Test-createWishlist */
exports.CreateWishlist = guard.ensure(['post'], createWishlist);

/** Renders the JSON response of Get Store Availability by Just Calling URL Test-GetStoreAvailability
 * @see module:controllers/Test-getStoreAvailability */
exports.GetStoreAvailability = guard.ensure(['get'], getStoreAvailability);