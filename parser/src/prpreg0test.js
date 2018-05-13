var errorArray = {};
var i;
var pattern;
var count = 0;
var errorCounter = 0;
var actualError;
var fname = process.argv[2].split('/').pop();

var parser = require('./integerparser.js');
var fs = require('fs');
var path = require('path');
readline = require('readline');
var error = [];
var content = [];
var tmpContent = [];
var tmpCount;
var tmpIndex;

fs.readFileSync(process.argv[2]).toString().split('\n').forEach(function (line) {
    content.push(line);
});

fs.readFileSync("../data/errorLog").toString().split('\n').forEach(function (line) {
    error.push(line);
});



content.forEach(function (element, index) {
    error.forEach(function (errElement, errIndex) {

        if (content[index] == error[errIndex] && content[index] != "") {
            //console.log(content[index]);
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
            var outputFile = "../tests/" + fname.slice(0, -4) + "_error" + errorCounter + ".prp";
            var file = fs.createWriteStream(outputFile);
            file.write(tmpContent.join('\n'));
            tmpContent.pop();
        }   

    });

}); 



