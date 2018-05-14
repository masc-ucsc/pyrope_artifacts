
var exports = module.exports = {};

exports.prpfmt = function(prp_path, input_file_name, data) {

  var debug = true;

  String.prototype.dup = function(count) {
    return new Array(count).join(this);
  };
  var errorArray = {};
  var i;
  var j;
  var k;
  var x;
  var y;
  var errorLocation;
  var lineNumber = 0;
  var errorCount = 0;
  var tmpLine;
  var actualError;
  var errorObj = [];
  var expectedDescs = [];
  var expectedDesc = [];
  var eol;

  global.fund = [];
  global.fund[1] = 0;
  global.count = 1;
  z = 0;
  tuple_list_count = 0;
  var j = 0;
  fcall_count = 0;
  fcall_arg_count = 0;
  fcall_body_count = 0;
  var fcall_arg = [];
  var fcall_body = [];
  if_count = 0;
  fundec_z = 0;
  var for_z = 0;
  var if_z = 0;
  var while_z = 0;

  var _ = require("underscore");
  readline = require("readline");
  var path = require("path");
  var fs = require("fs");

  var parser = require(path.join(prp_path, "src/prp_parser.js"));
  var jsonFile = fs.readFileSync(path.join(prp_path, "data/prplearn.json"));
  var jsonContent = JSON.parse(jsonFile);

  function add_parenthesis(a) {
    if (a.length<2) {
      return "(" + a + ")";
    }
    if (a[0] == '(' && a[a.length-1] == ')') {
      return a;
    }

    return "(" + a + ")";
  }

  const space_join = (...c) => {

    var tmp = "";
    var lastc = ' ';
    for (var i in c) {
      if (c[i].length == 0) {
        // do not add space to ""
        lastc = " ";
      }else if (c[i][0] == ' ' || lastc == ' ' || lastc == '\n' ) {
        tmp = tmp + c[i];
        lastc = c[i][c[i].length-1];
      }else{
        tmp = tmp + " " + c[i];
        lastc = c[i][c[i].length-1];
      }
    }

    return tmp;
  };

  try {
    //lineNumber = lineNumber + 1;
    input_data = parser.parse(data);
  } catch (err) {
    var data_backup = data.split("\n");

    if (err instanceof parser.SyntaxError) {
      var descriptions = [];
      for (i = 0; i < err.expected.length; i++) {
        //expectedDescs[i] = err.expected[i].description;
        if (err.expected[i].type == "other") {
          expectedDescs[i] = err.expected[i].description;
        } else if (err.expected[i].type == "literal") {
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

      expectedDesc =
        err.expected.length > 1
        ? expectedDescs.slice(0, -1).join(", ") +
        " or " +
        expectedDescs[err.expected.length - 1]
        : expectedDescs[0];
      for (i = 0; i < jsonContent.length; i++) {
        var is_same =
          jsonContent[i].expectedGrammar.length == expectedDescs.length &&
          _.difference(jsonContent[i].expectedGrammar, expectedDescs).length == 0;
        if (is_same) {
          x = err.location.start.offset;
          while (x != -1) {
            if (data[x] == "\n") {
              errorLocation = x + 1;
              x = 0;
            }
            x = x - 1;
          }
          console.error(
            input_file_name.split("/").pop() +
            ":" +
            err.location.start.line +
            ":" +
            err.location.start.column +
            ": error: " +
            jsonContent[i].userError
          );
          console.error(data_backup[err.location.start.line - 1]);
          console.error("-".dup(err.location.start.column) + "^");
          process.exit(2);
          return;
        }
      }
      console.error(
        input_file_name.split("/").pop() +
        ":" +
        err.location.start.line +
        ":" +
        err.location.start.column +
        ": error: " +
        err.message
      );
      console.error(data_backup[err.location.start.line - 1]);
      console.error("-".dup(err.location.start.column) + "^");
      process.exit(2);
      return;
    }
  }

  //main  program
  var line = "";

  for (var i in input_data) {
    elem = input_data[i];
    if (elem.type === undefined) {
      console.err("ERROR: all the json root attributes should have a type field");
      console.err(elem);
      process.exit(3);
    }
    line = line + find_json_function(elem, 0, 0) + "\n";
  }

  return line;

  input_data = JSON.stringify(input_data, null, 3); //converts the object into string with indentation

  block_data = find_block(input_data);
  //for loop to print the blocks
  /*
for (i = 0; i < block_data.length; i++) {
  if (i == 0) {
    console.log("number blocks : " + block_data[0]);
  } else {
    console.log("block " + i + " is : \n" + block_data[i]);
  }
}
*/
  //end of main program
  


  //function to find the blocks
  function find_block(input_data) {
    var subline;
    var bracket_count = [];
    bracket_count[0] = 0; //variable used to count the "{"
    bracket_count[1] = 0; //variable used to count the "}"
    var block = []; //stores the blocks
    block[0] = 0; //gives us the number of blocks in the input code
    var line = [];
    //while loop to find the blocks
    while (input_data.search("{") > -1) {
      bracket_count[0] = 1;
      input_data = input_data.substring(
        input_data.search("{") + 2,
        input_data.length
      );
      while (bracket_count[0] > bracket_count[1]) {
        while (input_data.search("\n") > -1) {
          subline = input_data.substring(0, input_data.search("\n") + 1);
          if (subline.search("{") > -1) {
            bracket_count[0] = bracket_count[0] + 1;
          }
          if (subline.search("}") > -1) {
            bracket_count[1] = bracket_count[1] + 1;
          }
          if (line.length == 0) {
            line = "{\n" + subline;
          } else {
            line = line + subline;
          }
          input_data = input_data.substring(
            input_data.search("\n") + 1,
            input_data.length
          );
          if (bracket_count[0] == bracket_count[1]) {
            block[0] = block[0] + 1;
            block[block[0]] = line;
            bracket_count[0] = 0;
            bracket_count[1] = 0;
            line = [];
            break;
          }
        }
      }
    } // end of while loop for to find blocks
    return block;
  } // end of the function to find blocks

  //function to find_square_blocks
  function find_square_block(input_data) {
    var subline;
    var bracket_count = [];
    bracket_count[0] = 0; //variable used to count the "["
    bracket_count[1] = 0; //variable used to count the "]"
    var block = []; //stores the blocks
    block[0] = 0; //gives us the number of blocks in the input code
    var line = [];
    //while loop to find the blocks
    while (input_data.search("\\[") > -1) {
      bracket_count[0] = 1;
      input_data = input_data.substring(
        input_data.search("\\[") + 2,
        input_data.length
      );
      while (bracket_count[0] > bracket_count[1]) {
        while (input_data.search("\n") > -1) {
          subline = input_data.substring(0, input_data.search("\n") + 1);
          if (subline.search("\\[") > -1) {
            bracket_count[0] = bracket_count[0] + 1;
          }
          if (subline.search("\\]") > -1) {
            bracket_count[1] = bracket_count[1] + 1;
          }
          if (line.length == 0) {
            line = "   [\n" + subline;
          } else {
            line = line + subline;
          }
          input_data = input_data.substring(
            input_data.search("\n") + 1,
            input_data.length
          );
          if (bracket_count[0] == bracket_count[1]) {
            block[0] = block[0] + 1;
            block[block[0]] = line;
            bracket_count[0] = 0;
            bracket_count[1] = 0;
            line = [];
            break;
          }
        }
      }
    } // end of while loop for to find_square_blocks
    return block;
  } // end of the function to find_square_blocks

  function find_json_function(elem, fcall_level, indent_level) {
    if (debug) { console.log(elem); }
    var block_out;
    if (elem.type == "assignment_expression") {
      block_out = assignment_json_operation(elem, fcall_level, indent_level);
    } else if (elem.type == "binary_expression") {
      block_out = binary_json_operation(elem, fcall_level, indent_level);
    } else if (elem.type == "tuple_object") {
      block_out = tuple_object_json_operation(elem, fcall_level, indent_level);
    } else if (elem.type == "tuple_list") {
      block_out = tuple_list_json_operation(elem, fcall_level, indent_level);
    } else if (elem.type == "assertion_statement") {
      block_out = assertion_json_operation(elem, fcall_level, indent_level);
    } else if (elem.type == "range") {
      block_out = range_json_operation(elem, fcall_level, indent_level);
    } else if (elem.type == "integer") {
      block_out = integer_json_operation(elem, fcall_level, indent_level);
    } else if (elem.type == "function_call") {
      block_out = function_call_json_operation(elem, fcall_level, indent_level);
    } else if (elem.type == "function_declaration") {
      block_out = function_declaration_json_operation(elem, fcall_level, indent_level);
    } else if (elem.type == "while_statement") {
      block_out = while_json_operation(elem, fcall_level, indent_level);
    } else if (elem.type == "for_statement") {
      block_out = for_json_operation(elem, fcall_level, indent_level);
    } else if (elem.type == "if_statement") {
      block_out = if_json_operation(elem, fcall_level, indent_level);
    } else if (elem.type == "return_statement") {
      block_out = return_json_operation(elem, fcall_level, indent_level);
    } else if (elem.type == "bit_selection") {
      block_out = bit_selection_json_operation(elem, fcall_level, indent_level);
    } else if (elem.type == "comment") {
      block_out = comment_json_operation(elem, fcall_level, indent_level);
    } else if (elem.type == "identifier") {
      block_out = left_json_operation(elem, fcall_level, indent_level);
    } else if (elem.type == "tuple_array") {
      block_out = tuple_array_json_operation(elem, fcall_level, indent_level);
    } else if (elem.type == "numerical_constant") {
      block_out = numerical_constant_json_operation(elem, fcall_level, indent_level);
    } else if (elem.type === undefined && elem.property && elem.var) {
      block_out = attribute_json_operation(elem, fcall_level, indent_level);
    } else {
      console.log("ERROR: unexpected type=" + elem.type + " fcall_level=" + fcall_level);
      console.log(elem);
      process.exit(-3);
      block_out = elem;
    }
    return block_out;
  } //end of find_function

  //start of find_function
  function find_function(block_input) {
    var block_out;
    var temp_var = [];
    temp_var[0] = 0;
    temp_var[2] = block_input;
    while (block_input.search("\n") > -1) {
      block_line = block_input.substring(0, block_input.search("\n") + 1);
      if (temp_var[0] == 0) {
        temp_var[1] = block_line;
      } else {
        temp_var[1] = temp_var[1] + block_line;
      }
      temp_var[0] = temp_var[0] + 1;
      if (temp_var[0] == 3) {
        break;
      }
      block_input = block_input.substring(
        block_input.search("\n") + 1,
        block_input.length
      );
    } //end of the while loop
    if (temp_var[1].search('"type": "assignment_expression"') > -1) {
      block_out = assignment_operation(temp_var[2]);
    } else if (temp_var[1].search('"type": "binary_expression"') > -1) {
      block_out = binary_operation(temp_var[2]);
    } else if (temp_var[1].search('"type": "tuple_object"') > -1) {
      block_out = tuple_object_operation(temp_var[2]);
    } else if (temp_var[1].search('"type": "tuple_list"') > -1) {
      block_out = tuple_list_operation(temp_var[2]);
    } else if (temp_var[1].search('"type": "assertion_statement"') > -1) {
      block_out = assertion_operation(temp_var[2]);
    } else if (temp_var[1].search('"type": "range"') > -1) {
      block_out = range_operation(temp_var[2]);
    } else if (temp_var[1].search('"type": "function_call"') > -1) {
      block_out = function_call_operation(temp_var[2]);
    } else if (temp_var[1].search('"type": "function_declaration"') > -1) {
      block_out = function_declaration_operation(temp_var[2]);
    } else if (temp_var[1].search('"type": "while_statement"') > -1) {
      block_out = while_operation(temp_var[2]);
    } else if (temp_var[1].search('"type": "for_statement"') > -1) {
      block_out = for_operation(temp_var[2]);
    } else if (temp_var[1].search('"type": "if_statement"') > -1) {
      block_out = if_operation(temp_var[2]);
    } else if (temp_var[1].search('"type": "return_statement"') > -1) {
      block_out = return_operation(temp_var[2]);
    } else if (temp_var[1].search('"type": "bit_selection"') > -1) {
      block_out = bit_selection_operation(temp_var[2]);
    } else if (temp_var[1].search('"type": "comment"') > -1) {
      block_out = comment_operation(temp_var[2]);
    } else if (temp_var[1].search('"type": "identifier"') > -1) {
      block_out = left_operation(temp_var[2]);
    } else if (temp_var[1].search('"type": "tuple_array"') > -1) {
      block_out = tuple_array_operation(temp_var[2]);
    } else if (temp_var[1].search('"type": "numerical_constant"') > -1) {
      block_out = numerical_constant_operation(temp_var[2]);
    } else {
      block_out = temp_var[2];
    }
    return block_out;
  } //end of find_function

  function function_declaration_json_operation(elem, fcall_level, indent_level) {
    var args = "";
    var cond = "";

    if (elem.args) {
      for(var n = 0 ; n<elem.args.arg_list.length ; n++) {
        if (elem.args.arg_list[n]) {
          args = space_join(args, find_json_function(elem.args.arg_list[n], fcall_level, indent_level));
          console.log(args);
        }
      }
      if (elem.args.condition) {
        cond = find_json_function(elem.args.condition, fcall_level, indent_level);
      }
    }

    var blocks = get_code_blocks(elem,fcall_level, indent_level);

    var txt = ":";

    if (args != "") {
      txt =  txt + "(" + args + ")";
    }
    if (cond != "") {
      txt =  space_join(txt , "when", cond);
    }

    return txt + ":" + blocks;
  }

  function while_json_operation(elem, fcall_level, indent_level) {
    var cond = "false";

    if (elem.condition) {
      cond = find_json_function(elem.condition, fcall_level, indent_level);
    }

    var blocks = get_code_blocks(elem,fcall_level, indent_level);

    var txt = "";

    if (cond != "") {
      txt =  space_join(txt , "while", cond);
    }else{
      txt =  space_join(txt , "while", "true");
    }

    return txt + blocks;
  }

  function assignment_json_operation(elem, fcall_level, indent_level) {
    var op  = elem.operator;
    var lhs = find_json_function(elem.left, fcall_level, indent_level);
    var rhs = find_json_function(elem.right, fcall_level, indent_level);

    arr = space_join(lhs, op, rhs);

    return arr;
  }

  function attribute_json_operation(elem, fcall_level, indent_level) {
    var lhs = find_json_function(elem.property, fcall_level, indent_level);
    var rhs = find_json_function(elem.var, fcall_level, indent_level);

    return lhs + ":" + rhs;
  }

  //start of assignment_operation
  function assignment_operation(block_input) {
    var operator_out = [];
    var left_out = [];
    var right_out = [];
    var temp_assignment_assign = [];
    var temp_assignment_assign2 = [];
    var arr;
    var assignment_z = 0;
    while (block_input.search("\n") > -1) {
      block_line = block_input.substring(0, block_input.search("\n") + 1);
      if (block_line.search('"operator"') > -1) {
        if (block_line.search("{") > -1) {
          block_input = block_input.substring(
            block_input.search("{"),
            block_input.length
          );
          temp_assignment_assign = find_block(block_input);
          operator_out = operator_operation(temp_assignment_assign[1]);
          operator_out = operator_out + "=";
          block_input = block_input.substring(
            block_input.search("{") + temp_assignment_assign[1].length + 1,
            block_input.length
          );
          continue;
        } else {
          operator_out = block_line.substring(
            block_line.search(": ") + 3,
            block_line.search('",')
          );
        }
      }
      if (block_line.search('"left"') > -1) {
        block_input = block_input.substring(
          block_input.search("{"),
          block_input.length
        );
        temp_assignment_assign = find_block(block_input);
        left_out = left_operation(temp_assignment_assign[1]);
        block_input = block_input.substring(
          temp_assignment_assign[1].length,
          block_input.length
        );
        continue;
      }
      if (block_line.search('"right"') > -1) {
        block_input = block_input.substring(
          block_input.search("{"),
          block_input.length
        );
        temp_assignment_assign = find_block(block_input);
        right_out = right_operation(temp_assignment_assign[1]);
        block_input = block_input.substring(
          temp_assignment_assign[1].length,
          block_input.length
        );
        continue;
      }
      if (block_line.search('"property": \\[') > -1) {
        temp_assignment_assign = find_square_block(block_input);
        block_input = block_input.substring(
          temp_assignment_assign[1].length + 12,
          block_input.length
        );
        temp_assignment_assign2 = find_block(temp_assignment_assign[1]);
        for (
          assignment_z = 1;
          assignment_z <= temp_assignment_assign2[0];
          assignment_z++
        ) {
          if (assignment_z == 1) {
            right_out = property_var_operation(
              temp_assignment_assign2[assignment_z]
            );
          } else {
            right_out =
              right_out +
              " " +
              property_var_operation(temp_assignment_assign2[assignment_z]);
          }
        }
        continue;
      }
      block_input = block_input.substring(
        block_input.search("\n") + 1,
        block_input.length
      );
    } //end of the while loop
    arr = space_join(left_out, operator_out, right_out);
    return arr;
  } //end of assignment_operation

  //start of operator_operation
  function operator_operation(block_input) {
    var block_out;
    var temp_var = 0;
    while (block_input.search("\n") > -1) {
      block_line = block_input.substring(0, block_input.search("\n") + 1);
      if (block_line.search('"type": "overload_operator"') > -1) {
        temp_var = 1;
      }
      if (block_line.search('"operation"') > -1) {
        block_out = block_line.substring(
          block_line.search(": ") + 3,
          block_line.search('"\n')
        );
      }
      if (temp_var == 1) {
        if (block_line.search('"value"') > -1) {
          block_out =
            ".." +
            block_line.substring(
              block_line.search(": ") + 3,
              block_line.search('"\n')
            ) +
            "..";
          temp_var = 0;
        }
      }

      block_input = block_input.substring(
        block_input.search("\n") + 1,
        block_input.length
      );
    } //end of the while loop
    return block_out;
  } //end of operator_operation

  function left_json_operation(elem) {
    return elem.value
  }

  function integer_json_operation(elem) {
    return elem.value
  }

  //start of left_operation
  function left_operation(block_input) {
    var block_out;
    var temp_var = [];
    temp_var[0] = 0;
    temp_var[1] = 0;
    temp_var[2] = 0;
    temp_var[3] = 0;
    temp_var[4] = 0;
    temp_arr = [
      '"type": "binary_expression"',
      '"type": "tuple_object"',
      '"type": "tuple_list"',
      '"type": "range"',
      '"type": "function_call"',
      '"type": "function_declaration"',
      '"type": "while_statement"',
      '"type": "for_statement"',
      '"type": "if_statement"',
      '"type": "return_statement"',
      '"type": "bit_selection"',
      '"type": "comment"',
      '"type": "tuple_array"',
      '"type": "numerical_constant"'
    ];
    while (block_input.search("\n") > -1) {
      block_line = block_input.substring(0, block_input.search("\n") + 1);
      for (i = 0; i < temp_arr.length; i++) {
        if (block_line.search(temp_arr[i]) > -1) {
          temp_var[1] = 1;
        }
      }
      if (temp_var[1] == 1) {
        block_input = "{\n" + block_input;
        block_out = find_function(block_input);
        temp_var[1] = 0;
        break;
      }
      if (block_line.search('"type": "overload_operator"') > -1) {
        temp_var[2] = 1;
      }
      if (block_line.search('"class": "binary"') > -1) {
        temp_var[3] = 1;
      }
      if (block_line.search('"prefix"') > -1) {
        block_out = block_line.substring(
          block_line.search(": ") + 3,
          block_line.search('",')
        );
        temp_var[0] = 1;
      }
      if (block_line.search('"type": "string_constant"') > -1) {
        temp_var[4] = 1;
      }
      if (block_line.search('"value"') > -1) {
        if (temp_var[0] == 1) {
          block_out =
            block_out +
            block_line.substring(
              block_line.search(": ") + 3,
              block_line.search('"\n')
            );
          temp_var[0] = 0;
        } else if (temp_var[2] == 1) {
          block_out =
            ".." +
            block_line.substring(
              block_line.search(": ") + 3,
              block_line.search('"\n')
            ) +
            "..";
          temp_var[2] = 0;
        } else if (temp_var[3] == 1) {
          block_out =
            "0b" +
            block_line.substring(
              block_line.search(": ") + 3,
              block_line.search('"\n')
            );
          temp_var[3] = 0;
        } else if (temp_var[4] == 1) {
          block_out =
            '"' +
            block_line.substring(
              block_line.search(": ") + 3,
              block_line.search('"\n')
            ) +
            '"';
          temp_var[4] = 0;
        } else {
          block_out = block_line.substring(
            block_line.search(": ") + 3,
            block_line.search('"\n')
          );
        }
      }
      block_input = block_input.substring(
        block_input.search("\n") + 1,
        block_input.length
      );
    } //end of the while loop
    return block_out;
  } //end of left_operation

  //start of right_operation
  function right_operation(block_input) {
    var block_out;
    var temp_var = [];
    temp_var[0] = 0;
    temp_var[1] = 0;
    temp_var[2] = 0;
    temp_var[3] = 0;
    temp_var[4] = 0;
    temp_arr = [
      '"type": "binary_expression"',
      '"type": "tuple_object"',
      '"type": "tuple_list"',
      '"type": "range"',
      '"type": "function_call"',
      '"type": "function_declaration"',
      '"type": "while_statement"',
      '"type": "for_statement"',
      '"type": "if_statement"',
      '"type": "return_statement"',
      '"type": "bit_selection"',
      '"type": "comment"',
      '"type": "tuple_array"',
      '"type": "numerical_constant"'
    ];
    while (block_input.search("\n") > -1) {
      block_line = block_input.substring(0, block_input.search("\n") + 1);
      for (i = 0; i < temp_arr.length; i++) {
        if (block_line.search(temp_arr[i]) > -1) {
          temp_var[1] = 1;
        }
      }
      if (temp_var[1] == 1) {
        block_input = "{\n" + block_input;
        block_out = find_function(block_input);
        temp_var[1] = 0;
        break;
      }
      if (block_line.search('"type": "overload_operator"') > -1) {
        temp_var[2] = 1;
      }
      if (block_line.search('"class": "binary"') > -1) {
        temp_var[3] = 1;
      }
      if (block_line.search('"type": "string_constant"') > -1) {
        temp_var[4] = 1;
      }
      if (block_line.search('"prefix"') > -1) {
        block_out = block_line.substring(
          block_line.search(": ") + 3,
          block_line.search('",')
        );
        temp_var[0] = 1;
      }
      if (block_line.search('"value"') > -1) {
        if (temp_var[0] == 1) {
          block_out =
            block_out +
            block_line.substring(
              block_line.search(": ") + 3,
              block_line.search('"\n')
            );
          temp_var[0] = 0;
        } else if (temp_var[2] == 1) {
          block_out =
            ".." +
            block_line.substring(
              block_line.search(": ") + 3,
              block_line.search('"\n')
            ) +
            "..";
          temp_var[2] = 0;
        } else if (temp_var[3] == 1) {
          block_out =
            "0b" +
            block_line.substring(
              block_line.search(": ") + 3,
              block_line.search('"\n')
            );
          temp_var[3] = 0;
        } else if (temp_var[4] == 1) {
          block_out =
            '"' +
            block_line.substring(
              block_line.search(": ") + 3,
              block_line.search('"\n')
            ) +
            '"';
          temp_var[4] = 0;
        } else {
          block_out = block_line.substring(
            block_line.search(": ") + 3,
            block_line.search('"\n')
          );
        }
      }
      block_input = block_input.substring(
        block_input.search("\n") + 1,
        block_input.length
      );
    } //end of the while loop
    return block_out;
  } //end of right_operation

  function needs_operator(side, op) {
    var op_len = op.length;
    for(var i=0 ; i < side.length ;) {
      if (side[i] == ' ') {
        if (side.substring(i+1,i+1+op_len) != op) {
          return true;
        }
        i = i + 1 + op_len + 1; // +1 for end space in op
      }else{
        i++;
      }
    }

    return false;
  }

  function get_code_blocks(elem, fcall_level, indent_level) {
    indent_level = indent_level + 1;

    var tc = [];
    var tclong = false;
    if (elem.true_case) {
      for (var i = 0; i < elem.true_case.length; i++) {
        var tmp = find_json_function(elem.true_case[i], fcall_level, indent_level);
        if (tmp.search("\n") >= 0) {
          tmp = tmp.replace(/\n/g,"\n  ");
          tclong = true;
        }
        if (tmp.length>0) {
          tc.push(tmp);
        }
      }
      if (tc.length>1) {
        tclong = true;
      }
    }

    var fc = [];
    var fclong = false;
    if (elem.false_case) {
      for (var i = 0; i < elem.false_case.length; i++) {
        var tmp = find_json_function(elem.false_case[i], fcall_level, indent_level);
        if (tmp.search("\n") >= 0) {
          tmp = tmp.replace(/\n/g,"\n  ");
          fclong = true;
        }
        if (tmp != "") {
          fc.push(tmp);
        }
      }
      if (fc.length>1) {
        fclong = true;
      }
    }

    var line = "{";
    if (tc.length == 0) {
      // nothing here
    }else if (tclong || fclong) {
      line = line + "\n";
      for (var i = 0; i < tc.length; i++) {
        line = line + "  " + tc[i] + "\n";
      }
    }else{
      line = space_join(line , tc);
    }
    if (fc.length == 0) {
      line = line + "}";
    }else if (tclong || fclong) {
      line = line + "}else{\n";
      for (var i = 0; i < fc.length; i++) {
        line = line + "  " + fc[i] + "\n";
      }
      line = space_join(line , "}");
    }else{
      line = space_join(line , "}else{" ,fc , "}");
    }

    return line;
  }

  function if_json_operation(elem, fcall_level, indent_level) {

    var cond = find_json_function(elem.condition);
    var blocks = get_code_blocks(elem,fcall_level, indent_level);

    cond = cond.replace(/\n/g,"\n   ");  // FIXME: space with if for multiline comments

    return space_join("if" , cond , blocks);
  }

  function binary_json_operation(elem, fcall_level, indent_level) {
    var op  = "";
    if (elem.operator.type == "arithmetic_operator"
      || elem.operator.type == "logical_operator"
      || elem.operator.type == "shift_operator"
      || elem.operator.type == "tuple_operator"
      || elem.operator.type == "relational_operator") {
      op = elem.operator.operation;
    }else if (elem.operator.type == "overload_operator") {
      op = ".." + elem.operator.value + "..";
    }else{
      console.log("ERROR: unexpected operator type=" + elem.operator.type);
      process.exit(-3);
    }
    var lhs = find_json_function(elem.left, fcall_level, indent_level);
    var rhs = find_json_function(elem.right,fcall_level, indent_level);

    if ( needs_operator(lhs, op)) {
      lhs = add_parenthesis(lhs);
    }
    if ( needs_operator(rhs, op)) {
      rhs = add_parenthesis(rhs);
    }

    arr = space_join(lhs, op, rhs);

    return arr;
  }

  //start of binary_operation
  function binary_operation(block_input) {
    var block_out = [];
    var temp_assign = [];
    var arr;
    binary_operations = ["\\+", "\\-", "\\*", "\\/"];
    while (block_input.search("\n") > -1) {
      block_line = block_input.substring(0, block_input.search("\n") + 1);
      if (block_line.search('"operator"') > -1) {
        if (block_line.search("{") > -1) {
          block_input = block_input.substring(
            block_input.search("{"),
            block_input.length
          );
          temp_assign = find_block(block_input);
          block_out[0] = operator_operation(temp_assign[1]);
          block_input = block_input.substring(
            block_input.search("{") + temp_assign[1].length + 1,
            block_input.length
          );
          continue;
        } else {
          block_out[0] = block_line.substring(
            block_line.search(": ") + 3,
            block_line.search('",')
          );
        }
      }
      if (block_line.search('"left"') > -1) {
        block_input = block_input.substring(
          block_input.search("{"),
          block_input.length
        );
        temp_assign = find_block(block_input);
        block_out[1] = left_operation(temp_assign[1]);
        block_input = block_input.substring(
          block_input.search("{") + temp_assign[1].length + 1,
          block_input.length
        );
        continue;
      }
      if (block_line.search('"right"') > -1) {
        block_input = block_input.substring(
          block_input.search("{"),
          block_input.length
        );
        temp_assign = find_block(block_input);
        block_out[2] = right_operation(temp_assign[1]);
        block_input = block_input.substring(
          block_input.search("{") + temp_assign[1].length,
          block_input.length
        );
        continue;
      }
      block_input = block_input.substring(
        block_input.search("\n") + 1,
        block_input.length
      );
    } //end of the while loop
    if ((block_out[0].search("\\*") > -1) | (block_out[0].search("\\/") > -1)) {
      for (z = 0; z < binary_operations.length; z++) {
        if (block_out[1].search(binary_operations[z]) > -1) {
          block_out[1] = "(" + block_out[1] + ")";
        }
        if (block_out[2].search(binary_operations[z]) > -1) {
          block_out[2] = "(" + block_out[2] + ")";
        }
      }
      arr = block_out[1] + " " + block_out[0] + " " + block_out[2];
      z = 0;
    } else {
      if ((block_out[1].search("\\*") > -1) | (block_out[1].search("\\/") > -1)) {
        block_out[1] = "(" + block_out[1] + ")";
      }
      if ((block_out[2].search("\\*") > -1) | (block_out[2].search("\\/") > -1)) {
        block_out[2] = "(" + block_out[2] + ")";
      }
      arr = block_out[1] + " " + block_out[0] + " " + block_out[2];
    }
    return arr;
  } //end of binary_operation

  //start of tuple_object_operation
  function tuple_object_operation(block_input) {
    var block_out = [];
    var obj_out = [];
    var prop_out = [];
    var temp_tupleobj_assign = [];
    var arr;
    while (block_input.search("\n") > -1) {
      block_line = block_input.substring(0, block_input.search("\n") + 1);
      if (block_line.search('"object"') > -1) {
        block_input = block_input.substring(
          block_input.search("{"),
          block_input.length
        );
        temp_tupleobj_assign = find_block(block_input);
        obj_out = left_operation(temp_tupleobj_assign[1]);
        block_input = block_input.substring(
          block_input.search("{") + temp_tupleobj_assign[1].length + 1,
          block_input.length
        );
        continue;
      }
      if (block_line.search('"property"') > -1) {
        block_input = block_input.substring(
          block_input.search("{"),
          block_input.length
        );
        temp_tupleobj_assign = find_block(block_input);
        prop_out = right_operation(temp_tupleobj_assign[1]);
        block_input = block_input.substring(
          block_input.search("{") + temp_tupleobj_assign[1].length,
          block_input.length
        );
        continue;
      }
      block_input = block_input.substring(
        block_input.search("\n") + 1,
        block_input.length
      );
    } //end of the while loop
    arr = obj_out + "." + prop_out;
    return arr;
  } //end of tuple_object_operation

  //start of tuple_list_operation
  function tuple_list_operation(block_input) {
    tuple_list_count = tuple_list_count + 1;
    fund[count] = j;
    count = count + 1;
    var block_out1 = [];
    var block_out2 = [];
    var temp_tuplelist_assign = [];
    var temp_tuplelist_assign2 = [];
    var arr;
    while (block_input.search("\n") > -1) {
      block_line = block_input.substring(0, block_input.search("\n") + 1);
      if (block_line.search('"elements": null') > -1) {
        arr = "()";
        break;
      } else {
        if (block_line.search('"elements"') > -1) {
          temp_tuplelist_assign2 = find_square_block(block_input);
          temp_tuplelist_assign = find_block(temp_tuplelist_assign2[1]);
          break;
        }
        block_input = block_input.substring(
          block_input.search("\n") + 1,
          block_input.length
        );
      }
    } //end of the while loop

    for (j = 1; j < temp_tuplelist_assign.length; j++) {
      if (temp_tuplelist_assign[j].search('"type": "range"') > -1) {
        block_out1[tuple_list_count] = range_operation(temp_tuplelist_assign[j]);
        arr = block_out1[tuple_list_count];
      } else {
        if (temp_tuplelist_assign[j].search('"type": "tuple_list"') > -1) {
          block_out1[tuple_list_count] = tuple_list_operation(
            temp_tuplelist_assign[j]
          );
          if (j == 0) {
            j = fund[count - 1];
            count = count - 1;
          }
        } else {
          block_out1[tuple_list_count] = left_operation(temp_tuplelist_assign[j]);
        }
        if (j == 1) {
          block_out2[tuple_list_count] = block_out1[tuple_list_count];
        } else {
          block_out2[tuple_list_count] =
            block_out2[tuple_list_count] + " " + block_out1[tuple_list_count];
        }
        arr = "(" + block_out2[tuple_list_count] + ")";
      }
    }
    j = 0;
    tuple_list_count = tuple_list_count - 1;
    return arr;
  } //end of tuple_list_operation

  //start of assertion_operation
  function assertion_operation(block_input) {
    var assertion_out = "";
    var temp_assert_assign = [];
    var arr;
    while (block_input.search("\n") > -1) {
      block_line = block_input.substring(0, block_input.search("\n") + 1);
      if (block_line.search('"condition"') > -1) {
        if (block_line.search("{") > -1) {
          block_input = block_input.substring(
            block_input.search("{"),
            block_input.length
          );
          temp_assert_assign = find_block(block_input);
          assertion_out = find_function(temp_assert_assign[1]);
          block_input = block_input.substring(
            block_input.search("{") + temp_assert_assign[1].length + 1,
            block_input.length
          );
          break;
        }
      }
      block_input = block_input.substring(
        block_input.search("\n") + 1,
        block_input.length
      );
    } //end of the while loop
    arr = "I " + assertion_out;
    return arr;
  } //end of assertion_operation

  //start of range_operation
  function range_operation(block_input) {
    var upper_bound_out = "";
    var lower_bound_out = "";
    var skip_by_out = "";
    var temp_range_var = 0;
    var arr;
    while (block_input.search("\n") > -1) {
      block_line = block_input.substring(0, block_input.search("\n") + 1);
      if (block_line.search('"upper_bound":') > -1) {
        if (block_line.search('"upper_bound": null') > -1) {
          block_input = block_input.substring(
            block_input.search("\n") + 1,
            block_input.length
          );
          continue;
        }
        block_input = block_input.substring(
          block_input.search("{"),
          block_input.length
        );
        temp_assign = find_block(block_input);
        upper_bound_out = left_operation(temp_assign[1]);
        block_input = block_input.substring(
          block_input.search("{") + temp_assign[1].length + 1,
          block_input.length
        );
        continue;
      }
      if (block_line.search('"lower_bound":') > -1) {
        if (block_line.search('"lower_bound": null') > -1) {
          block_input = block_input.substring(
            block_input.search("\n") + 1,
            block_input.length
          );
          continue;
        }
        block_input = block_input.substring(
          block_input.search("{"),
          block_input.length
        );
        temp_assign = find_block(block_input);
        lower_bound_out = right_operation(temp_assign[1]);
        block_input = block_input.substring(
          block_input.search("{") + temp_assign[1].length,
          block_input.length
        );
        continue;
      }
      if (block_line.search('"skip_by":') > -1) {
        temp_range_var = 1;
        block_input = block_input.substring(
          block_input.search("{"),
          block_input.length
        );
        temp_assign = find_block(block_input);
        skip_by_out = right_operation(temp_assign[1]);
        block_input = block_input.substring(
          block_input.search("{") + temp_assign[1].length,
          block_input.length
        );
        continue;
      }
      block_input = block_input.substring(
        block_input.search("\n") + 1,
        block_input.length
      );
    } //end of the while loop
    if (temp_range_var == 1) {
      arr =
        "(" +
        upper_bound_out +
        ".." +
        lower_bound_out +
        " by " +
        skip_by_out +
        ")";
      temp_range_var = 0;
    } else {
      arr = "(" + upper_bound_out + ".." + lower_bound_out + ")";
    }
    return arr;
  } //end of range_operation

  function assertion_json_operation(elem, fcall_level, indent_level) {
    var cond = find_json_function(elem.condition, fcall_level, indent_level);

    return space_join("I", cond);
  }

  function range_json_operation(elem, fcall_level, indent_level) {

    var lhs = "";
    if (elem.lower_bound) {
      lhs = find_json_function(elem.lower_bound, fcall_level, indent_level);
    }
    var rhs = "";
    if (elem.upper_bound) {
      rhs = find_json_function(elem.upper_bound, fcall_level, indent_level);
    }

    return lhs + ".." + rhs;
  }

  function function_call_json_operation(elem, fcall_level, indent_level) {
    var name = find_json_function(elem.function, fcall_level, indent_level);

    var args = [];
    var all_simple = true;
    if (fcall_level>0) {
      all_simple = false
    }
    for(var n = 0 ; n<elem.arguments.length ; n++) {
      if (elem.arguments[n]) {
        args.push(find_json_function(elem.arguments[n], fcall_level + 1, indent_level));
        if (all_simple) {
          if (elem.arguments[n].type != "identifier"
            && elem.arguments[n].type != "integer"
            && elem.arguments[n].type != "function_call") {
            all_simple = false;
          }
        }
      }
    }

    // FIXME: HERE Convert this to function and share it with while_json
    var body = null
    if (elem.body) {
      body = find_json_function(elem.body, fcall_level + 1, indent_level);
    }
    var lineargs;
    if (args.length>0) {
      lineargs = args[0];
    }else{
      lineargs = "";
    }
    for(var i = 1 ; i<args.length ; i++) {
      if (all_simple) {
        lineargs = space_join(lineargs, args[i]);
      }else{
        lineargs = space_join(lineargs, ",", args[i]);
      }
    }

    var block_output;
    if (all_simple) {
      if (body) {
        block_output = space_join(name, lineargs, body);
      }else{
        block_output = space_join(name, lineargs);
      }
    }else{
      if (body) {
        block_output = name + ".(" + lineargs + ") " + body;
      }else{
        block_output = name + ".(" + lineargs + ")";
      }
    }

    return block_output;
  }

  //start of function_call_operation
  function function_call_operation(block_input) {
    fcall_count = fcall_count + 1;
    fcall_arg[fcall_arg_count] = z;
    fcall_body[fcall_body_count] = j;
    fcall_arg_count = fcall_arg_count + 1;
    fcall_body_count = fcall_body_count + 1;
    var block_out;
    var fun_fcall_out = [];
    var arg_fcall_out = [];
    var body_fcall_out = [];
    var temp_var = 0;
    var temp_var2 = 0;
    var temp_assign = [];
    var temp_assign2 = [];
    while (block_input.search("\n") > -1) {
      block_line = block_input.substring(0, block_input.search("\n") + 1);
      if (block_line.search('"function":') > -1) {
        block_input = block_input.substring(
          block_input.search("{"),
          block_input.length
        );
        temp_assign = find_block(block_input);
        fun_fcall_out[fcall_count] = left_operation(temp_assign[1]);
        block_input = block_input.substring(
          block_input.search("{") + temp_assign[1].length + 1,
          block_input.length
        );
        continue;
      }
      if (block_line.search('"arguments":') > -1) {
        //block_input=block_input.substring(block_input.search('\n')+1,block_input.length);
        temp_assign3 = find_square_block(block_input);
        block_input = block_input.substring(
          temp_assign3[1].length,
          block_input.length
        );
        temp_assign = find_block(temp_assign3[1]);
        for (z = 1; z <= temp_assign[0]; z++) {
          if (
            (temp_assign[z].search('"property"') > -1) &
            (temp_assign[z].search('"var"') > -1)
          ) {
            //temp_assign[z] = temp_assign[z].substring(temp_assign[z].search('"property"'), temp_assign[z].length);
            arg_fcall_out[fcall_count] = property_var_operation(temp_assign[z]);
            if (z == 1) {
              fun_fcall_out[fcall_count] =
                fun_fcall_out[fcall_count] + ".(" + arg_fcall_out[fcall_count];
            } else {
              fun_fcall_out[fcall_count] =
                fun_fcall_out[fcall_count] + " " + arg_fcall_out[fcall_count];
            }
            if (z == temp_assign[0]) {
              fun_fcall_out[fcall_count] = fun_fcall_out[fcall_count] + ")";
            }
          } else {
            arg_fcall_out[fcall_count] = left_operation(temp_assign[z]);
            if (z == 0) {
              fcall_arg_count = fcall_arg_count - 1;
              z = fcall_arg[fcall_arg_count];
            }
            if (z == 1) {
              fun_fcall_out[fcall_count] =
                fun_fcall_out[fcall_count] + " " + arg_fcall_out[fcall_count]; //'.('
            } else {
              fun_fcall_out[fcall_count] =
                fun_fcall_out[fcall_count] + " " + arg_fcall_out[fcall_count];
            }
            //  if (z == temp_assign[0]) {
            //    fun_fcall_out[fcall_count] = fun_fcall_out[fcall_count] + ')';
            //}
          }
        }
        z = 0;

        continue;
      }
      if (block_line.search('"body": null') > -1) {
      } else if (block_line.search('"body": ') > -1) {
        temp_var2 = 1;
        block_input = block_input.substring(
          block_line.search('"body:"') + 5,
          block_input.length
        );
        if (block_line.search('"body": \\[') > -1) {
          temp_arg2 = find_square_block(block_input);
        } else {
          temp_arg2 = find_block(block_input);
        }
        temp_assign2 = find_block(temp_arg2[1]);
        for (j = 1; j <= temp_assign2[0]; j++) {
          temp_var = find_function(temp_assign2[j]);
          if (j == 0) {
            fcall_body_count = fcall_body_count - 1;
            j = fcall_body[fcall_body_count];
          }
          if (j == 1) {
            body_fcall_out[fcall_count] = temp_var;
          } else {
            arg_fcall_out[fcall_count] =
              arg_fcall_out[fcall_count] + "\n" + temp_var;
          }
        }
        j = 0;
        block_input = block_input.substring(
          temp_arg2[1].length,
          block_input.length
        );
        continue;
      }
      block_input = block_input.substring(
        block_input.search("\n") + 1,
        block_input.length
      );
    } //end of the while loop
    if (temp_var2 == 1) {
      block_out = fun_fcall_out[fcall_count] + " " + body_fcall_out[fcall_count];
      temp_var2 = 0;
    } else {
      block_out = fun_fcall_out[fcall_count];
    }
    fcall_count = fcall_count - 1;
    return block_out;
  } //end of function_call_operation

  //start of function_declaration_operation
  function function_declaration_operation(block_input) {
    fund[count] = fundec_z;
    count = count + 1;
    var block_out = [];
    var arg_fundec_out = [];
    var body_fundec_out = [];
    var temp_fundec_var = 0;
    var temp_fundec_var2 = 0;
    var temp_fundec_var3 = 0;
    var temp_fundec_arg;
    var temp_fundec_arg2;
    var temp_fundec_assign = [];
    var temp_fundec_assign2 = [];
    while (block_input.search("\n") > -1) {
      block_line = block_input.substring(0, block_input.search("\n") + 1);
      if (block_line.search('"args": null') > -1) {
        temp_fundec_var2 = 1;
      }
      if (block_line.search('"arg_list":') > -1) {
        temp_fundec_arg = block_input.substring(
          block_input.search('"arg_list"'),
          block_input.search("]")
        );
        temp_fundec_assign = find_block(temp_fundec_arg);
        for (q = 1; q <= temp_fundec_assign[0]; q++) {
          temp_fundec_var = left_operation(temp_fundec_assign[q]);
          if (q == 1) {
            arg_fundec_out = temp_fundec_var;
          } else {
            arg_fundec_out = arg_fundec_out + " " + temp_fundec_var;
          }
          if (q == temp_fundec_assign[0]) {
            arg_fundec_out = "(" + arg_fundec_out + ")";
          }
        }
        block_input = block_input.substring(
          temp_fundec_arg.length,
          block_input.length
        );
        continue;
      }
      if (
        (block_line.search('"body": null') > -1) |
        (block_line.search('"body": \\[\\]') > -1)
      ) {
        temp_fundec_var3 = 1;
      } else if (block_line.search('"body": ') > -1) {
        block_input = block_input.substring(
          block_line.search('"body:"') + 5,
          block_input.length
        );
        if (block_line.search('"body": \\[') > -1) {
          temp_fundec_arg2 = find_square_block(block_input);
          temp_fundec_assign2 = find_block(temp_fundec_arg2[1]);
          for (fundec_z = 1; fundec_z <= temp_fundec_assign2[0]; fundec_z++) {
            temp_fundec_var = find_function(temp_fundec_assign2[fundec_z]);
            if (fundec_z == 0) {
              fundec_z = fund[count - 1];
              count = count - 1;
            }
            if (fundec_z == 1) {
              body_fundec_out = temp_fundec_var;
            } else {
              body_fundec_out = body_fundec_out + "\n" + temp_fundec_var;
              if (fundec_z == temp_fundec_assign2[0]) {
                body_fundec_out = indent_operation(body_fundec_out);
                body_fundec_out = "\n" + body_fundec_out + "\n";
              }
            }
          }
          block_input = block_input.substring(
            temp_fundec_arg2[1].length,
            block_input.length
          );
          continue;
        } else {
          temp_fundec_var2 = find_function(block_input);
          body_fundec_out = temp_fundec_var2;
          //block_input=block_input.substring(temp_assign2.length,block_input.length);
          break;
        }
      }
      block_input = block_input.substring(
        block_input.search("\n") + 1,
        block_input.length
      );
    } //end of the while loop
    if ((temp_fundec_var2 == 1) & (temp_fundec_var3 == 0)) {
      block_out = " ::" + "{" + body_fundec_out + "}";
      temp_fundec_var2 = 0;
    } else if ((temp_fundec_var2 == 0) & (temp_fundec_var3 == 1)) {
      block_out = " :" + arg_fundec_out + ":" + "{}";
      temp_fundec_var3 = 0;
    } else if ((temp_fundec_var2 == 1) & (temp_fundec_var3 == 1)) {
      block_out = " ::" + "{}";
      temp_fundec_var2 = 0;
      temp_fundec_var3 = 0;
    } else {
      block_out = " :" + arg_fundec_out + ":" + "{" + body_fundec_out + "}";
    }
    fundec_z = 0;
    return block_out;
  } //end of function_declaration_operation

  //start of while_operation
  function while_operation(block_input) {
    fund[count] = while_z;
    count = count + 1;
    var cond_when_out = [];
    var body_when_out = [];
    var temp_while_var = 0;
    var temp_while_var2 = 0;
    var temp_while_var3 = 0;
    var temp_while_arg;
    var temp_while_arg2;
    var temp_while_assign = [];
    var temp_while_assign2 = [];
    while (block_input.search("\n") > -1) {
      block_line = block_input.substring(0, block_input.search("\n") + 1);
      if (block_line.search('"condition":') > -1) {
        temp_while_arg = block_input.substring(
          block_line.search('"condition":') + 12,
          block_input.length
        );
        temp_while_assign = find_block(temp_while_arg);
        if (temp_while_assign[1].search('"value": "true"') > -1) {
          cond_when_out = "true";
        } else {
          cond_when_out = find_function(temp_while_assign[1]);
        }
        block_input = block_input.substring(
          temp_while_assign[1].length + 12,
          block_input.length
        );
        continue;
      }
      if (block_line.search('"body": null') > -1) {
        temp_while_var3 = 1;
      } else if (block_line.search('"body": ') > -1) {
        block_input = block_input.substring(
          block_line.search('"body:"') + 5,
          block_input.length
        );
        temp_while_arg2 = find_square_block(block_input);
        block_input = block_input.substring(
          temp_while_arg2[1].length,
          block_input.length
        );

        temp_while_assign2 = find_block(temp_while_arg2[1]);
        for (while_z = 1; while_z <= temp_while_assign2[0]; while_z++) {
          if (while_z == 0) {
            while_z = fund;
          }
          temp_while_var = find_function(temp_while_assign2[while_z]);
          if (while_z == 0) {
            while_z = fund[count - 1];
            count = count - 1;
          }
          if (while_z == 1) {
            body_when_out = temp_while_var;
          } else {
            body_when_out = body_when_out + "\n" + temp_while_var;
          }
          if (while_z == temp_while_assign2[0]) {
            body_when_out = indent_operation(body_when_out);
            if (temp_while_assign2[0] == 1) {
            } else {
              body_when_out = "\n" + body_when_out + "\n";
            }
          }
        }

        continue;
      }
      block_input = block_input.substring(
        block_input.search("\n") + 1,
        block_input.length
      );
    } //end of the while loop
    if (temp_while_var3 == 1) {
      block_out = "while " + cond_when_out + " {}";
      temp_while_var3 = 0;
    } else {
      block_out = "while " + cond_when_out + " {" + body_when_out + "}";
    }
    while_z = 0;
    return block_out;
  } //end of while_operation

  //start of for_operation
  function for_operation(block_input) {
    fund[count] = for_z;
    count = count + 1;
    var block_out = [];
    var index_for_out = [];
    var index_for_out2 = [];
    var scope_for_out = [];
    var body_for_out = [];
    var temp_for_var = 0;
    var temp_for_var2 = 0;
    var temp_for_var3 = 0;
    var temp_for_var4 = 0;
    var temp_for_arg;
    var temp_for_arg2;
    var temp_for_assign = [];
    var temp_for_assign2 = [];
    while (block_input.search("\n") > -1) {
      block_line = block_input.substring(0, block_input.search("\n") + 1);
      if (block_line.search('"index":') > -1) {
        temp_for_arg = find_square_block(block_input);
        block_input = block_input.substring(
          temp_for_arg[1].length,
          block_input.length
        );
        temp_for_assign = find_block(temp_for_arg[1]);
        for (r = 1; r <= temp_for_assign[0]; r++) {
          if (r == 1) {
            index_for_out = property_var_operation(temp_for_assign[r]);
          } else {
            index_for_out2 = property_var_operation(temp_for_assign[r]);
            index_for_out = index_for_out + " " + index_for_out2;
          }
        }
        continue;
      }
      if (block_line.search('"scope":') > -1) {
        if (block_line.search("null") > -1) {
        } else {
          scope_for_out = block_line.substring(
            block_line.search('"scope":') + 10,
            block_line.search('",')
          );
          temp_for_var4 = 1;
        }
      }
      if (block_line.search('"body": null') > -1) {
        temp_for_var3 = 1;
      } else if (block_line.search('"body": ') > -1) {
        block_input = block_input.substring(
          block_line.search('"body:"') + 5,
          block_input.length
        );
        temp_for_arg2 = find_square_block(block_input);
        block_input = block_input.substring(
          temp_for_arg2[1].length,
          block_input.length
        );
        temp_for_assign2 = find_block(temp_for_arg2[1]);
        for (for_z = 1; for_z <= temp_for_assign2[0]; for_z++) {
          if (for_z == 0) {
            for_z = fund;
          }
          temp_for_var = find_function(temp_for_assign2[for_z]);
          if (for_z == 0) {
            for_z = fund[count - 1];
            count = count - 1;
          }
          if (for_z == 1) {
            body_for_out = temp_for_var;
          } else {
            body_for_out = body_for_out + "\n" + temp_for_var;
          }
          if (for_z == temp_for_assign2[0]) {
            body_for_out = indent_operation(body_for_out);
            if (temp_for_assign2[0] == 1) {
              if (body_for_out.search("\n") > -1) {
                body_for_out = "\n" + body_for_out + "\n";
              }
            } else {
              body_for_out = "\n" + body_for_out + "\n";
            }
          }
        }
        continue;
      }
      block_input = block_input.substring(
        block_input.search("\n") + 1,
        block_input.length
      );
    } //end of the while loop
    if (temp_for_var4 == 1) {
      if (temp_for_var3 == 1) {
        block_out = "for " + index_for_out + " " + scope_for_out + "{}";
        temp_for_var3 = 0;
      } else {
        block_out =
          "for " + index_for_out + " " + scope_for_out + "{" + body_for_out + "}";
      }
      temp_for_var4 = 0;
    } else {
      if (temp_for_var3 == 1) {
        block_out = "for " + index_for_out + " {}";
        temp_for_var3 = 0;
      } else {
        block_out = "for " + index_for_out + " {" + body_for_out + "}";
      }
    }
    for_z = 0;
    return block_out;
  } //end of for_operation

  //start of property_var_operation
  function property_var_operation(block_input) {
    var block_out = [];
    var temp_var = 0;
    var temp_assign = [];
    var temp_assign2 = [];
    while (block_input.search("\n") > -1) {
      block_line = block_input.substring(0, block_input.search("\n") + 1);
      if (block_line.search('"property":') > -1) {
        temp_assign = find_block(block_input);
        block_out[1] = left_operation(temp_assign[1]);
        block_out[2] = left_operation(temp_assign[2]);
      }
      block_input = block_input.substring(
        block_input.search("\n") + 1,
        block_input.length
      );
    } //end of the while loop
    block_out = block_out[1] + ":" + block_out[2];
    return block_out;
  } //end of property_var_operation

  //start of return_operation
  function return_operation(block_input) {
    var block_out = [];
    var temp_var = 0;
    var temp_assign = [];
    var temp_assign2 = [];
    while (block_input.search("\n") > -1) {
      block_line = block_input.substring(0, block_input.search("\n") + 1);
      if (block_line.search('"argument":') > -1) {
        temp_assign = find_block(block_input);
        block_out[1] = left_operation(temp_assign[1]);
      }
      block_input = block_input.substring(
        block_input.search("\n") + 1,
        block_input.length
      );
    } //end of the while loop
    block_out = "return " + block_out[1];
    return block_out;
  } //end of return_operation

  //start of if_operation
  function if_operation(input) {
    var block_input = [];
    if_count = if_count + 1;
    block_input[if_count] = input;
    fund[count] = if_z;
    count = count + 1;
    var condition_if_out = [];
    var scope_if_out = [];
    var true_if_out = [];
    var false_if_out = [];
    var temp_if_var = 0;
    var temp_if_var2 = 0;
    var temp_if_var3 = 0;
    var temp_if_var4 = 0;
    var temp_if_var5 = 0;
    var temp_if_arg;
    var temp_if_arg2;
    var temp_if_assign = [];
    var temp_if_assign2 = [];
    while (block_input[if_count].search("\n") > -1) {
      block_line = block_input[if_count].substring(
        0,
        block_input[if_count].search("\n") + 1
      );
      if (block_line.search('"condition":') > -1) {
        temp_if_arg = block_input[if_count].substring(
          block_line.search('"condition":') + 12,
          block_input[if_count].length
        );
        temp_if_assign = find_block(temp_if_arg);
        if (temp_if_assign[1].search('"value": "true"') > -1) {
          condition_if_out[if_count] = "true";
        } else {
          condition_if_out[if_count] = find_function(temp_if_assign[1]);
        }
        block_input[if_count] = block_input[if_count].substring(
          temp_if_assign[1].length + 12,
          block_input[if_count].length
        );
        continue;
      }
      if (block_line.search('"scope":') > -1) {
        if (block_line.search("null") > -1) {
        } else {
          scope_if_out[if_count] = block_line.substring(
            block_line.search('"scope":') + 10,
            block_line.search('",')
          );
          temp_if_var4 = 1;
        }
      }
      if (block_line.search('"true_case": null') > -1) {
        temp_if_var2 = 1;
      } else if (block_line.search('"true_case": ') > -1) {
        block_input[if_count] = block_input[if_count].substring(
          block_line.search('"true_case":"') + 11,
          block_input[if_count].length
        );
        temp_if_arg2 = find_square_block(block_input[if_count]);
        if (temp_if_arg2[1].search("\\[\\]") > -1) {
          temp_if_var2 = 1;
        } else {
          temp_if_assign2 = find_block(temp_if_arg2[1]);
          for (if_z = 1; if_z <= temp_if_assign2[0]; if_z++) {
            if (if_z == 0) {
              if_z = fund;
            }
            temp_if_var = find_function(temp_if_assign2[if_z]);
            if (if_z == 0) {
              if_z = fund[count - 1];
              count = count - 1;
            }

            if (if_z == 1) {
              true_if_out[if_count] = temp_if_var;
              if (temp_if_assign2[0] == 1) {
                true_if_out[if_count] = indent_operation(true_if_out[if_count]);
                if (true_if_out[if_count].search("\n") > -1) {
                  true_if_out[if_count] = "\n" + true_if_out[if_count] + "\n";
                }
              }
            } else {
              true_if_out[if_count] = true_if_out[if_count] + "\n" + temp_if_var;
              if (if_z == temp_if_assign2[0]) {
                true_if_out[if_count] = indent_operation(true_if_out[if_count]);
                if (temp_if_assign2[0] == 1) {
                } else {
                  true_if_out[if_count] = "\n" + true_if_out[if_count] + "\n";
                }
              }
            }
          }
          block_input[if_count] = block_input[if_count].substring(
            temp_if_arg2[1].length,
            block_input[if_count].length
          );
          continue;
        }
      }
      if (block_line.search('"false_case": null') > -1) {
        temp_if_var3 = 1;
      } else if (block_line.search('"false_case": ') > -1) {
        if (block_line.search('"false_case": {') > -1) {
          temp_if_var5 = 1;
        }
        block_input[if_count] = block_input[if_count].substring(
          block_line.search('"false_case":"') + 11,
          block_input[if_count].length
        );
        if (temp_if_var5 == 1) {
          temp_if_assign2 = find_block(block_input[if_count]);
        } else {
          temp_if_arg2 = find_square_block(block_input[if_count]);
          temp_if_assign2 = find_block(temp_if_arg2[1]);
        }
        for (if_z = 1; if_z <= temp_if_assign2[0]; if_z++) {
          if (if_z == 0) {
            if_z = fund;
          }
          temp_if_var = find_function(temp_if_assign2[if_z]);
          if (if_z == 0) {
            if_z = fund[count - 1];
            count = count - 1;
          }
          if (if_z == 1) {
            false_if_out[if_count] = temp_if_var;
            if (temp_if_assign2[0] == 1) {
              if (temp_if_var5 == 1) {
                false_if_out[if_count] = "el" + false_if_out[if_count];
              } else {
                false_if_out[if_count] = indent_operation(false_if_out[if_count]);
                false_if_out[if_count] = space_join("else{", false_if_out[if_count], "}");
              }
            }
          } else {
            false_if_out[if_count] = false_if_out[if_count] + "\n" + temp_if_var;
            if (if_z == temp_if_assign2[0]) {
              false_if_out[if_count] = indent_operation(false_if_out[if_count]);
              false_if_out[if_count] = "else{\n" + false_if_out[if_count] + "\n}";
            }
          }
        }
        if (temp_if_var5 == 1) {
          temp_if_var5 = 0;
          block_input[if_count] = block_input[if_count].substring(
            temp_if_assign2[1].length,
            block_input[if_count].length
          );
        } else {
          block_input[if_count] = block_input[if_count].substring(
            temp_if_arg2[1].length,
            block_input[if_count].length
          );
        }
        continue;
      }
      block_input[if_count] = block_input[if_count].substring(
        block_input[if_count].search("\n") + 1,
        block_input[if_count].length
      );
    } //end of the while loop
    if (temp_if_var4 == 1) {
      if ((temp_if_var2 == 1) & (temp_if_var3 == 1)) {
        block_out =
          "if " +
          condition_if_out[if_count] +
          " " +
          scope_if_out[if_count] +
          " {}";
        temp_if_var2 = 0;
        temp_if_var3 = 0;
      } else if ((temp_if_var2 == 0) & (temp_if_var3 == 1)) {
        block_out =
          "if " +
          condition_if_out[if_count] +
          " " +
          scope_if_out[if_count] +
          "{" +
          true_if_out[if_count] +
          "}";
        temp_if_var3 = 0;
      } else if ((temp_if_var2 == 1) & (temp_if_var3 == 0)) {
        block_out =
          "if " +
          condition_if_out[if_count] +
          " " +
          scope_if_out[if_count] +
          "{}" +
          false_if_out[if_count];
        temp_if_var2 = 0;
      } else {
        block_out =
          "if " +
          condition_if_out[if_count] +
          " " +
          scope_if_out[if_count] +
          "{" +
          true_if_out[if_count] +
          "}" +
          false_if_out[if_count];
      }
      temp_if_var4 = 0;
    } else {
      if ((temp_if_var2 == 1) & (temp_if_var3 == 1)) {
        block_out = "if " + condition_if_out[if_count] + " {}";
        temp_if_var2 = 0;
        temp_if_var3 = 0;
      } else if ((temp_if_var2 == 0) & (temp_if_var3 == 1)) {
        block_out =
          "if " + condition_if_out[if_count] + " {" + true_if_out[if_count] + "}";
        temp_if_var3 = 0;
      } else if ((temp_if_var2 == 1) & (temp_if_var3 == 0)) {
        block_out =
          "if " + condition_if_out[if_count] + " {}" + false_if_out[if_count];
        temp_if_var3 = 0;
      } else {
        block_out = space_join(
          "if",
          condition_if_out[if_count],
          "{",
          true_if_out[if_count],
          "}" + false_if_out[if_count]);
      }
    }
    if_z = 0;
    if_count = if_count - 1;
    return block_out;
  } //end of if_operation

  //start of indent_operation
  function indent_operation(block_input) {
    var temp_input;
    var temp_var = 0;
    if (block_input.search("\n") > -1) {
      while (block_input.search("\n") > -1) {
        temp_var = temp_var + 1;
        block_line = block_input.substring(0, block_input.search("\n") + 1);
        if (temp_var == 1) {
          temp_input = "  " + block_line + "  ";
        } else {
          temp_input = temp_input + block_line + "  ";
        }
        block_input = block_input.substring(
          block_input.search("\n") + 1,
          block_input.length
        );
      } //end of the while loop
      temp_var = 0;
      temp_input = temp_input + block_input;
    } else {
      temp_input = " " + block_input; // 1 space
    }
    return temp_input;
  } //end of indent operation

  //start of bit_selection_operation
  function bit_selection_operation(block_input) {
    var block_out = [];
    var temp_assign = [];
    var arr;
    while (block_input.search("\n") > -1) {
      block_line = block_input.substring(0, block_input.search("\n") + 1);
      if (block_line.search('"object"') > -1) {
        if (block_line.search("{") > -1) {
          block_input = block_input.substring(
            block_input.search("{"),
            block_input.length
          );
          temp_assign = find_block(block_input);
          block_out[0] = left_operation(temp_assign[1]);
          block_input = block_input.substring(
            block_input.search("{") + temp_assign[1].length + 1,
            block_input.length
          );
          continue;
        }
      }
      if (block_line.search('"bit_sel"') > -1) {
        if (block_line.search("{") > -1) {
          block_input = block_input.substring(
            block_input.search("{"),
            block_input.length
          );
          temp_assign = find_block(block_input);
          block_out[1] = find_function(temp_assign[1]);
          block_out[1] = block_out[1].substring(1, block_out[1].length - 1);
          block_input = block_input.substring(
            block_input.search("{") + temp_assign[1].length + 1,
            block_input.length
          );
          continue;
        }
      }
      block_input = block_input.substring(
        block_input.search("\n") + 1,
        block_input.length
      );
    } //end of the while loop
    block_out = block_out[0] + "[[" + block_out[1] + "]]";
    return block_out;
  } //end of bit_selection_operation

  function tuple_object_json_operation(elem,fcall_level,indent_level) {
    var obj  = find_json_function(elem.object, fcall_level, indent_level);
    var prop = find_json_function(elem.property, fcall_level, indent_level);

    return obj + "." + prop;
  }
  function tuple_list_json_operation(elem,fcall_level,indent_level) {
    var args = [];
    var all_simple = true;
    if (fcall_level>0) {
      all_simple = false
    }
    for(var n = 0 ; n<elem.elements.length ; n++) {
      if (elem.elements[n]) {
        args.push(find_json_function(elem.elements[n], fcall_level + 1, indent_level));
        if (all_simple) {
          if (elem.elements[n].type != "identifier"
            && elem.elements[n].type != "integer"
            && elem.elements[n].type != "function_call") {
            all_simple = false;
          }
        }
      }
    }
    var lineargs = args[0];
    for(var i = 1 ; i<args.length ; i++) {
      if (all_simple) {
        lineargs = space_join(lineargs, args[i]);
      }else{
        lineargs = space_join(lineargs, ",", args[i]);
      }
    }

    return add_parenthesis(lineargs);
  }

  function comment_json_operation(comment,fcall_level,indent_level) {
    return elem.comment;
  }

  function comment_operation(block_input) {
    var block_out = [];
    var temp_assign = [];
    var arr;
    while (block_input.search("\n") > -1) {
      block_line = block_input.substring(0, block_input.search("\n") + 1);
      if (block_line.search('"comment":') > -1) {
        block_out = block_line.substring(
          block_line.search('"comment":') + 12,
          block_line.length - 2
        );
        break;
      }
      block_input = block_input.substring(
        block_input.search("\n") + 1,
        block_input.length
      );
    } //end of the while loop
    return block_out;
  } //end of comment_operation

  //start of tuple_array_operation
  function tuple_array_operation(block_input) {
    var block_out = [];
    var arr;
    while (block_input.search("\n") > -1) {
      block_line = block_input.substring(0, block_input.search("\n") + 1);
      if (block_line.search('"object":') > -1) {
        block_input = block_input.substring(
          block_input.search("{"),
          block_input.length
        );
        temp_assign = find_block(block_input);
        block_out[1] = left_operation(temp_assign[1]);
        block_input = block_input.substring(
          temp_assign[1].length,
          block_input.length
        );
        continue;
      }
      if (block_line.search('"index":') > -1) {
        block_input = block_input.substring(
          block_input.search("{"),
          block_input.length
        );
        temp_assign = find_block(block_input);
        block_out[2] = tuple_list_operation(temp_assign[1]);
        block_out[2] = block_out[2].substring(1, block_out[2].length - 1);
        block_input = block_input.substring(
          temp_assign[1].length,
          block_input.length
        );
        continue;
      }
      block_input = block_input.substring(
        block_input.search("\n") + 1,
        block_input.length
      );
    } //end of the while loop
    arr = block_out[1] + "[" + block_out[2] + "]";
    return arr;
  } //end of tuple_array_operation

  //start of numerical_constant_operation
  function numerical_constant_operation(block_input) {
    var block_out = [];
    var temp_var = 0;
    var temp_assign = [];
    var temp_assign2 = [];
    while (block_input.search("\n") > -1) {
      block_line = block_input.substring(0, block_input.search("\n") + 1);
      if (block_line.search('"value":') > -1) {
        temp_assign = find_block(block_input);
        block_out[1] = left_operation(temp_assign[1]);
        block_input = block_input.substring(
          temp_assign[1].length,
          block_input.length
        );
        continue;
      }
      if (block_line.search('"sign":') > -1) {
        block_out[2] = block_line.substring(
          block_line.search('"sign":') + 9,
          block_line.search('",')
        );
      }
      if (block_line.search('"bits":') > -1) {
        temp_assign = find_block(block_input);
        block_out[3] = left_operation(temp_assign[1]);
        block_input = block_input.substring(
          temp_assign[1].length,
          block_input.length
        );
        continue;
      }
      block_input = block_input.substring(
        block_input.search("\n") + 1,
        block_input.length
      );
    } //end of the while loop
    block_out = block_out[1] + block_out[2] + block_out[3] + "bits";
    return block_out;
  } //end of numerical_constant_operation
}

