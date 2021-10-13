'use strict';

/**
 * @module ChannelPublish.js
 *
 * This JavaScript file implements methods (via Common.js exports).  This allows OCAPI calls to reference
 * these tools via the OCAPI 'hook' mechanism
 *
 */
/* API Includes */
var Logger = require('dw/system/Logger');
var Status = require('dw/system/Status');
var Transaction = require('dw/system/Transaction');
var ServiceRegistry = require('dw/svc/ServiceRegistry');

/* Packages Includes */


/* Local Packages Includes */
var CommerceLinkFactory = require('~/cartridge/scripts/utils/CommerceLinkFactory');
var ServiceFactory = require('~/cartridge/scripts/utils/ServiceFactory');

/**
 * @function ChannelPublish
 *
 * @param {object} order The Order to be calculated
 */
exports.ChannelPublish = function (args) {
	var returnStatus;
	
	/***********************************************
	*		Build Request & Call Service		   *
	***********************************************/
	// build the channel publish request
	//since no request packet needed this step will remain empty.

	try {
		
		// get the service
		var service = ServiceFactory.getPreferedService({
			feature:	CommerceLinkFactory.FEATURES.CHANNEL,
			identifier:	CommerceLinkFactory.SERVICES.CHANNEL
		});
		
		// make the call
		var result = service.call();
		
		//Error case
		if (result.error != 0 || result.errorMessage != null || result.mockResult) {
			// something went wrong we need to determine what and report
			returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS_ERROR);
			var responseObj = JSON.parse(result.object.text);
			returnStatus.addDetail("RESPONSE", responseObj);
		}
		else {
			/***********************************************
			*				HANDLE RESPONSE				   *
			***********************************************/
			returnStatus = new Status(Status.OK, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS);
			//var responseObj = JSON.parse(result.object.text);
			returnStatus.addDetail("RESPONSE", result.object);
		}
	} catch(e) {
		var errorMessage = e;
		// something went wrong we need to determine what and report
		returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GENERAL.EXCEPTION_ERROR);
	}
	
    // ===================================================
    // =====            DONE                         =====
    // ===================================================
    return returnStatus;
};


