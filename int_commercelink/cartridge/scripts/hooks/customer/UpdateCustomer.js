'use strict';

/**
 * @module UpdateCustomer.js
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
var CustomerFactory = require('~/cartridge/scripts/utils/customer/CustomerFactory');
var ServiceFactory = require('~/cartridge/scripts/utils/ServiceFactory');

/**
 * @function UpdateCustomer
 *
 *
 * @param {object} customer The Customer to be updated in AX
 */
exports.UpdateCustomer = function (args) {
	var customerObj = args;
	var returnStatus;
	if(CommerceLinkFactory.Preferences['enableRealTimeCustomerUpdate']) {
		try {
			/***********************************************
			*		Build Request & Call Service		   *
			***********************************************/
			// Creating Request Pay load
			var requestDataContainer  = CustomerFactory.buildUpdateCustomerRequestObject(customerObj);
			
			/// get the service
			var service = ServiceFactory.getPreferedService({
				feature:	CommerceLinkFactory.FEATURES.CUSTOMER,
				property:	"UPDATE",
				identifier:	CommerceLinkFactory.SERVICES.CUSTOMER
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
				
				Transaction.wrap(function () {
					//Setting Profile Attribute in Case of Error when status code is not 200
					args.profile.custom.isSyncedWithAX = false;
    			});
			}
			//success case
			else {
				//setting response object in status
				responseObj = JSON.parse(result.object);
    			
    			Transaction.wrap(function () {
    				if(responseObj.Status == "true") {
    					//Setting Profile Attribute in Case of Error when status code is 200
    					args.profile.custom.isSyncedWithAX = true;
        				
        				//setting hook response
        				returnStatus = new Status(Status.OK, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS);
        				returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
    				}
    				else {
    					args.profile.custom.isSyncedWithAX = false;
    					args.profile.custom.recordID = responseObj.CustomerInfo.RecordId;
    					
        				//setting hook response
        				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.CUSTOMER.UPDATE.RESPONSE_ERROR);
        				returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
    				}
    			});
			}
			
			//setting general service result in status
			returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.SERVICE_RESULT, result);
		} catch(e) {
        	var errorMessage = e;
        	Transaction.wrap(function () {
        		args.profile.custom.isSyncedWithAX = false;
        	});
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