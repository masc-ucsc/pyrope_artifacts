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
var _ = require('underscore');
var filepath = path.join(process.env.HOME+"/.prp/parser/prp1_tmp/");
var fileList = fs.readdirSync(filepath);

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

var jsonFile = fs.readFileSync(process.env.HOME+"/.prp/parser/data/prplearn.json");
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

      if(descriptions.indexOf(undefined) >= 0) { //remove 'undefined' entry from description array
        descriptions.splice(descriptions.indexOf(undefined), 1);
      }
      
      //FIXME(conflicting error msg in json file) 
      /*for(x = 0; x < jsonData.length; x++){
        var tmp_arr = jsonData[x].expectedGrammar;
        if(tmp_arr.toString() == descriptions.toString()){
          console.log(errorList[errorCount]+' already exists');
          descriptions = null;
          //jsonData.splice(jsonData.length-1, 1)
        }
        break;
      }*/

      //expectedDesc = err.expected.length > 1 ? expectedDescs.slice(0, -1).join(", ") + " or " + expectedDescs[err.expected.length - 1] : expectedDescs[0];
      if(process.argv[2] != "rm"){
        if(descriptions != null){
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
      }else{  //handles "prplearm rm <filename>"
        jsonData.splice(jsonData.length - 1, 1);
        for(var x = 0; x < jsonData.length; x++){
          var is_same = jsonData[x].expectedGrammar.length == descriptions.length && (_.difference(jsonData[x].expectedGrammar, descriptions).length == 0);
          if(is_same){
            jsonData.splice(x, 1);
          }
        }
      }
    } 
                        
  }

}

fs.writeFileSync(process.env.HOME+"/.prp/parser/data/prplearn.json", JSON.stringify(jsonData), 'utf-8');
