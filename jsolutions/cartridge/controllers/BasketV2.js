/**
* A hello world controller.  This file  is in cartridge/controllers folder
*
* @module controllers/BasketV2   this uses Model to invoke the basket
*/
//importPackage(dw.order);
var basket = require('dw/order/Basket');
var ISML = require('dw/template/ISML');
var guard = require('storefront_controllers/cartridge/scripts/guard');

start = function(){	

          basket = require('~/cartridge/scripts/BasketModel').getMyBasket();
	      ISML.renderTemplate(
                         'showBasket.isml', {myBasket:basket}
                        );
}
exports.Start = guard.ensure(['get'], start);
