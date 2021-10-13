'use strict';

/**
 * @module GetStoreAvailability.js
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
var StoreFactory = require('~/cartridge/scripts/utils/store/StoreFactory');
var ServiceFactory = require('~/cartridge/scripts/utils/ServiceFactory');

/**
 * @function GetStoreAvailability
 *
 *
 * @param {object} storeavailability The Store availability to get from AX
 */
exports.GetStoreAvailability = function (args) {
	var returnStatus;
	if(CommerceLinkFactory.Preferences['enableRealTimeGetStoreAvailability']) {
		try {
			/***********************************************
			*		Build Request & Call Service		   *
			***********************************************/			
			//Creating Request Pay load
			var requestDataContainer = StoreFactory.buildGetStoreAvailabilityRequestObject({
				itemId		: args.itemId,
				variantId	: args.variantId
			});
			
			// get the service
			var service = ServiceFactory.getPreferedService({
				feature		: CommerceLinkFactory.FEATURES.STORE,
				property	: "AVAILABILITY",
				identifier	: CommerceLinkFactory.SERVICES.STORE,
				isParamBased: true,
				params		: {
					itemId		: args.itemId,
					variantId	: args.variantId
				}
			});

			// make the call
			var result = service.call(requestDataContainer);
			
			// Error Case
			if (result.error != 0 || result.errorMessage != null || result.mockResult) {
				//setting response object in status
				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS_ERROR);
				if(result && 'object' in result) {
					returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
				}
			}
			// Success Case
			else {
				var responseObj = JSON.parse(result.object);
				if(responseObj.status == "true") {
    				//setting hook response
    				returnStatus = new Status(Status.OK, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS);
    				if(result && 'object' in result) {
    					returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
    				}
    			}
				else {
    				//setting hook response
    				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.STORE.AVAILABILITY.RESPONSE_ERROR);
    				if(result && 'object' in result) {
    					returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
    				}
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