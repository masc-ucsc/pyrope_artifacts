var fs = require('fs');
var path = require('path');

create_directory = function(){
  if(fs.existsSync(process.env.HOME+"/.cache/prp/") == false){
    fs.mkdirSync(process.env.HOME+"/.cache/prp/");
    fs.mkdirSync(process.env.HOME+"/.cache/prp/parser/");
    fs.mkdirSync(process.env.HOME+"/.cache/prp/parser/data");
    fs.mkdirSync(process.env.HOME+"/.cache/prp/parser/prp0_tmp");
    fs.mkdirSync(process.env.HOME+"/.cache/prp/parser/prp1_tmp");
  } 
}

valid_input_file = function(filename){
  var pattern = /[.]prp/g;  
  if(!fs.existsSync(filename) || !pattern.test(path.basename(filename))){
    console.log("Invalid input file for prp");
    console.log("Provide a valid .prp file as input");
    process.exit(0);
  }
}
