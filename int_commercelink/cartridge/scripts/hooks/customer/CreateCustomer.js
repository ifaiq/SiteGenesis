'use strict';

/**
 * @module CreateCustomer.js
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
 * @function CreateCustomer
 *
 *
 * @param {object} customer The Customer to be created in AX
 */
exports.CreateCustomer = function (args) {
	var customerObj = args.object;
	var returnStatus;
	if(CommerceLinkFactory.Preferences['enableRealTimeCustomerCreation']) {
		try {
			/***********************************************
			*		Build Request & Call Service		   *
			***********************************************/
			// Creating Request Pay load
			var requestDataContainer  = CustomerFactory.buildCreateCustomerRequestObject(customerObj);
			
			// get the service
			var service = ServiceFactory.getPreferedService({
				feature:	CommerceLinkFactory.FEATURES.CUSTOMER,
				property:	"CREATE",
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
					args.object.profile.custom.isCustomerCreatedInAX = false;
    			});
			}
			//success case
			else {
				//setting response object in status
				responseObj = JSON.parse(result.object);
    			
    			Transaction.wrap(function () {
    				if(responseObj.Status == "true") {
    					//Setting Profile Attribute in Case of Success when status code is 200
    					args.object.profile.custom.isCustomerCreatedInAX = true;
    					if (responseObj.CustomerInfo && 'RecordId' in responseObj.CustomerInfo) {
                            args.object.profile.custom.recordID = (responseObj.CustomerInfo.RecordId).toString();
    					}
    					// customerId sent as a parameter in GetCustomer Service to fetch customer from AX
    					if (responseObj.CustomerInfo && 'AccountNumber' in responseObj.CustomerInfo) {
                            args.object.profile.custom.customerId = (responseObj.CustomerInfo.AccountNumber).toString();
    					}
        				//setting hook response
        				returnStatus = new Status(Status.OK, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS);
        				returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
    				}
    				else {
    					customerObj.profile.custom.isCustomerCreatedInAX = false;
    					if (responseObj.CustomerInfo && 'RecordId' in responseObj.CustomerInfo) {
                            args.object.profile.custom.recordID = (responseObj.CustomerInfo.RecordId).toString();
	    				}
        				//setting hook response
        				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.CUSTOMER.CREATE.RESPONSE_ERROR);
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