'use strict';

/**
 * @module GetCustomer.js
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
var CustomerFactory = require('~/cartridge/scripts/utils/customer/CustomerFactory');
var ServiceFactory = require('~/cartridge/scripts/utils/ServiceFactory');

/**
 * @function GetCustomer
 *
 *
 * @param {object} customer The Customer to be created in AX
 */
exports.GetCustomer = function (args) {
	var returnStatus;
	if(CommerceLinkFactory.Preferences['enableRealTimeGetCustomer']) {
		try {
			/***********************************************
			*		Build Request & Call Service		   *
			***********************************************/
			// Creating Request Pay load
			var requestDataContainer  = CustomerFactory.buildGetCustomerRequestObject({
				customerId: args.customerId
			});
			
			/// get the service
			var service = ServiceFactory.getPreferedService({
				feature:	CommerceLinkFactory.FEATURES.CUSTOMER,
				property:	"GET",
				identifier:	CommerceLinkFactory.SERVICES.CUSTOMER
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
				if(responseObj.status == "true") {
    				//setting hook response
    				returnStatus = new Status(Status.OK, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS);
    				returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
				}
				else {
    				//setting hook response
    				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.CUSTOMER.CREATE.RESPONSE_ERROR);
    				returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
				}
			}
			
			//setting general service result in status
			returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.SERVICE_RESULT, result);
		} catch(e) {
        	var errorMessage = e;
        	returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GENERAL.EXCEPTION_ERROR);
        }
	}
	else {
		returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GET_CUSTOMER.SERVICE_NOT_ENABLED);
	}
	// ===================================================
    // =====            DONE                         =====
    // ===================================================
	
	return returnStatus;
};