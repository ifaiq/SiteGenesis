'use strict';

/**
 * @module IssueGiftCard.js
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
var ServiceFactory = require('~/cartridge/scripts/utils/ServiceFactory');

/**
 * @function IssueGiftCard
 *
 *
 * @param {object} GiftCard The GiftCard to be calculated
 */
exports.IssueGiftCard = function (giftCard) {
	var returnStatus;
	Logger.debug('@IssueGiftCard giftCard'+giftCard);
	if(CommerceLinkFactory.Preferences['enableRealTimeGiftCardCreation']) {
		try {
			/***********************************************
			*		Build Request & Call Service		   *
			***********************************************/
			
			// Creating Request Pay load
			var requestDataContainer  = GiftCardFactory.buildIssueGiftCardRequestObject({
				giftCard : giftCard
				/*giftCardId	: giftCard.giftCertificateCode,
				amount		: giftCard.amount,
				currencyCode: giftCard.amount.currencyCode
				*/
			});
			
			// get the service
			var service = ServiceFactory.getPreferedService({
				feature		: CommerceLinkFactory.FEATURES.GIFT_CARD,
				property	: "ISSUE",
				identifier	: CommerceLinkFactory.SERVICES.GIFT_CARD
			});
			
			// make the call
			var result = service.call(requestDataContainer);
			var responseObj,
			requestDataObj = JSON.parse(requestDataContainer);
			if (result.error != 0 || result.errorMessage != null || result.mockResult) {
				//setting response object in status
				responseObj = JSON.parse(result.object);
				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS_ERROR);
				returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
				Transaction.wrap(function () {
					// Setting GiftCard Attribute in Case of Error when status code is not 200
					giftCard.custom.isGiftCardCreatedInAX = false;
	    			giftCard.custom.giftCardTransactionId = requestDataObj.transactionId;
	    			giftCard.custom.giftCardCreationStatus = CommerceLinkFactory.STATUS_CODES.GIFT_CARD.ISSUE.ERROR_STATUS;
	    			giftCard.custom.giftCardCreationMsg =  CommerceLinkFactory.STATUS_CODES.GIFT_CARD.ISSUE.ERROR_MESSAGE;
    			});
			}
			else {
				//success case
				//setting response object in status
				responseObj = JSON.parse(result.object);
				if(responseObj.status == "true") {
    				//setting hook response
    				returnStatus = new Status(Status.OK, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS);
    				returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
    				
    				Transaction.wrap(function () {
    					// Setting GiftCard Attribute in Case of Success when status code is 200
    					giftCard.custom.isGiftCardCreatedInAX = true;
    	    			giftCard.custom.giftCardTransactionId = requestDataObj.transactionId;
    	    			giftCard.custom.giftCardCreationStatus = CommerceLinkFactory.STATUS_CODES.GIFT_CARD.ISSUE.SUCESS_STATUS;
    	    			giftCard.custom.giftCardCreationMsg = CommerceLinkFactory.STATUS_CODES.GIFT_CARD.ISSUE.SUCCESS_MESSAGE;
    				});
				}
				else {
    				//setting hook response
    				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GIFT_CARD.ISSUE.RESPONSE_ERROR);
    				returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
    				
    				Transaction.wrap(function () {
    					// Setting GiftCard Attribute in Case of Error when status code is not 200
    					giftCard.custom.isGiftCardCreatedInAX = false;
    	    			giftCard.custom.giftCardTransactionId = requestDataObj.transactionId;
    	    			giftCard.custom.giftCardCreationStatus = "" + responseObj.Error;
    	    			giftCard.custom.giftCardCreationMsg =  responseObj.message;
        			});
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