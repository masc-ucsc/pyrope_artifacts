String.prototype.dup = function(count) {
  return new Array(count).join(this);
};


var failCount = 0;
var errorArray = {};
var i; 
var j;
var errorCount = 0;
var tmpLine;
var actualError;
var errorList = [];
var errorObj = [];
var objIndex = 0;
//var expectedDescs = [];
//var expectedDesc = [];
var expectedArray = [];
//var parser = require('./integerparser.js');
//var parser = require('./expression.js');
//var parser = require('./parser.js');
//var parser = require('./expressionParser.js');
//var parser = require('./expressionAdvanced.js');
var parser = require('./constantsAndExpressions.js');
var fs = require('fs');
var path = require('path');
readline = require('readline');
//var filename = process.argv[2];
//var error = process.argv[3];
//var filepath = path.join(__dirname, 'tests');
var filepath = "../tests/";
//var filename;

var fileList = fs.readdirSync(filepath);
//var fileList = fs.readdirSync("../tests/");

for (var item in fileList) {
      fs.readFileSync(path.join(filepath, fileList[item])).toString().split('\n').forEach(function (line) {
          if (line.substring(0, 1) == '#') {
              //console.log(line);
              errorList.push(line.substring(1));
          }
      });
}


for (var item in fileList) {
    fs.readFileSync(path.join(filepath, fileList[item])).toString().split('\n').forEach(function (line) {
        //console.log(line);
        try {
            parser.parse(line);
        }
   
        catch(err) {           
            if (err instanceof parser.SyntaxError) {

                if (line.substring(0, 1) == '#') {
                    actualError = line.substring(1);
                    errorArray[expectedDesc] = actualError;
                    //errorObj.usedError = actualError;
                    //errorObj.push(errorArray);
                    /*errorObj.push({
                        expectedGrammar:expectedDescs,
                        userError:actualError    
                    });*/
                    /* use expectedDescs for in errorObj*/
                    //console.log(errorObj);
                    //console.log(errorArray);
                    //console.log(JSON.stringify(errorObj));
                    //fs.writeFile('../data/prplearn.json', JSON.stringify(errorObj), 'utf-8');
                    //fs.writeFile('tmp.json', JSON.stringify(errorArray), 'utf-8');
                    errorCount = errorCount + 1;
                    return;
                }   
                //tmpLine = err.found;
                var expectedDescs = [];
                var expectedDesc = [];
                for (i = 0; i < err.expected.length; i++) {
                    expectedDescs[i] = err.expected[i].description;
                }
                expectedDesc = err.expected.length > 1 ? expectedDescs.slice(0, -1).join(", ") + " or " + expectedDescs[err.expected.length - 1] : expectedDescs[0];
                //console.log(line);
                //console.log(err.location.start.column);
                //console.log(expectedDescs);
                //expectedArray.push(expectedDescs);
                //console.log(expectedArray);
                //console.log(objIndex);
                var objArray = {};
                objArray.expectedGrammar = expectedDescs;
                objArray.userError = errorList[errorCount]; 
                //console.log(objArray);
                /*if (errorCount < fileList.length - 1) {
                    fs.appendFileSync('../data/prplearn.json', JSON.stringify(objArray)+'\n', 'utf-8');
                } else {
                    fs.appendFileSync('../data/prplearn.json', JSON.stringify(objArray), 'utf-8');
                }*/

                if (errorCount == 0) {
                    //console.log(errorCount);
                    fs.appendFileSync('../data/prplearn.json', '['+JSON.stringify(objArray)+',', 'utf-8');
                } else if (errorCount == fileList.length - 1) {
                    //console.log(errorCount);
                    fs.appendFileSync('../data/prplearn.json', JSON.stringify(objArray)+']', 'utf-8');
                } else {
                    //console.log(errorCount);
                    fs.appendFileSync('../data/prplearn.json', JSON.stringify(objArray)+',', 'utf-8');
                }

                //errorObj[errorCount] = objArray;
                //console.log(errorObj);
                //console.log(errorList[errorCount]);
                //errorObj[objIndex] = expectedDescs;
                //objIndex = objIndex + 1;
                //console.log('Error in input file: ' +line+', message:'+err.message);
              
            }
                          
        }
    
    });

}  







/*
 
fs.readdir(filepath, function(err, items) {
  //console.log(items);
  //console.log(__dirname);
  
  items.forEach(function(item) {
      //console.log(item);
      var rd = readline.createInterface({
      //input: fs.createReadStream(item),
      input: fs.createReadStream(path.join(filepath, item)),
      output: process.stdout,
      terminal: false
    });



    rd.on('line', function(line) {
      //console.log(line);
    
      try{
        parser.parse(line);     
      }

      catch(err){


        if (err instanceof parser.SyntaxError){
          
          //tmpLine = err.message;
          if (line.substring(0, 1) == '#') {
            actualError = line.substring(1);
            errorArray[tmpLine] = actualError;
            errorObj.push(errorArray);
            //console.log(errorArray[tmpLine]);
            console.log(errorArray);
            //console.log(JSON.stringify(errorObj));
            //fs.writeFile('tmp.json', JSON.stringify(errorObj), 'utf-8');
            return;
            //process.exit(0);
          }

          tmpLine = err.message;
          console.log('Error in input file: ' +line+', message:'+err.message);       
        
        }
       
        
      }
    
    });



//  }); //belongs to commented forEach


// });  //belongs to commented fs.readdir


*/
      
































































































