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
 * @function CreateWishlist
 *
 *
 * @param {object} wishlist The Wishlist to be created
 */
exports.CreateWishlist = function (wishlist) {
	var returnStatus;
	if(CommerceLinkFactory.Preferences['enableRealTimeWishlistCreation']) {
		try {
			/***********************************************
			*		Build Request & Call Service		   *
			***********************************************/
			// Creating Request Pay load
			var requestDataContainer  = WishlistFactory.buildCreateWishlistRequestObject({
				wishlist: wishlist
			});
			
			// get the service
			var service = ServiceFactory.getPreferedService({
				feature:	CommerceLinkFactory.FEATURES.WISHLIST,
				property:	"CREATE",
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
					if (!empty(wishlist.custom)) {
	    				'isWishlistCreatedInAX' in wishlist.custom ? wishlist.custom.isWishlistCreatedInAX = false : Logger.error('custom attribute: isWishlistCreatedInAX, not found in wishlist');
	    				'wishlistTransactionId' in wishlist.custom ? wishlist.custom.wishlistTransactionId = null : Logger.error('custom attribute: wishlistTransactionId, not found in wishlist');
	    				'wishlistCreationStatus' in wishlist.custom ? wishlist.custom.wishlistCreationStatus = CommerceLinkFactory.STATUS_CODES.WISHLIST.CREATE.ERROR_STATUS : Logger.error('custom attribute: wishlistCreationStatus, not found in wishlist');
	    				'wishlistCreationMsg' in wishlist.custom ? wishlist.custom.wishlistCreationMsg = CommerceLinkFactory.STATUS_CODES.WISHLIST.CREATE.ERROR_MESSAGE : Logger.error('custom attribute: wishlistCreationMsg, not found in wishlist');
    				}
    			});
			} else { // Success Case
				//setting response object in status
				responseObj = JSON.parse(result.object);
    			
    			Transaction.wrap(function () {
    				if(responseObj.status == "true") {
    					//Setting Order Attribute in Case of Error when status code is 200
						if (!empty(wishlist.custom)) {
		    				'isWishlistCreatedInAX' in wishlist.custom ? wishlist.custom.isWishlistCreatedInAX = true : Logger.error('custom attribute: isWishlistCreatedInAX, not found in wishlist');
		    				'wishlistTransactionId' in wishlist.custom ? wishlist.custom.wishlistTransactionId = responseObj.wishlistTransactionId : Logger.error('custom attribute: wishlistTransactionId, not found in wishlist');
		    				'wishlistCreationStatus' in wishlist.custom ? wishlist.custom.wishlistCreationStatus = CommerceLinkFactory.STATUS_CODES.WISHLIST.CREATE.ERROR_STATUS : Logger.error('custom attribute: wishlistCreationStatus, not found in wishlist');
		    				'wishlistCreationMsg' in wishlist.custom ? wishlist.custom.wishlistCreationMsg = CommerceLinkFactory.STATUS_CODES.WISHLIST.CREATE.ERROR_MESSAGE : Logger.error('custom attribute: wishlistCreationMsg, not found in wishlist');
        				}
        				//setting hook response
        				returnStatus = new Status(Status.OK, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS);
        				if(result && 'object' in result) {
        					returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
        				}
    				}
    				else {
						if (!empty(wishlist.custom)) {
		    				'isWishlistCreatedInAX' in wishlist.custom ? wishlist.custom.isWishlistCreatedInAX = false : Logger.error('custom attribute: isWishlistCreatedInAX, not found in wishlist');
		    				'wishlistTransactionId' in wishlist.custom ? wishlist.custom.wishlistTransactionId = responseObj.wishlistTransactionId : Logger.error('custom attribute: wishlistTransactionId, not found in wishlist');
		    				'wishlistCreationStatus' in wishlist.custom ? wishlist.custom.wishlistCreationStatus = "" + responseObj.Error : Logger.error('custom attribute: wishlistCreationStatus, not found in wishlist');
		    				'wishlistCreationMsg' in wishlist.custom ? wishlist.custom.wishlistCreationMsg = responseObj.message : Logger.error('custom attribute: wishlistCreationMsg, not found in wishlist');
        				}
        				//setting hook response
        				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.WISHLIST.CREATE.RESPONSE_ERROR);
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