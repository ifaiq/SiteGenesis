'use strict';

/** @module controllers/NewsletterV2 */

var ISML = require('dw/template/ISML');

/* Script Modules */
var guard = require('storefront_controllers/cartridge/scripts/guard');
require('dw/object');
require('dw/system');

var newsletterForm=null;

function start() 
{
     newsletterForm = session.forms.newsletter;
     session.forms.newsletter.clearFormElement();
               ISML.renderTemplate('newsletter/newslettersignup', {
               	
                        ContinueURL : dw.web.URLUtils.https('NewsletterV2-HandleForm'),
                        CurrentForms :session.forms
                });
}

/**
 * The form handler.
 */
function HandleForm() {

    var TriggeredAction = request.triggeredFormAction;
    var newsletterForm=null;
     
     response.getWriter().println('Triggered Action is : '+TriggeredAction);
    
     
      if ( (TriggeredAction != null)  && (TriggeredAction.formId == 'subscribe')) 
     { //did you press subscribe button ?
    	response.getWriter().println('Triggered action is not null');
      	response.getWriter().println('Triggered Action is: '+TriggeredAction.formId);
    	newsletterForm = session.forms.newsletter;
  
    	//Explicit Transactions
		var Transaction = require('dw/system/Transaction');
		Transaction.begin();
		try{ 
		   	var co:CustomObject = CustomObjectMgr.createCustomObject("NewsletterSubscription",newsletterForm.email.value);
           
		    //response.getWriter().println('fname inthe form is: '+newsletterForm.fname.value);
		    co.custom.firstName=newsletterForm.fname.value;
		    co.custom.lastName=newsletterForm.lname.value;
		    Transaction.commit();
		         ISML.renderTemplate('newsletter/newslettersuccess', {
                         CurrentForms    : session.forms
                 }); 

         return ;
        }
		   		

		   catch (e){
		   	// response.getWriter().println("In th exception block "+e.causeMessage);
		   	 newsletterForm.email.invalidateFormElement();
		    Transaction.rollback();  	
		   	   ISML.renderTemplate('newsletter/newslettersignup', {           	
                        ContinueURL : dw.web.URLUtils.https('NewsletterV2-HandleForm'),
                        CurrentForms :session.forms
                });
               return;
		   }


		}
		else{ //your email address is not even a valid email address go back and fill forms again
			
			//response.getWriter().println("session forms are here: "+session.forms);
			  ISML.renderTemplate('newsletter/newslettererrorV2', {
                CurrentForms    : session.forms
            });  

		} 

}
/*
 * Web exposed methods
*/
exports.Start = guard.ensure(['get'],start);
exports.HandleForm = guard.ensure(['post'], HandleForm);

