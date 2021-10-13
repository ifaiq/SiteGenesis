'use strict';

/** @module controllers/EditPreferences */

var ISML = require('dw/template/ISML');

/* Script Modules */
var guard = require('storefront_controllers/cartridge/scripts/guard');
var URLUtils=require('dw/web/URLUtils');
var preferencesForm=require('dw/web/Form');

 var preferencesForm = session.forms.preferences;
function start() {
	
    //session.forms.preferences.clearFormElement();
    preferencesForm.clearFormElement();
    preferencesForm.copyFrom(customer.profile);  //updateFormWithObject and binds the object to this form
               ISML.renderTemplate('editpreferences.isml', {	
                        ContinueURL : dw.web.URLUtils.https('EditPreferences-HandleForm'),
                        CurrentForms :session.forms
                });
}

/**  * The form handler. */
function HandleForm() {

    var TriggeredAction = request.triggeredFormAction;
      response.getWriter().println('Triggered action is '+TriggeredAction.formId);
  //  var preferencesForm:dw.web.Form = session.forms.preferences;
   
    response.getWriter().println('Electronics preference  is !'+preferencesForm.interestElectronics.value);
    // preferencesForm.accept();
 	var Transaction = require('dw/system/Transaction');   
 	
 	Transaction.wrap(function() {  //implicit transaction
 		//	preferencesForm.copyTo(customer.profile);  //updateObjectWithForm
 		//you can use the line above but since the object is already binded, you can use
 		    preferencesForm.accept();
         
       });
 
       response.redirect(URLUtils.https('Account-Show'));
            return;
       
}

/*
 * Web exposed methods
 */
/** @see module:controllers/SendToFriend~Start */
exports.Start = guard.ensure(['get', 'https', 'loggedIn'], start);
exports.HandleForm = guard.ensure(['post'], HandleForm);

