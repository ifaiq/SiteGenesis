'use strict';

/**
 * @module GetContactPerson.js
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
var QuotationFactory = require('~/cartridge/scripts/utils/contactperson/ContactPersonFactory');
var ServiceFactory = require('~/cartridge/scripts/utils/ServiceFactory');

/**
 * @function GetContactPerson
 *
 *
 * @param {object} contactperson Get ContactPerson from AX
 */
exports.GetContactPerson = function (args) {
	var returnStatus;
	if(CommerceLinkFactory.Preferences['enableRealTimeGetContactPerson']) {
		try {
			/***********************************************
			*		Build Request & Call Service		   *
			***********************************************/
			//Creating Request Pay load
			var requestDataContainer = ContactPersonFactory.buildGetContactPersonRequestObject({
				customerAccount : args.customerAccount
			});
			
			// get the service
			var service = ServiceFactory.getPreferedService({
				feature		: CommerceLinkFactory.FEATURES.CONTACT_PERSON,
				property	: "GET",
				identifier	: CommerceLinkFactory.SERVICES.CONTACT_PERSON,
				isParamBased: true,
				params		: {
					customerAccount : args.customerAccount
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
    				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.CONTACT_PERSON.GET.RESPONSE_ERROR);
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