String.prototype.dup = function(count) {
  return new Array(count).join(this);
}

var failCount = 0;
//var parser = require('./check_stuff.js');
var parser = require('./integerparser.js');
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



 rd.on('line', function(line) {
   //lineReader.open('file_ip.txt', function(reader) {
   //if (reader.hasNextLine()) {
   //  reader.nextLine(function(line) {
   try {
      //console.log('Input Parsed: ' + parser.parse(line));
      //** console.log(parser.parse(line));
      parser.parse(line);
      if (parser.SyntaxError) {
         failCount = failCount + 1;
      //* throw "pass";
      }
    }
    
      catch(err) {
    	if (err instanceof parser.SyntaxError) {
         if (line.substring(0, 1) == '#') {
           return;
          // process.exit(0);
         }
         console.log('fail');
         process.exit(0);
    //*  console.log('Error in input file: ' +line);
    //*  console.log(line);
    //*  console.log('-'.dup(err.column) + '^');
    //*  console.log('Line '+err.line+', column '+err.column+': '+err.message);
    //*  console.log(err.stack);
    } else {
      console.log(err);
    }
      ///////////////////console.error(err);
    }
   //}
  //});
 //})

 });

setTimeout(function() {
   console.log('pass');
}, 1000);
