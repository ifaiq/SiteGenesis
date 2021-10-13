'use strict';

/**
 * @module UpdateWishlistLine.js
 *
 * This JavaScript file implements methods (via Common.js exports).  This allows OCAPI calls to reference
 * these tools via the OCAPI 'hook' mechanism
 *
 */
/* API Includes */
var Logger = require('dw/system/Logger');
var Status = require('dw/system/Status');
var Transaction = require('dw/system/Transaction');

/* Packages Includes */
var dwsvc = require('dw/svc'); 
var dwvalue = require('dw/value');

/* Local API Includes */
var CommerceLinkFactory = require('~/cartridge/scripts/utils/CommerceLinkFactory');
var WishlistFactory = require('~/cartridge/scripts/utils/wishlist/WishlistFactory');
var ServiceFactory = require('~/cartridge/scripts/utils/ServiceFactory');

/**
 * @function UpdateCustomer
 *
 *
 * @param {object} WishlistLine The WishlistLine to be updated in AX
 */
exports.UpdateWishlistLine = function (args) {
	var wishlistLineObj = args.wishlistLine;
	var returnStatus;
	if(CommerceLinkFactory.Preferences['enableRealTimeWishlistLineUpdate']) {
		try {
			/***********************************************
			*		Build Request & Call Service		   *
			***********************************************/
			// Creating Request Pay load
			var requestDataContainer  = WishlistFactory.buildUpdateWishlistLineRequestObject({
				wishlistLine: wishlistLineObj
			});
			
			/// get the service
			var service = ServiceFactory.getPreferedService({
				feature:	CommerceLinkFactory.FEATURES.WISHLIST,
				property:	"UPDATE_LINE",
				identifier:	CommerceLinkFactory.SERVICES.WISHLIST
			});
			
			// make the call
			var result = service.call(requestDataContainer);
			var responseObj;
			
			//error case
			if (result.error != 0 || result.errorMessage != null || result.mockResult) {
				//setting response object in status
				responseObj = JSON.parse(result.object);
				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS_ERROR);
				returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
			}
			//success case
			else {
				//setting response object in status
				responseObj = JSON.parse(result.object);
    			
    			Transaction.wrap(function () {
    				if(responseObj.status == "true") {
        				//setting hook response
        				returnStatus = new Status(Status.OK, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS);
        				returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
    				}
    				else {
        				//setting hook response
        				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.WISHLIST.UPDATE_LINE.RESPONSE_ERROR);
        				returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
    				}
    			});
			}
			
			//setting general service result in status
			returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.SERVICE_RESULT, result);
		} catch(e) {
        	var errorMessage = e;
        	returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GENERAL.EXCEPTION_ERROR);
        }
	}
	else {
		returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GENERAL.SERVICE_NOT_ENABLED);
	}
	// ===================================================
    // =====            DONE                         =====
    // ===================================================
	
	return returnStatus;
};