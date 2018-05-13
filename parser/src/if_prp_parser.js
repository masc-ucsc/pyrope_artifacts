String.prototype.dup = function(count) {
  return new Array(count).join(this);
};

require('../cgen/cgen_graph.js');
//require('../cfg/test_traversal.js');
var errorArray = {};
var i, j, k, x, y;
var errorLocation;
var expectedDescs = [];
var expectedDesc = [];
var tmp_x;

var prp_path = process.env.PRP_PATH;

var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var filename = process.argv[2];
//var parser = require(path.join(prp_path,'src/tupleParser.js'));
var parser = require(path.join(prp_path,'src/prp_parser.js'));
//var error = process.argv[3];
//var filepath = path.join(__dirname, 'tests');
//var filepath = __dirname;
//var filename;

//var fileList = fs.readdirSync(filepath);
//var fileList = fs.readdirSync('prplearn.json');
//var jsonFile = fs.readFileSync("prplearn.json");
var jsonFile = fs.readFileSync(path.join(prp_path,"data/prplearn.json"));
//var jsonContent = fs.readFileSync("../data/prplearn.json").toString().split('\n');
var jsonContent = JSON.parse(jsonFile);
//console.error(jsonContent);

// file or stdin chose as input
if (process.argv[2] != "--stdin") {
  var data = fs.readFileSync(filename).toString();
  var data_backup = data.split('\n');
}
else {
  var data = fs.readFileSync(process.stdin.fd).toString();
  var data_backup = data.split('\n');
}

/* Profiling
var log = console.log;

console.log = function () {
    var first_parameter = arguments[0];
    var other_parameters = Array.prototype.slice.call(arguments, 1);

    function formatConsoleDate (date) {
        var hour = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var milliseconds = date.getMilliseconds();

        return '[' +
               ((hour < 10) ? '0' + hour: hour) +
               ':' +
               ((minutes < 10) ? '0' + minutes: minutes) +
               ':' +
               ((seconds < 10) ? '0' + seconds: seconds) +
               '.' +
               ('00' + milliseconds).slice(-3) +
               '] ';
    }

    log.apply(console, [formatConsoleDate(new Date()) + first_parameter].concat(other_parameters));
};

console.log("START");
*/

try{
  //lineNumber = lineNumber + 1;
  tmp_x = parser.parse(data);
  cfg_gen_setup(tmp_x); //passing AST to cfg_gen_setup - returns cfg
}


catch(err) {

    if (err instanceof parser.SyntaxError) {
        //console.error(err.expected);
        //console.error(err.message);
        /*for (j = 0; j < err.expected.length; j++) {
            expectedDescs[j] = err.expected[j].description;
        }*/

        var descriptions = [];
        for (i = 0; i < err.expected.length; i++) {
          //expectedDescs[i] = err.expected[i].description;
          if (err.expected[i].type == "other") {
            expectedDescs[i] = err.expected[i].description;
          }
          else if (err.expected[i].type == "literal") {
            expectedDescs[i] = err.expected[i].text;
          }
        }

        expectedDescs.sort();
        if (expectedDescs.length > 0) {
          for (i = 1, j = 1; i < expectedDescs.length; i++) {
            if (expectedDescs[i - 1] !== expectedDescs[i]) {
              expectedDescs[j] = expectedDescs[i];
              j++;
            }
          }
          expectedDescs.length = j;
        }

        expectedDesc = err.expected.length > 1 ? expectedDescs.slice(0, -1).join(", ") + " or " + expectedDescs[err.expected.length - 1] : expectedDescs[0]; 
        //console.error(expectedDescs); 

        /*compare array elements*/

        for (i = 0; i < jsonContent.length; i++) {
            /*var is_same = jsonContent[i].expectedGrammar.length == expectedDescs.length && jsonContent[i].expectedGrammar.every(function (element, index) {
                  return element === expectedDescs[index];
            });*/

            var is_same = jsonContent[i].expectedGrammar.length == expectedDescs.length && (_.difference(jsonContent[i].expectedGrammar, expectedDescs).length == 0)
            //console.error(is_same); 
            //console.error(jsonContent[i].expectedGrammar.length);
            //console.error(expectedDescs.length);
            /*var test = jsonContent[i].expectedGrammar.every(function (element, index) {
                return element === expectedDescs[index];
            });*/
            //console.error(jsonContent[i].expectedGrammar.length == expectedDescs.length);
            //console.error(is_same);
            if (is_same) {
                 //console.error('Line '+err.line+', column '+err.column+': '+err.message);
                 //console.error(jsonContent[i].userError);
                 x = err.location.start.offset;
                 while (x != -1) {
                    if (data[x] == "\n") {
                        //console.error("otha: "+data.substr(x+1, err.location.start.column));
                        errorLocation = x + 1;
                        x = 0;
                    }
                    x = x - 1;
                 } 
                 //console.error('Error in input file: ');
                 console.error(filename.split('/').pop()+':'+err.location.start.line+':'+err.location.start.column+': error: '+jsonContent[i].userError);
                 console.error(data_backup[err.location.start.line-1]);
                 //console.error(data.substr(errorLocation, err.location.end.column));
                 console.error('-'.dup(err.location.start.column) + '^');
                 //console.error('Line '+err.location.start.line+', column '+err.location.start.column+': '+jsonContent[i].userError);
                 process.exit(2);
                 return;
            }
        }
        //console.error('Error in input file: ');
        //console.error(filename.split('/').pop());
        console.error(filename.split('/').pop()+':'+err.location.start.line+':'+err.location.start.column+': error: '+err.message);
        console.error(data_backup[err.location.start.line-1]);
        console.error('-'.dup(err.location.start.column) + '^');
        process.exit(2);
        //console.error('Line '+err.location.start.line+', column '+err.location.start.column+': '+err.message);
        // console.error("ALERT: no user defined error message available for this case");
        return;
    }
}

console.log("END")
