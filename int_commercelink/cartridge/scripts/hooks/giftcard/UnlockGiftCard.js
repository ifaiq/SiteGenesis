'use strict';

/**
 * @module UnlockGiftCard.js
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
var GiftCardFactory = require('~/cartridge/scripts/utils/giftcard/GiftCardFactory');

/**
 * @function CreateOrder
 *
 *
 * @param {object} giftCard Unlock the existing giftCard
 */
exports.UnlockGiftCard = function (giftCard) {
	var returnStatus;
	if(CommerceLinkFactory.Preferences['enableRealTimeUnlockGiftCard']) {
		try {
			/***********************************************
			*		Build Request & Call Service		   *
			***********************************************/
			// build the tax request
			var requestDataContainer  = CreateOrderFactory.buildCreateOrderRequestObject({
				giftCard: giftCard
			});
			
			// get the service
			var service = ServiceFactory.getPreferedService({
				feature:	CommerceLinkFactory.FEATURES.GIFT_CARD,
				property:	"UNLOCK",
				identifier:	CommerceLinkFactory.SERVICES.GIFT_CARD,
				params : {
					giftCardId : requestDataContainer.giftCard.giftCardId // e.g.GC1001001199
				}
			});
			
			// make the call
			var result = service.call(requestDataContainer);
			
			//error case
			if (result.error != 0 || result.errorMessage != null || result.mockResult) {
				//setting response object in status
				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS_ERROR);
				returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
			}
			//success case
			else {
				var responseObj = JSON.parse(result.object);
				if(responseObj.Status == "true") {
    				//setting hook response
    				returnStatus = new Status(Status.OK, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS);
    				returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
				}
				else {
    				//setting hook response
    				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GIFT_CARD.UNLOCK.RESPONSE_ERROR);
    				returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
				}
			}
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