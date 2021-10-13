'use strict';

/**
 * @module GetWishlist.js
 *
 * This JavaScript file implements methods (via Common.js exports).  This allows OCAPI calls to reference
 * these tools via the OCAPI 'hook' mechanism
 *
 */
/* API Includes */
var Logger = require('dw/system/Logger');
var Status = require('dw/system/Status');
var Transaction = require('dw/system/Transaction'); 

/* Local API Includes */
var CommerceLinkFactory = require('~/cartridge/scripts/utils/CommerceLinkFactory');
var WishlistFactory = require('~/cartridge/scripts/utils/wishlist/WishlistFactory');
var ServiceFactory = require('~/cartridge/scripts/utils/ServiceFactory');

/**
 * @function GetWishlist
 *
 *
 * @param {object} wishlist The Wishlist is to be retrieved from AX
 */
exports.GetWishlist = function (args) {
	var returnStatus;
	if(CommerceLinkFactory.Preferences['enableRealTimeGetWishlist']) {
		try {
			/***********************************************
			*		Build Request & Call Service		   *
			***********************************************/
			//Creating Request Pay load
			var requestDataContainer = WishlistFactory.buildGetWishlistRequestObject({
				wishListId		: args.wishListId,
				customerId		: args.customerId,
				favoriteFilter	: args.favoriteFilter,
				publicFilter	: args.publicFilter
			});
			
			// get the service
			var service = ServiceFactory.getPreferedService({
				feature		: CommerceLinkFactory.FEATURES.WISHLIST,
				property	: "GET",
				identifier	: CommerceLinkFactory.SERVICES.WISHLIST,
				isParamBased: true,
				params		: {
					wishListId		: args.wishListId,
					customerId		: args.customerId,
					favoriteFilter	: args.favoriteFilter,
					publicFilter	: args.publicFilter
				}
			});
			
			// make the call
			var result = service.call(requestDataContainer);
			
			// Error Case
			if (result.error != 0 || result.errorMessage != null || result.mockResult) {
				//setting response object in status
				responseObj = JSON.parse(result.object);
				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS_ERROR);
				if(result && 'object' in result) {
					returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
				}
			} else { // Success Case
				//setting response object in status
				responseObj = JSON.parse(result.object);
    			
    			Transaction.wrap(function () {
    				if(responseObj.status == "true") {
    					//setting hook response
        				returnStatus = new Status(Status.OK, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS);
        				if(result && 'object' in result) {
        					returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
        				}
    				}
    				else {
    					//setting hook response
        				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.WISHLIST.GET.RESPONSE_ERROR);
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