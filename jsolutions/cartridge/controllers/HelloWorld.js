/**
* A hello world controller.  This file is in cartridge/controllers folder
*
* @module controllers/HelloWorld          
*/
exports.Start = function(){
        response.setContentType('text/html');
         response.getWriter().println('<h1>Hello World from Javascript controllers!</h1>');
};
exports.Start.public = true;   //World becomes the start node
