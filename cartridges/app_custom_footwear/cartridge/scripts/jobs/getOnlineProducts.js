function execute() {

  var Logger = require("dw/system/Logger");

  var ProductMgr = require("dw/catalog/ProductMgr");

  var catalogMgr = require("dw/catalog/CatalogMgr");

  var Product = require("dw/catalog/Product");

  var Transaction = require("dw/system/Transaction");

  var allProducts = ProductMgr.queryAllSiteProducts();

  var allProductsAllStored = ProductMgr.queryAllSiteProductsSorted();

  var product;

  var newproduct;

  var products = [

    "701643464111M",

    "701643464128M",

    "701643464135M",

    "701643464159M",

    "701643464166M",

  ];



  Transaction.wrap(function () {

    for (let i = 0; i < products.length; i++) {

      product = ProductMgr.getProduct(products[i]);

      product.onlineFlag = false

    }

  });

  Logger.error("product DETAILS " + product.ID);



  Logger.error("Before while");



  for (let i = 0; i < products.length; i++) {

    newproduct = ProductMgr.getProduct(products[i]);

    if(newproduct.onlineFlag === false) {

      Logger.error('in true flag')

      Logger.error("product DETAILS "+newproduct.ID);    

    }

  }

}



module.exports.execute = execute;

