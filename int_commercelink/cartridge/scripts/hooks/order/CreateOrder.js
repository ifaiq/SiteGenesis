'use strict';

/**
 * @module CreateOrder.js
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
var OrderFactory = require('~/cartridge/scripts/utils/order/OrderFactory');
var ServiceFactory = require('~/cartridge/scripts/utils/ServiceFactory');

/**
 * @function CreateOrder
 *
 *
 * @param {object} order The Order to be created
 */
exports.CreateOrder = function (order) {
	var returnStatus;
	if(CommerceLinkFactory.Preferences['enableRealTimeOrderCreation']) {
		try {
			/***********************************************
			*		Build Request & Call Service		   *
			***********************************************/
			// Creating Request Pay load
			var requestDataContainer  = OrderFactory.buildCreateOrderRequestObject({
				order: order
			});
			
			// get the service
			var service = ServiceFactory.getPreferedService({
				feature:	CommerceLinkFactory.FEATURES.ORDER,
				property:	"CREATE",
				identifier:	CommerceLinkFactory.SERVICES.ORDER
			});
			
			// make the call
			var result = service.call(requestDataContainer);
			var responseObj;
			
			//error case
			if (result.error != 0 || result.errorMessage != null || result.mockResult) {
				//setting response object in status
				responseObj = JSON.parse(result.object);
				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS_ERROR);
				if(result && 'object' in result) {
					returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
				}
				Transaction.wrap(function () {
					//Setting Order Attribute in Case of Error when status code is not 200
    				order.custom.isOrderCreatedInAX = false;
    				order.custom.salesOrderTransactionId = null;
    				order.custom.salesOrderCreationStatus = CommerceLinkFactory.STATUS_CODES.ORDER.CREATE.ERROR_STATUS;
    				order.custom.salesOrderCreationMsg = CommerceLinkFactory.STATUS_CODES.ORDER.CREATE.ERROR_MESSAGE;
    			});

				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS_ERROR);
				if(result && 'object' in result) {
					returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
				}
			}
			//success case
			else {
				//setting response object in status
				responseObj = JSON.parse(result.object);
    			
    			Transaction.wrap(function () {
    				if(responseObj.status == "true") {
    					//Setting Order Attribute in Case of Error when status code is 200
    					order.custom.isOrderCreatedInAX = true;
        				order.custom.salesOrderTransactionId = responseObj.salesOrderTransactionId;
        				order.custom.salesOrderCreationStatus = CommerceLinkFactory.STATUS_CODES.ORDER.CREATE.SUCESS_STATUS;
        				order.custom.salesOrderCreationMsg = responseObj.message;
        				
        				//Setting Export Status When Order Successfully Created in AX
        				order.setExportStatus(dw.order.Order.EXPORT_STATUS_EXPORTED);
        				
        				//setting hook response
        				returnStatus = new Status(Status.OK, CommerceLinkFactory.STATUS_CODES.GENERAL.SUCCESS);
        				if(result && 'object' in result) {
        					returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
        				}
    				}
    				else {
    					order.custom.isOrderCreatedInAX = false;
        				order.custom.salesOrderTransactionId = responseObj.salesOrderTransactionId;
        				order.custom.salesOrderCreationStatus = "" + responseObj.Error;
        				order.custom.salesOrderCreationMsg = responseObj.message;
        				
        				//setting hook response
        				returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.ORDER.CREATE.RESPONSE_ERROR);
        				if(result && 'object' in result) {
        					returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.RESPONSE_OBJECT, result.object);
        				}
        			}
    			});
			}
			
			//setting general service result in status
			returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.SERVICE_RESULT, result);
		} catch(e) {
        	var errorMessage = e;
        	
        	//setting exception object in status
        	returnStatus = new Status(Status.ERROR, CommerceLinkFactory.STATUS_CODES.GENERAL.EXCEPTION_ERROR);
        	if (result && 'object' in result) {
        		returnStatus.addDetail(CommerceLinkFactory.STATUS_CODES.EXCEPTION_OBJECT, result.object);
        	}
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