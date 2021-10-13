/**
*
* @module controllers/Basket   
*/

	var ISML = require('dw/template/ISML');
	var guard = require('storefront_controllers/cartridge/scripts/guard');
	
	start = function(){	
		 var basket:Basket = require('dw/order/Basket');    
		 var basketResult = new dw.system.Pipelet('GetBasket').execute({}); 
		 var basket=basketResult.Basket;
	
		    ISML.renderTemplate(
	                         'showBasket.isml', {myBasket:basket}
	                        );

	}
exports.Start = guard.ensure(['get'], start);
