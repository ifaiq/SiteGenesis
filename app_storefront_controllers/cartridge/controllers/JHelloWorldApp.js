/**
* Description of the Controller and the logic it provides
*
* @module  controllers/JHelloWorldApp
*/

'use strict';

// HINT: do not put all require statements at the top of the file
// unless you really need them for all functions

/**
* Description of the function
*
* @return {String} The string 'myFunction'
*/
// var myFunction = function(){
//     return 'myFunction';
// }

/* Exports of the controller */
///**
// * @see {@link module:controllers/JHelloWorldApp~myFunction} */
//exports.MyFunction = myFunction;

/*==============================*/
/**
* A hello world controller. This file is in cartridge/controllers folder
* @module controllers JHelloWorld
*/
var guard = require('app_storefront_controllers/cartridge/scripts/guard');
var ISML = require('dw/template/ISML');
function start() {
	ISML.renderTemplate(
		'helloworld1.isml', {
			myParameteronISML:
			"Hello from Controllers"
		}
	);
}
exports.Start = guard.ensure(['get'], start);

