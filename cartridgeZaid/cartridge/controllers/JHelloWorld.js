/**
* A hello world controller. This file is in cartridge/controllers folder
* @module controllers JHelloWorld
*/
var guard = require('storefront_controllers/cartridge/scripts/guard');
var ISML = require('dw/template/ISML');
function start() {
	ISML.renderTemplate(
			'helloworld1.isml', {
			myParameteronISML:
			"Hello from Controllers!"
			}
		);
};
exports.Start = guard.ensure(['get'], start);