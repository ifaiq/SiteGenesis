
var ISML = require('dw/template/ISML');

var guard = require('storefront_controllers/cartridge/scripts/guard');


function start() {
	var param = request.httpParameterMap.param;
		
	if (param.stringValue != null)
		{
                   ISML.renderTemplate(
                         'notEmpty.isml', {CurrentHttpParameterMap:param}  
                        );
                
		}
	else{
                        ISML.renderTemplate(
                         'empty.isml', {CurrentHttpParameterMap:'param not found'}  
                        );
	};
}
exports.Start = guard.ensure(['get'], start);