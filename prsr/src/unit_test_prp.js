String.prototype.dup = function(count) {
  return new Array(count).join(this);
}

//var parser = require('./check_stuff.js');
//var parser = require('./integerparser.js');
//var parser = require('./expressionAdvanced.js');
//var parser = require('./constantsAndExpressions.js');
var parser = require('./tupleParser.js');
var fs = require('fs');
readline = require('readline');
var readlineSync = require('readline-sync');

console.log(fs.readSync(stdin.fd));

//process.stdin.on('readable', function() {
//  var chunk = process.stdin.read();
//  if (chunk !== null) {
//    var str = (chunk.toString()).replace('\n', '');

var filename = process.argv[2];
//console.log(filename);
 var rd = readline.createInterface({
   //input: fs.createReadStream(filename),
   //input: fs.createReadStream('input.txt'),
   input: process.stdin,
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


