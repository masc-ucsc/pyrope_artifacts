var count = 0;
var path = require('path');
//var output_file_name = process.argv[2].slice(0, -4) + "_to_parse.prp";
var prp0_path = process.env.HOME;
var output_file = path.join(prp0_path, ".prp/parser/prp0_tmp/"+path.basename(process.argv[2]).slice(0,-4)+"_to_parse.prp");
var fs = require('fs');
var file = fs.createWriteStream(output_file);
var content = [];

fs.readFileSync(process.argv[2]).toString().split('\n').forEach(function (line) {
  content.push(line);
});

content.forEach(function (element, index) {
  var pattern = /error/g;
  if (pattern.test(element)) {
    count = index + 1;
    content[index] = "";
    while ((count < content.length) && content[count].charAt(0) == " ") {
      content[count] = "";
      count = count + 1;
    }
  }
}); 

content.forEach(function (element) {
  file.write(element + '\n');
});
