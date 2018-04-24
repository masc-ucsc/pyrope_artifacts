String.prototype.dup = function(count) {
  return new Array(count).join(this);
}

var i;
var j;
var k;
var lineNumber = 0;
//var parser = require('./check_stuff.js');
//var parser = require('./integerparser.js');
//var parser = require('./expressionAdvanced.js');
//var parser = require('./constantsAndExpressions.js');
//var parser = require('./ifBlock.js');
var parser = require('./ifPegParser.js');
var fs = require('fs');
 readline = require('readline');

//process.stdin.on('readable', function() {
//  var chunk = process.stdin.read();
//  if (chunk !== null) {
//    var str = (chunk.toString()).replace('\n', '');

var filename = process.argv[2];
//console.log(filename);
 var rd = readline.createInterface({
   input: fs.createReadStream(filename),
   //input: fs.createReadStream('input.txt'),
   output: process.stdout,
   terminal: false
});


//var data = fs.readFileSync(filename).toString().split('\n');
var data = fs.readFileSync(filename).toString();
console.log(data);


/*var lineBreak = (data.match(/\n/g)||[]).length;
console.log(lineBreak);
*/


/*
for (i = 0; i < data[0].length; i++) {
  if (data[0][i] == '\n') {
      console.log("newline");
  }

}
*/

try {
  /*for (i = 0; i < data.length; i++) {
      if (data[i] == '\n') {
          console.log("newline");
      }}*/
      parser.parse(data);
      //lineNumber = lineNumber + 1;
      console.log("NO ERRORS");
}
catch(err){
  if (err instanceof parser.SyntaxError) {
    console.log(err.location);
    console.log(err.message);
    k = err.location.start.offset;
    while (k != -1) {
      if (data[k] == "\n") {
          console.log("otha: "+data.substr(k+1, err.location.start.column));
          k = 0;
      }
      k = k - 1;
    }    
    //for (k = err.location.start.offset - 1; k => 0; k--) {
    //    if (data[k] == "\n") {
    //        console.log("otha: "+data.substr(k+1, err.location.end.offset));
    //    }
    //}
    //console.log(data[err.location.start.offset]);
    //console.log(data.substr(err.location.start.start, err.location.end.column));
    //console.log('Error in input file: ' +line);
    //console.log(line);
    //console.log('-'.dup(err.location.start.column) + '^');
    //console.log('Line '+lineNumber+', column '+err.location.start.column+': '
  }
}


/*

 rd.on('line', function(line) {
   //lineReader.open('file_ip.txt', function(reader) {
   //if (reader.hasNextLine()) {
   //  reader.nextLine(function(line) {
   try {
      //console.log('Input Parsed: ' + parser.parse(line));
      //** console.log(parser.parse(line));
      parser.parse(line);
    } catch(err) {
    	if (err instanceof parser.SyntaxError) {
      console.log('Error in input file: ' +line);
      console.log(line);
      console.log('-'.dup(err.column) + '^');
      console.log('Line '+err.line+', column '+err.column+': '+err.message);
      //console.log(err.stack);
    } else {
       return 0;
      // console.log(e.stack);
      //**console.log(err);
    }
      ///////////////////console.error(err);
    }
   //}
  //});
 //})
 });
*/

