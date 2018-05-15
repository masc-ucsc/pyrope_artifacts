var count = 0;
var outputFile = process.argv[2].slice(0, -4) + "_toParse.prp";
var fs = require('fs');
var file = fs.createWriteStream(outputFile);
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
