/**
* A Caching controller.
*
* @module controllers/Caching         
*/
start = function(){	
	
	let Calendar = require('dw/util/Calendar');
	var ISML = require('dw/template/ISML');
	//relative cache expiration, cache for 30 minutes from now
	let cal = new Calendar();
	cal.add(Calendar.MINUTE, 30);
	response.setExpires(cal.getTime());
	
	        ISML.renderTemplate('cachedpage', {
	           Message: 'Hello World!',
	           myTime: cal.getTime()
	          });
        
}      
exports.Start = guard.ensure(['get'], start); 
