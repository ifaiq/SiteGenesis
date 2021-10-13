'use strict';

/** @module controllers/ShowProduct */

var ISML = require('dw/template/ISML');

/* Script Modules */
var guard = require('storefront_controllers/cartridge/scripts/guard');

function start() {
    var CurrentHttpParameterMap = request.httpParameterMap;
    var productResult = null;
    if (CurrentHttpParameterMap.pid.stringValue) {
        productResult = getProduct(CurrentHttpParameterMap.pid.stringValue);
       
    }
  
   //var result=test();
   // response.getWriter().println(result.hello);
    ISML.renderTemplate(
                         'productfound.isml', {myProduct:productResult.Product}  
                        );
}
function getProduct(pidString) {
    var GetProductResult = new dw.system.Pipelet('GetProduct').execute({
        ProductID : pidString
    });
    if (GetProductResult.result == PIPELET_ERROR) {
        return {
            error : true
        };
    }
    // var Product = GetProductResult.Product;
    // var Product=dw.catalog.ProductMgr.getProduct(pid.value);
    //   response.getWriter().println(Product.name);
    return {
        Product  :GetProductResult.Product
        
    };
}
      	
exports.Start = guard.ensure(['get'], start);

