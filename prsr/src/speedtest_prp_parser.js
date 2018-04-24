String.prototype.dup = function(count) {
    return new Array(count).join(this);
};


var errorArray = {};
var i;
var j;
var k;
var x;
var y;
var errorLocation;
var lineNumber = 0;
var errorCount = 0;
var tmpLine;
var actualError;
var errorObj = [];
var expectedDescs = [];
var expectedDesc = [];
var eol;

var prp_path = process.env.PRP_PATH;

var fs = require('fs');
var path = require('path');
var _ = require('underscore');
readline = require('readline');
var filename = process.argv[2];
//var parser = require(path.join(prp_path,'src/java.js'));
//var parser = require('./tupleParser.js');
var parser = require('./prp_parser.js');

//var error = process.argv[3];
//var filepath = path.join(__dirname, 'tests');
//var filepath = __dirname;
//var filename;

//var fileList = fs.readdirSync(filepath);
//var fileList = fs.readdirSync('prplearn.json');
//var jsonFile = fs.readFileSync("prplearn.json");

//var jsonFile = fs.readFileSync(path.join(prp_path,"data/prplearn.json"));
//var jsonContent = fs.readFileSync("../data/prplearn.json").toString().split('\n');
//var jsonContent = JSON.parse(jsonFile);

//console.log(jsonContent);

// file or stdin chose as input
if (process.argv[2] != "--stdin") {
  var data = fs.readFileSync(filename).toString();
  var data_backup = data.split('\n');
}
else {
  var data = fs.readFileSync(process.stdin.fd).toString();
  var data_backup = data.split('\n');
}

try {
    //lineNumber = lineNumber + 1;
    parser.parse(data);
}

catch(err) {
       
    if (err instanceof parser.SyntaxError) {
        
/*
        var descriptions = [];
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
*/

        /*compare array elements*/

/*      
        for (i = 0; i < jsonContent.length; i++) {

            var is_same = jsonContent[i].expectedGrammar.length == expectedDescs.length && (_.difference(jsonContent[i].expectedGrammar, expectedDescs).length == 0)
            
            if (is_same) {
                 //console.log('Line '+err.line+', column '+err.column+': '+err.message);
                 //console.log(jsonContent[i].userError);
                 x = err.location.start.offset;
                 while (x != -1) {
                    if (data[x] == "\n") {
                        //console.log("otha: "+data.substr(x+1, err.location.start.column));
                        errorLocation = x + 1;
                        x = 0;
                    }
                    x = x - 1;
                 } 
                 //console.log('Error in input file: ');
                 console.log(filename.split('/').pop()+':'+err.location.start.line+':'+err.location.start.column+': error: '+jsonContent[i].userError);
                 console.log(data_backup[err.location.start.line-1]);
                 //console.log(data.substr(errorLocation, err.location.end.column));
                 console.log('-'.dup(err.location.start.column) + '^');
                 //console.log('Line '+err.location.start.line+', column '+err.location.start.column+': '+jsonContent[i].userError);
                 return;
               
            }
        }
*/

        //console.log('Error in input file: ');
        //console.log(filename.split('/').pop());
        console.log(filename.split('/').pop()+':'+err.location.start.line+':'+err.location.start.column+': error: '+err.message);
        console.log(data_backup[err.location.start.line-1]);
        console.log('-'.dup(err.location.start.column) + '^');
        //console.log('Line '+err.location.start.line+', column '+err.location.start.column+': '+err.message);
        // console.log("ALERT: no user defined error message available for this case");
        return;    
        
    }
          
                     
}
     


