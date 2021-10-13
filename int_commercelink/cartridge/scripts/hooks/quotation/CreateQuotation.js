'use strict';

/**
 * @module CreateQuotation.js
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
var QuotationFactory = require('~/cartridge/scripts/utils/quotation/QuotationFactory');

/**
 * @function CreateQuotation
 *
 *
 * @param {object} order The Order to be calculated
 */
exports.CreateQuotation = function (args) {
	var returnStatus;
	if(CommerceLinkFactory.Preferences['enableRealTimeQuotationCreation']) {
		try {
			/***********************************************
			*		Build Request & Call Service		   *
			***********************************************/
			// Creating Request Pay load
			var requestDataContainer  = QuotationFactory.buildCreateQuotationRequestObject({
				quotation: args.quotation
			});
			
			// get the service
			var service  = dwsvc.ServiceRegistry.get(CommerceLinkFactory.SERVICES.QUOTATION.CREATE);
			
			// make the call
			var result = service.call(requestDataContainer);
			
			if (result.error != 0 || result.errorMessage != null || result.mockResult) {
				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GET_QUOTATION.SUCCESS_ERROR);
			}
			else {
				//success case
				var responseObj = JSON.parse(result.object.text);
				
				/** In responseObj we have message if Quotation created successfully  **/
    			returnStatus = new Status(Status.OK, CommerceLinkFactory.STATUS_CODES.GET_QUOTATION.SERVICE_NOT_ENABLED);
    			returnStatus.addDetail('CreatedQuotation', responseObj);
			}
		} catch(e) {
        	var errorMessage = e;
        	returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GET_QUOTATION.EXCEPTION_ERROR);
        }
	}
	else {
		returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GET_QUOTATION.SERVICE_NOT_ENABLED);
	}
	// ===================================================
    // =====            DONE                         =====
    // ===================================================
	
	return returnStatus;
};