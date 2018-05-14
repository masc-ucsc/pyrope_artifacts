String.prototype.dup = function(count) {
    return new Array(count).join(this);
};


var errorArray = {};
var i;
var j;
var lineNumber = 0;
var errorCount = 0;
var tmpLine;
var actualError;
var errorObj = [];
var expectedDescs = [];
var expectedDesc = [];
var errorMsg;

//var parser = require('./integerparser.js');
var parser = require('./constantsAndExpressions.js');
var fs = require('fs');
var path = require('path');
readline = require('readline');
var filename = process.argv[2];
//var error = process.argv[3];
//var filepath = path.join(__dirname, 'tests');
//var filepath = __dirname;
//var filename;

//var fileList = fs.readdirSync(filepath);
//var fileList = fs.readdirSync('prplearn.json');
//var jsonFile = fs.readFileSync("prplearn.json");
var jsonFile = fs.readFileSync("../data/prplearn.json");
var jsonContent = JSON.parse(jsonFile);
//console.log(jsonContent);

fs.readFileSync(filename).toString().split('\n').forEach(function (line) {
    try {
        lineNumber = lineNumber + 1;
        parser.parse(line);
    }
   
    catch(err) {
           
        if (err instanceof parser.SyntaxError) {

            if (line.substring(0, 1) == '#') {
                actualError = line.substring(1);
                //console.log(actualError);     
                if (actualError == errorMsg) {
                  console.log('pass: '+errorMsg);                
                } else {
                  console.log('FAILED: unmatched error types; Expected "'+actualError+'" type but found "'+errorMsg+'"');                
                }            
                return;
            }
 
            for (i = 0; i < err.expected.length; i++) {
                expectedDescs[i] = err.expected[i].description;
            }

            expectedDesc = err.expected.length > 1 ? expectedDescs.slice(0, -1).join(", ") + " or " + expectedDescs[err.expected.length - 1] : expectedDescs[0]; 
            //console.log(expectedDescs); 
    
            /*compare array elements*/

            for (i = 0; i < jsonContent.length; i++) {
                var is_same = jsonContent[i].expectedGrammar.length == expectedDescs.length && jsonContent[i].expectedGrammar.every(function (element, index) {
                      return element === expectedDescs[index];
                });

                if (is_same) {
                     //console.log('Line '+err.line+', column '+err.column+': '+err.message);
                     //console.log(jsonContent[i].userError);
                     console.log('Error in input file: ' +line);
                     console.log(line);
                     console.log('-'.dup(err.column) + '^');
                     console.log('Line '+lineNumber+', column '+err.column+': '+jsonContent[i].userError);
                     errorMsg = jsonContent[i].userError;
                     //console.log('Line '+err.line+', column '+err.column+': '+jsonContent[i].userError);
                     return;
                   
                } 
                  
             }
              
        }
                         
    }
     
});


