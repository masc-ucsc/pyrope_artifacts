String.prototype.dup = function(count) {
  return new Array(count).join(this);
};

var i, j, k, ii; 
var errorCount = 0;
var errorList = [];
var data = [];
var dataIndex = 0;
var parser = require('./prp_parser.js');
var fs = require('fs');
var path = require('path');
//var filepath = path.join(__dirname, 'tests/');
var filepath = "tmp_test/";
var fileList = fs.readdirSync(filepath);
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

      descriptions.sort();
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

      //expectedDesc = err.expected.length > 1 ? expectedDescs.slice(0, -1).join(", ") + " or " + expectedDescs[err.expected.length - 1] : expectedDescs[0];
      var objArray = {};
      //objArray.expectedGrammar = expectedDescs;
      objArray.expectedGrammar = descriptions;
      objArray.userError = errorList[errorCount];
      //jsonData[jsonLength].expectedGrammar = expectedDescs;
      jsonData[jsonLength].expectedGrammar = descriptions;
      jsonData[jsonLength].userError = errorList[errorCount];
      jsonLength = jsonLength + 1;
      errorCount = errorCount + 1;              
    } 
                        
  }

}

fs.writeFileSync('data/prplearn.json', JSON.stringify(jsonData), 'utf-8');
