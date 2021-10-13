'use strict';

/**
 * @module ATPInventory.js
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
 * @function ATPInventory
 *
 *
 * @param {object} inventory The ATP Inventory to be retrieved
 */
exports.ATPInventory = function (args) {
	var returnStatus;
	if(CommerceLinkFactory.Preferences['enableRealTimeATPInventory']) {
		try {
			/***********************************************
			*		Build Request & Call Service		   *
			***********************************************/			
			//Creating Request Pay load
			var requestDataContainer = ATPInventoryFactory.buildGetATPInventoryRequestObject({
				itemId		: masterProductID,
				variantId	: variantID
			});
			
			// get the service
			var variantID = args.variantID;
			var masterProductID = args.masterProductID;
			var service = ServiceFactory.getPreferedService({
				feature		: CommerceLinkFactory.FEATURES.INVENTORY,
				property	: "AVAILABILITY",
				identifier	: CommerceLinkFactory.SERVICES.INVENTORY,
				isParamBased: true,
				params		: {
					itemId		: masterProductID,
					variantId	: variantID
				}
			});

			// make the call
			var result = service.call(requestDataContainer);
			
			// Error Case
			if (result.error != 0 || result.errorMessage != null || result.mockResult) {
				//setting response object in status
				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS_ERROR);
				returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
			}
			// Success Case
			else {
				var responseObj = JSON.parse(result.object);
				if(responseObj.status == "true") {
    				//setting hook response
    				returnStatus = new Status(Status.OK, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS);
    				returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
				}
				else {
    				//setting hook response
    				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.INVENTORY.AVAILABILITY.RESPONSE_ERROR);
    				returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
				}
			}
		} catch(e) {
        	var errorMessage = e;
        	returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GENERAL.EXCEPTION_ERROR);
        }
	} else {
		returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GENERAL.SERVICE_NOT_ENABLED);
	}
	// ===================================================
    // =====            DONE                         =====
    // ===================================================
	
	return returnStatus;
};