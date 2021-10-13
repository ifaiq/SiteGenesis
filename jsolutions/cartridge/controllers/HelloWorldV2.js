/**
* A hello world controller.  This file is in cartridge/controllers folder
*
* @module controllers/HelloWoldV2          
*/
exports.Start = function(){
	 var CurrentHttpParameterMap = request.httpParameterMap;
	 var myParameter=CurrentHttpParameterMap.param;

	 var ISML = require('dw/template/ISML');

	    ISML.renderTemplate(
	                          'helloworld.isml', {myParameteronISML:myParameter}
	                         );

};
exports.Start.public = true;   
