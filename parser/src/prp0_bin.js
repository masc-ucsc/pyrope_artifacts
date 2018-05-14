var count = 0;
var actualError;
var outputFile = process.argv[2].slice(0, -4) + "_toParse.prp";

var fs = require('fs');
var path = require('path');
var file = fs.createWriteStream(outputFile);
readline = require('readline');

var content = [];

fs.readFileSync(process.argv[2]).toString().split('\n').forEach(function (line) {
  content.push(line);
});


content.forEach(function (element, index) {
    var pattern = /error/g;
    if (pattern.test(element)) {
        //console.log(element);
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


