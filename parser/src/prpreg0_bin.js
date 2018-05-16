var errorCounter = 0;
var pattern;
var tmpCount, count = 0;
var fname = process.argv[2].split('/').pop();
var parser = require('./prp_parser.js');
var fs = require('fs');
var error = [];
var content = [];
var tmpContent = [];
var tmpIndex, index, errIndex;

fs.readFileSync(process.argv[2]).toString().split('\n').forEach(function (line) {
  content.push(line);
});

fs.readFileSync("data/errorLog").toString().split('\n').forEach(function (line) {
  error.push(line);
});

for (index = 0; index < content.length; index++) {
  for (errIndex = 0; errIndex < error.length; errIndex++) {
    if (content[index] == error[errIndex] && content[index] != "" && errorCounter == errIndex) {
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
      var outputFile = "tmp_test/" + fname.slice(0, -4) + "_error" + errorCounter + ".prp";
      var file = fs.createWriteStream(outputFile);
      file.write(tmpContent.join('\n'));
      tmpContent.pop(); 
      break;
    }

  }

} 

