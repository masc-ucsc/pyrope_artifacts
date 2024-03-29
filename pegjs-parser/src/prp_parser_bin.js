String.prototype.dup = function(count) {
  return new Array(count).join(this)
}

const cgen = require('../cgen/cgen_graph.js')
const common = require('./common.js')

var i, j, x
var errorLocation
var expectedDescs = []
var expectedDesc = []
var tmp_x
var prp_path = process.env.PRP_PATH
var fs = require('fs')
var path = require('path')
var _ = require('underscore')
var filename = process.argv[2]
var parser = require(path.join(prp_path,'lib/prp_parser.js'));

common.valid_input_file(filename);  //check if input file is valid
common.create_directory(); //create local prp directory if it doesn't exist

if(fs.existsSync(process.env.HOME+"/.cache/prp/parser/data/prplearn.json") == false) {
  fs.writeFileSync(process.env.HOME+"/.cache/prp/parser/data/prplearn.json", "[]");
}
if(fs.existsSync(path.join(prp_path,"data/prplearn.json")) == false) {
  fs.writeFileSync(path.join(prp_path,"data/prplearn.json"), "[]");
}
var json_content_user = JSON.parse(fs.readFileSync(process.env.HOME+"/.cache/prp/parser/data/prplearn.json"));
var json_content_system = JSON.parse(fs.readFileSync(path.join(prp_path,"data/prplearn.json")));

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

try {
  tmp_x = parser.parse(data);
  cgen.cfg_gen_setup(tmp_x); //passing AST to cfg_gen_setup - returns cfg
}


catch(err) {
  if (err instanceof parser.SyntaxError) {
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
    if(expectedDescs.indexOf(undefined) >= 0){ //remove 'undefined' entry from expected array
      expectedDescs.splice(descriptions.indexOf(undefined), 1);
    }

    var start_line = err.location.start.line;
    var start_column = err.location.start.column;

    /*compare array elements in user prplearn*/
    var is_same;

    /* FIXME: error line num to next line if line empty
     * console.log(data_backup);
    console.log(err.location.start.line);
    console.log(err.location.end.line);
    console.log(err.location.start.column);
    console.log(err.location.end.column);
    console.log(err.location.start.offset);
    console.log(err.location.end.offset);
    console.log(data[err.location.start.offset]);
    */


    /*if(data[err.location.start.offset] != data_backup[start_line - 1][err.location.start.column]){
      start_line = start_line - 1;
      start_column = err.location.start.column;
    }*/

    for (i = 0; i < json_content_user.length; i++) {
      is_same = json_content_user[i].expectedGrammar.length == expectedDescs.length && (_.difference(json_content_user[i].expectedGrammar, expectedDescs).length == 0);
      if (is_same) {
        x = err.location.start.offset;
        while (x != -1) {
          if (data[x] == "\n") {
            errorLocation = x + 1;
            x = 0;
          }
          x = x - 1;
        }

        console.error(filename.split('/').pop()+':'+start_line+':'+start_column+': error: '+json_content_user[i].userError.slice(6));
        console.error(data_backup[start_line-1]);
        //console.error(data.substr(errorLocation, err.location.end.column));
        console.error('-'.dup(start_column) + '^');
        //console.error('Line '+err.location.start.line+', column '+err.location.start.column+': '+json_content_user[i].userError);
        process.exit(2);
        //return;
      }
    }

    /*compare array elements in system prplearn*/
    for (var i = 0; i < json_content_system.length; i++) {
      is_same = json_content_system[i].expectedGrammar.length == expectedDescs.length && (_.difference(json_content_system[i].expectedGrammar, expectedDescs).length == 0);
      if (is_same) {
        x = err.location.start.offset;
        while (x != -1) {
          if (data[x] == "\n") {
            errorLocation = x + 1;
            x = 0;
          }
          x = x - 1;
        }

        console.error(filename.split('/').pop()+':'+start_line+':'+start_column+': error: '+json_content_system[i].userError.slice(6));
        console.error(data_backup[start_line-1]);
        console.error('-'.dup(start_column) + '^');
        process.exit(3);
        //return;
      }
    }

    console.error(filename.split('/').pop()+':'+start_line+':'+start_column+': error: '+err.message);
    console.error(data_backup[start_line - 1]);
    console.error('-'.dup(start_column) + '^');
    process.exit(4);
    //return;
  }else {
    console.log(err); //throw "non-pyrope syntax" errors
  }

}

//console.log("END");
