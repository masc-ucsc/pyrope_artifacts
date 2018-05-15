String.prototype.dup = function(count) {
  return new Array(count).join(this);
};

var i, j, k, ii; 
var errorCount = 0;
var errorList = [];
var errorObj = [];
var data = [];
var dataIndex = 0;
var objIndex = 0;
var expectedArray = [];
var parser = require('./prp_parser.js');
var fs = require('fs');
var path = require('path');
//var filename = process.argv[2];
//var error = process.argv[3];
//var filepath = path.join(__dirname, 'tests/');
var filepath = "tmp_test/";
//var filepath = "dummy/";
//var filename;

var fileList = fs.readdirSync(filepath);
//var fileList = fs.readdirSync("../tests/");
//console.log(fileList);

for (var item in fileList) {
    data[dataIndex] = fs.readFileSync(path.join(filepath, fileList[item])).toString();
    dataIndex = dataIndex + 1;
}

for (i = 0; i < data.length; i++) {
  for (j = 0; j < data[i].length; j++) {
    if (data[i][j] == "#") {
      errorList.push(data[i].substr(j+1, data[i].length-1));
    }
  }
}

var jsonFile = fs.readFileSync("data/prplearn.json");
var jsonData = JSON.parse(jsonFile);
//console.log(jsonData);
var jsonLength = jsonData.length;

for (ii = 0; ii < errorList.length; ii++) {
    jsonData.push({
        expectedGrammar: " ",
        userError: " "
    });
}

for (k = 0; k < data.length; k++) {
  try {
    parser.parse(data[k]);
  }
  
  catch(err) {           
    if (err instanceof parser.SyntaxError) {
      //console.log(err.message);
      //console.log(data[k]);
      //console.log(err.describeExpected(err.expected);
      var expectedDescs = [];
      var expectedDesc = [];
      var descriptions = [];
      for (i = 0; i < err.expected.length; i++) {
        //expectedDescs[i] = err.expected[i].description;
        if (err.expected[i].type == "other") {
          descriptions[i] = err.expected[i].description;
        }
        else if (err.expected[i].type == "literal") {
          descriptions[i] = err.expected[i].text;     
        }
      }

      //console.log(descriptions);
      //console.log(err.SyntaxError.buildMessage);
      descriptions.sort();
      //console.log(descriptions);

      if (descriptions.length > 0) {
        for (i = 1, j = 1; i < descriptions.length; i++) {
          if (descriptions[i - 1] !== descriptions[i]) {
            descriptions[j] = descriptions[i];
            j++;
          }
        }
        descriptions.length = j;
      }

      if(descriptions.indexOf(undefined) >= 0){ //remove 'undefined' entry from description array
        descriptions.splice(descriptions.indexOf(undefined), 1);
      }

      //console.log(descriptions);
      //expectedDesc = err.expected.length > 1 ? expectedDescs.slice(0, -1).join(", ") + " or " + expectedDescs[err.expected.length - 1] : expectedDescs[0];
      //console.log(expectedDesc);
      //expectedArray.push(expectedDescs);
      //console.log(expectedArray);
      //console.log(objIndex);
      var objArray = {};
      //objArray.expectedGrammar = expectedDescs;
      objArray.expectedGrammar = descriptions;
      objArray.userError = errorList[errorCount];
      //jsonData[jsonLength].expectedGrammar = expectedDescs;
      jsonData[jsonLength].expectedGrammar = descriptions;
      jsonData[jsonLength].userError = errorList[errorCount];
      //jsonData.push({
          //expectedGrammar: expectedDescs;
          //userError: errorList[errorCount];
      //}); 
      jsonLength = jsonLength + 1;
      //console.log(jsonData);

      /*
      if (errorCount == 0) {
          //console.log(errorCount);
          fs.appendFileSync('data/prplearn.json', '['+JSON.stringify(objArray)+',', 'utf-8');
      } else if (errorCount == errorList.length - 1) {
          //console.log(errorCount);
          fs.appendFileSync('data/prplearn.json', JSON.stringify(objArray)+']', 'utf-8');
      } else {
          //console.log(errorCount);
          fs.appendFileSync('data/prplearn.json', JSON.stringify(objArray)+',', 'utf-8');
      }
      */

      errorCount = errorCount + 1;
 
      //errorObj[errorCount] = objArray;
      //console.log(errorObj);
      //console.log(errorList[errorCount]);
      //errorObj[objIndex] = expectedDescs;
      //objIndex = objIndex + 1;
      //console.log('Error in input file: ' +line+', message:'+err.message);
              
    } 
                        
  }

}

fs.writeFileSync('data/prplearn.json', JSON.stringify(jsonData), 'utf-8');




