'use strict';

/** @module controllers/NewsletterV2 */

var ISML = require('dw/template/ISML');

/* Script Modules */
var Custombject=require('dw/object/CustomObject');


var guard = require('storefront_controllers/cartridge/scripts/guard');

var newsletterForm=require('dw/web/Form');

function start() 
{
     newsletterForm = session.forms.newsletter;
     newsletterForm.clearFormElement();
     //session.forms.newsletter.clearFormElement();
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
     
    // response.getWriter().println('Triggered Action is : '+TriggeredAction);
    
     
      if ( (TriggeredAction != null) 
          && (TriggeredAction.formId == 'subscribe')   ) 
     { //did you press subscribe button ?
    	response.getWriter().println('Triggered action is not null');
      	response.getWriter().println('Triggered Action is: '+TriggeredAction.formId);
    	newsletterForm = session.forms.newsletter;
  
    	//Explicit Transactions
		var Transaction = require('dw/system/Transaction');
		Transaction.begin();
		try{ 
			
			 var myModel = require('~/cartridge/scripts/MyModel'); 
			 
             var co:CustomObject=co=myModel.createMyObject(newsletterForm);
             
           response.getWriter().println('Object that came back: '+co);
		    Transaction.commit();
		           ISML.renderTemplate('newsletter/newslettersuccessV2', {
                         CurrentForms    : session.forms,
                         Subscription    : co
                 });  

         return ;
        }
		   		

		   catch (e){
		   	response.getWriter().println("In th exception block "+e.causeMessage);
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
exports.HandleForm=guard.ensure([],HandleForm);

