var errorArray = {};
var i;
var errorCounter = 0;
var pattern;
var count = 0;
var actualError;
var fname = process.argv[2].split('/').pop();

var parser = require('./prp_parser.js');
var fs = require('fs');
var path = require('path');
readline = require('readline');
var error = [];
var content = [];
var tmpContent = [];
var tmpCount;
var tmpIndex;
var index;
var errIndex;

fs.readFileSync(process.argv[2]).toString().split('\n').forEach(function (line) {
    content.push(line);
});

fs.readFileSync("data/errorLog").toString().split('\n').forEach(function (line) {
    error.push(line);
});


for (index = 0; index < content.length; index++) {
    for (errIndex = 0; errIndex < error.length; errIndex++) {
        if (content[index] == error[errIndex] && content[index] != "" && errorCounter == errIndex) {
            //console.log(content[index]);
            //console.log(index + ":" + errIndex);
            errorCounter = errorCounter + 1;
            tmpContent = content.slice();
            count = 0;
            tmpContent[index] = "";
            tmpIndex = index;
            while (tmpIndex < tmpContent.length && tmpContent[tmpIndex+1].charAt(0) === " ") {
                tmpContent[tmpIndex+1] = tmpContent[tmpIndex+1].substr(1);
                tmpIndex = tmpIndex + 1;
            }
            while (count < content.length) {
                pattern = /error/g;
                if (pattern.test(content[count]) && count != index) {
                    tmpCount = count + 1;
                    tmpContent[count] = "";
                    while (tmpCount < content.length && content[tmpCount].charAt(0) == " ") {
                        tmpContent[tmpCount] = "";
                        tmpCount = tmpCount + 1;
                    }
                }
                count = count + 1;
            }
            tmpContent.push("#" + content[index]);
            //console.log(tmpContent);
            //var outputFile = "./src/tests/" + fname.slice(0, -4) + "_error" + errorCounter + ".prp";
            var outputFile = "tmp_test/" + fname.slice(0, -4) + "_error" + errorCounter + ".prp";
            var file = fs.createWriteStream(outputFile);
            file.write(tmpContent.join('\n'));
            tmpContent.pop(); 
            break;
        }

    }

} 


