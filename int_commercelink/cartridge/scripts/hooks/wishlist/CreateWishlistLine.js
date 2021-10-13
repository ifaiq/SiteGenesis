'use strict';

/**
 * @module CreateWishlist.js
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
 * @function CreateWishlistLine
 *
 *
 * @param {object} wishlistline The WishlistLine to be created
 */
exports.CreateWishlistLine = function (wishlistline) {
	var returnStatus;
	if(CommerceLinkFactory.Preferences['enableRealTimeWishlistLineCreation']) {
		try {
			/***********************************************
			*		Build Request & Call Service		   *
			***********************************************/
			// Creating Request Pay load
			var requestDataContainer  = WishlistFactory.buildCreateWishlistLineRequestObject({
				wishlistline: wishlistline
			});
			
			// get the service
			var service = ServiceFactory.getPreferedService({
				feature:	CommerceLinkFactory.FEATURES.WISHLIST,
				property:	"CREATE_LINE",
				identifier:	CommerceLinkFactory.SERVICES.WISHLIST
			});
			
			// make the call
			var result = service.call(requestDataContainer);
			var responseObj;
			
			// Error Case
			if (result.error != 0 || result.errorMessage != null || result.mockResult) {
				//setting response object in status
				responseObj = JSON.parse(result.object);
				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS_ERROR);
				if(result && 'object' in result) {
					returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
				}
				Transaction.wrap(function () {
					//Setting Order Attribute in Case of Error when status code is not 200
					if (!empty(wishlistline) && !empty(wishlistline.custom)) {
	    				'isWishlistLineCreatedInAX' in wishlistline.custom ? wishlistline.custom.isWishlistLineCreatedInAX = false : Logger.error('custom attribute: isWishlistLineCreatedInAX, not found in wishlistline');
	    				'wishlistlineLineTransactionId' in wishlistline.custom ? wishlistline.custom.wishlistLineTransactionId = null : Logger.error('custom attribute: wishlistLineTransactionId, not found in wishlistline');
	    				'wishlistlineLineCreationStatus' in wishlistline.custom ? wishlistline.custom.wishlistLineCreationStatus = CommerceLinkFactory.STATUS_CODES.WISHLIST.CREATE_LINE.ERROR_STATUS : Logger.error('custom attribute: wishlistLineCreationStatus, not found in wishlistline');
	    				'wishlistlineLineCreationMsg' in wishlistline.custom ? wishlistline.custom.wishlistLineCreationMsg = CommerceLinkFactory.STATUS_CODES.WISHLIST.CREATE_LINE.ERROR_MESSAGE : Logger.error('custom attribute: wishlistLineCreationMsg, not found in wishlistline');
    				}
    			});
			} else { // Success Case
				//setting response object in status
				responseObj = JSON.parse(result.object);
    			
    			Transaction.wrap(function () {
    				if(responseObj.status == "true") {
    					//Setting Order Attribute in Case of Error when status code is 200
    					if (!empty(wishlistline) && !empty(wishlistline.custom)) {
		    				'isWishlistLineCreatedInAX' in wishlistline.custom ? wishlistline.custom.isWishlistLineCreatedInAX = true : Logger.error('custom attribute: isWishlistLineCreatedInAX, not found in wishlistline');
		    				'wishlistLineTransactionId' in wishlistline.custom ? wishlistline.custom.wishlistLineTransactionId = responseObj.wishlistLineTransactionId : Logger.error('custom attribute: wishlistLineTransactionId, not found in wishlistline');
		    				'wishlistLineCreationStatus' in wishlistline.custom ? wishlistline.custom.wishlistLineCreationStatus = CommerceLinkFactory.STATUS_CODES.WISHLIST.CREATE_LINE.ERROR_STATUS : Logger.error('custom attribute: wishlistLineCreationStatus, not found in wishlistline');
		    				'wishlistLineCreationMsg' in wishlistline.custom ? wishlistline.custom.wishlistLineCreationMsg = CommerceLinkFactory.STATUS_CODES.WISHLIST.CREATE_LINE.ERROR_MESSAGE : Logger.error('custom attribute: wishlistLineCreationMsg, not found in wishlistline');
        				}
        				//setting hook response
        				returnStatus = new Status(Status.OK, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS);
        				if(result && 'object' in result) {
        					returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
        				}
    				}
    				else {
    					if (!empty(wishlistline.custom)) {
		    				'isWishlistLineCreatedInAX' in wishlistline.custom ? wishlistline.custom.isWishlistLineCreatedInAX = false : Logger.error('custom attribute: isWishlistLineCreatedInAX, not found in wishlistline');
		    				'wishlistLineTransactionId' in wishlistline.custom ? wishlistline.custom.wishlistLineTransactionId = responseObj.wishlistLineTransactionId : Logger.error('custom attribute: wishlistLineTransactionId, not found in wishlistline');
		    				'wishlistLineCreationStatus' in wishlistline.custom ? wishlistline.custom.wishlistLineCreationStatus = "" + responseObj.Error : Logger.error('custom attribute: wishlistLineCreationStatus, not found in wishlistline');
		    				'wishlistLineCreationMsg' in wishlistline.custom ? wishlistline.custom.wishlistLineCreationMsg = responseObj.message : Logger.error('custom attribute: wishlistLineCreationMsg, not found in wishlistline');
        				}
        				//setting hook response
        				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.ORDER.CREATE.RESPONSE_ERROR);
        				if(result && 'object' in result) {
        					returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
        				}
        			}
    			});
			}
		} catch(e) {
        	var errorMessage = e;
        	
        	//setting exception object in status
        	returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GENERAL.EXCEPTION_ERROR);
        	if (result && 'object' in result) {
        		returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.EXCEPTION_OBJECT, result.object);
        	}
        }
    } else {
		returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GENERAL.SERVICE_NOT_ENABLED);
	}
	// ===================================================
    // =====            DONE                         =====
    // ===================================================
	
	return returnStatus;
};