String.prototype.dup = function(count) {
    return new Array(count).join(this);
};


var errorArray = {};
var i;
var j;
var k;
var x;
var y;
var lineNumber = 0;
var errorCount = 0;
var tmpLine;
var actualError;
var errorObj = [];
var expectedDescs = [];
var expectedDesc = [];
var errorMsg;
var errorLocation;

//var parser = require('./integerparser.js');
//var parser = require('./constantsAndExpressions.js');
//var parser = require('./ifPegParser.js');
var parser = require('./tupleParser.js');
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
var jsonFile = fs.readFileSync("./data/prplearn.json");
var jsonContent = JSON.parse(jsonFile);
//console.log(jsonContent);

var data_backup = fs.readFileSync(filename).toString().split('\n');
var data = fs.readFileSync(filename).toString();
for (y = 0; y < data.length; y++) {
    if (data[y] == "#") {
        actualError = data.substr(y+1, data.length-1);
    }
}
//console.log(actualError);

try {
    parser.parse(data);
}

catch(err) {
       
    if (err instanceof parser.SyntaxError) {

        /*for (j = 0; j < err.expected.length; j++) {
            expectedDescs[j] = err.expected[j].description;
        }*/

        for (i = 0; i < err.expected.length; i++) {
          //expectedDescs[i] = err.expected[i].description;
          if (err.expected[i].type == "other") {
            expectedDescs[i] = err.expected[i].description;
          }
          else if (err.expected[i].type == "literal") {
            expectedDescs[i] = err.expected[i].text;
          }
        }

        expectedDescs.sort();
        if (expectedDescs.length > 0) {
          for (i = 1, j = 1; i < expectedDescs.length; i++) {
            if (expectedDescs[i - 1] !== expectedDescs[i]) {
              expectedDescs[j] = expectedDescs[i];
              j++;
            }
          }
          expectedDescs.length = j;
        }  

        expectedDesc = err.expected.length > 1 ? expectedDescs.slice(0, -1).join(", ") + " or " + expectedDescs[err.expected.length - 1] : expectedDescs[0]; 
        //console.log(expectedDescs); 

        /*compare array elements*/

        for (i = 0; i < jsonContent.length; i++) {
            var is_same = jsonContent[i].expectedGrammar.length == expectedDescs.length && jsonContent[i].expectedGrammar.every(function (element, index) {
                  return element === expectedDescs[index];
            });

            if (is_same) {
                 x = err.location.start.offset;
                 while (x != -1) {
                    if (data[x] == "\n") {
                        errorLocation = x + 1;
                        x = 0;
                    }   
                    x = x - 1;
                 }
                 console.log('Error in input file: ');
                 console.log(data_backup[err.location.start.line-1]);
                 //console.log(data.substr(errorLocation, err.location.start.column));
                 console.log('-'.dup(err.location.start.column) + '^');
                 console.log('Line '+err.location.start.line+', column '+err.location.start.column+': '+jsonContent[i].userError);
                 errorMsg = jsonContent[i].userError;
                 /*if (actualError == errorMsg) { 
                    console.log('pass: '+errorMsg);
                 }*/
                 console.log('pass: '+errorMsg);
                 return;
            }
        }

        if (!is_same) {
            x = err.location.start.offset;
            while (x != -1) {
                if (data[x] == "\n") {
                    errorLocation = x + 1;
                    x = 0;
                }
                x = x - 1;
            }
            console.log('Error in input file: ');
            console.log(data.substr(errorLocation, err.location.start.column));
            console.log('-'.dup(err.location.start.column) + '^');
            console.log('Line '+err.location.start.line+', column '+err.location.start.column+': '+err.message);
            //errorMsg = err.message;
            if (actualError != errorMsg) {
                console.log('FAILED: unmatched error types'); 
                console.log('EXPECTED: '+actualError); 
                console.log('FOUND: '+err.message); 
            }
            return;
        }
    }
}

        
