'use strict';

/** @module controllers/Newsletter */

var ISML = require('dw/template/ISML');
var guard = require('storefront_controllers/cartridge/scripts/guard');

function start() {
  
    var newsletterForm = session.forms.newsletter;
    newsletterForm.clearFormElement();
    //session.forms.newsletter.clearFormElement();

               ISML.renderTemplate('newsletter/newslettersignup', {
                        ContinueURL : dw.web.URLUtils.https('Newsletter-HandleForm'),
                        CurrentForms :session.forms
                });
}

/**
 * The form handler.
 */
function handleForm() {

    var TriggeredAction = request.triggeredFormAction;
      response.getWriter().println('Hello World from pipeline controllers!'+TriggeredAction);
      if (TriggeredAction != null) {
    	
        if (TriggeredAction.formId == 'subscribe') {
    	var newsletterForm = session.forms.newsletter;
    	response.getWriter().println('Hello World from pipeline controllers!'+newsletterForm.fname.value);
            ISML.renderTemplate('newsletter/newslettersuccess', {
                CurrentForms    : session.forms
            }); 
            return;
  
		}
      }

}//function HandleForm
/*
 * Web exposed methods
 */

exports.Start = guard.ensure(['get'], start);

exports.HandleForm = guard.ensure([], handleForm);

