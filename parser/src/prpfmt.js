var exports = module.exports = {};

exports.prpfmt = function(prp_path, input_file_name, data) {

    var debug = false;

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

    var parser = require(path.join(prp_path, "lib/prp_parser.js"));
    var jsonFile = fs.readFileSync(path.join(prp_path, "data/prplearn.json"));
    var jsonContent = JSON.parse(jsonFile);



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
                err.expected.length > 1 ?
                    expectedDescs.slice(0, -1).join(", ") +
                    " or " +
                    expectedDescs[err.expected.length - 1] :
                    expectedDescs[0];
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
            console.error("ERROR: all the json root attributes should have a type field");
            console.error(elem);
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




    function space_join(...c) {
        var tmp = "";
        var lastc = ' ';
        for (var i in c) {
            if (c[i].length == 0) {
                // do not add space to ""
                lastc = " ";
            } else if (c[i][0] == ' ' || lastc == ' ' || lastc == '\n') {
                tmp = tmp + c[i];
                lastc = c[i][c[i].length - 1];
            } else {
                tmp = tmp + " " + c[i];
                lastc = c[i][c[i].length - 1];
            }
        }
        return tmp;
    };



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








    function add_parenthesis(a) {
        if (!a) {
            a = ""
        }
        if (a.length < 2) {
            return "(" + a + ")";
        }
        if (a[0] == '(' && a[a.length - 1] == ')') {
            return a;
        }

        return "(" + a + ")";
    }


    function json_operation_number(elem, fcall_level, indent_level) {
        return elem.value;
    }

    function json_operation_assignment(elem, fcall_level, indent_level) {
        var op = elem.operator;
        var lhs = find_json_function(elem.left, fcall_level, indent_level);
        var rhs = find_json_function(elem.right, fcall_level, indent_level);

        arr = space_join(lhs, op, rhs);

        return arr;
    }

    function json_operation_left(elem) {
        return elem.value
    }


    function json_operation_function_call(elem, fcall_level, indent_level) {
        var name = find_json_function(elem.function, fcall_level, indent_level);

        var args = [];
        var all_simple = true;
        if (fcall_level > 0) {
            all_simple = false
        }
        for (var n = 0; n < elem.arguments.length; n++) {
            if (elem.arguments[n]) {
                args.push(find_json_function(elem.arguments[n], fcall_level + 1, indent_level));
                if (all_simple) {
                    if (elem.arguments[n].type != "identifier" &&
                        elem.arguments[n].type != "integer" &&
                        elem.arguments[n].type != "function_call") {
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
        if (args.length > 0) {
            lineargs = args[0];
        } else {
            lineargs = "";
        }
        for (var i = 1; i < args.length; i++) {
            if (all_simple) {
                lineargs = space_join(lineargs, args[i]);
            } else {
                lineargs = space_join(lineargs, ",", args[i]);
            }
        }

        var block_output;
        if (all_simple) {
            if (body) {
                block_output = space_join(name, lineargs, body);
            } else {
                block_output = space_join(name, lineargs);
            }
        } else {
            if (body) {
                block_output = name + ".(" + lineargs + ") " + body;
            } else {
                block_output = name + ".(" + lineargs + ")";
            }
        }

        return block_output;
    }



    function json_operation_binary(elem, fcall_level, indent_level) {
        var op = "";
        if (elem.operator.type == "arithmetic_operator" ||
            elem.operator.type == "logical_operator" ||
            elem.operator.type == "shift_operator" ||
            elem.operator.type == "tuple_operator" ||
            elem.operator.type == "relational_operator" ||
            elem.operator.type == "overload") {
            op = elem.operator.value;
        // } else if (elem.operator.type == "overload") {
        //     op = ".." + elem.operator.value + "..";
        } else {
            console.error("ERROR: unexpected operator type=" + elem.operator.type);
            process.exit(-3);
        }
        var lhs = find_json_function(elem.left, fcall_level, indent_level);
        var rhs = find_json_function(elem.right, fcall_level, indent_level);

        if (needs_operator(lhs, op)) {
            lhs = add_parenthesis(lhs);
        }
        if (needs_operator(rhs, op)) {
            rhs = add_parenthesis(rhs);
        }

        arr = space_join(lhs, op, rhs);

        return arr;
    }


    function json_operation_tuple_dot(elem, fcall_level, indent_level) {
        var obj = find_json_function(elem.dot_obj, fcall_level, indent_level);
        var prop = find_json_function(elem.dot_prop, fcall_level, indent_level);

        return obj + "." + prop;
    }

    function json_operation_tuple_list(elem, fcall_level, indent_level) {
        var args = [];
        var all_simple = true;
        if (fcall_level > 0) {
            all_simple = false
        }
        if (elem.elements) {
            for (var n = 0; n < elem.elements.length; n++) {
                if (elem.elements[n]) {
                    args.push(find_json_function(elem.elements[n], fcall_level + 1, indent_level));
                    if (all_simple) {
                        if (elem.elements[n].type != "identifier" &&
                            elem.elements[n].type != "integer" &&
                            elem.elements[n].type != "function_call") {
                            all_simple = false;
                        }
                    }
                }
            }
        }

        var lineargs = args[0];
        for (var i = 1; i < args.length; i++) {
            if (all_simple) {
                lineargs = space_join(lineargs, args[i]);
            } else {
                lineargs = space_join(lineargs, ",", args[i]);
            }
        }

        return add_parenthesis(lineargs);
    }

    function json_operation_assertion(elem, fcall_level, indent_level) {
        var cond = find_json_function(elem.i_condition, fcall_level, indent_level);

        return space_join("I", cond);
    }

    function json_operation_range(elem, fcall_level, indent_level) {

        var lhs = "";
        if (elem.l_bound) {
            lhs = find_json_function(elem.l_bound, fcall_level, indent_level);
        }
        var rhs = "";
        if (elem.u_bound) {
            rhs = find_json_function(elem.u_bound, fcall_level, indent_level);
        }

        return "(" + lhs + ".." + rhs + ")";
    }

    function get_code_blocks(elem, fcall_level, indent_level) {
        indent_level = indent_level + 1;

        var tc = [];
        var tclong = false;
        // True case
        if (elem.true_case) {
            for (var i = 0; i < elem.true_case.length; i++) {
                var tmp = find_json_function(elem.true_case[i], fcall_level, indent_level);
                if (tmp.search("\n") >= 0) {
                    tmp = tmp.replace(/\n/g, "\n  ");
                    tclong = true;
                }
                if (tmp.length > 0) {
                    tc.push(tmp);
                }
            }
            if (tc.length > 1) {
                tclong = true;
            }
        } else if (elem.scope_body) {
            // Func Decl
            for (var i = 0; i < elem.scope_body.length; i++) {
                var tmp = find_json_function(elem.scope_body[i], fcall_level, indent_level);
                if (tmp.search("\n") >= 0) {
                    tmp = tmp.replace(/\n/g, "\n  ");
                    tclong = true;
                }
                if (tmp.length > 0) {
                    tc.push(tmp);
                }
            }
            if (tc.length > 1) {
                tclong = true;
            }
        } else if (elem.while_body) {
            // While Statement
            for (var i = 0; i < elem.while_body.length; i++) {
                var tmp = find_json_function(elem.while_body[i], fcall_level, indent_level);
                if (tmp.search("\n") >= 0) {
                    tmp = tmp.replace(/\n/g, "\n  ");
                    tclong = true;
                }
                if (tmp.length > 0) {
                    tc.push(tmp);
                }
            }
            if (tc.length > 1) {
                tclong = true;
            }
        } else if (Array.isArray(elem)) {
            //for loop
            // Maybe a dirty fix, limited by AST structure
            for (var i = 0; i < elem.length; i++) {
                var tmp = find_json_function(elem[i], fcall_level, indent_level);
                if (tmp.search("\n") >= 0) {
                    tmp = tmp.replace(/\n/g, "\n  ");
                    tclong = true;
                }
                if (tmp.length > 0) {
                    tc.push(tmp);
                }
            }
            if (tc.length > 1) {
                tclong = true;
            }
        }


        var fc = [];
        var fclong = false;
        var iselif = false;

        if (elem.false_case) {
            // if (typeof(elem.false_case.length) == 'number')
            if (Array.isArray(elem.false_case)) {
                for (var i = 0; i < elem.false_case.length; i++) {
                    var tmp = find_json_function(elem.false_case[i], fcall_level, indent_level);
                    if (tmp.search("\n") >= 0) {
                        tmp = tmp.replace(/\n/g, "\n  ");
                        fclong = true;
                    }
                    if (tmp != "") {
                        fc.push(tmp);
                    }
                }
            } else {
                iselif = true;
                var tmp = find_json_function(elem.false_case, fcall_level, indent_level);
                if (tmp != "") {
                    fc.push(tmp.substr(0, tmp.length - 1));
                }
            }
            if (fc.length > 1) {
                fclong = true;
            }
        }

        var line = "{";
        if (tc.length == 0) {
            // nothing here
        } else if (tclong || fclong || elem.false_case) {
            line = line + "\n";
            for (var i = 0; i < tc.length; i++) {
                line = line + "  " + tc[i] + "\n";
            }
        } else {
            line = space_join(line, tc);
        }
        if (fc.length == 0) {
            line = line + "}";
        } else if (iselif) {
            line = space_join(line, "}el" + fc, "}");
        }
        else if (tclong || fclong) {
            line = line + "}else{\n";
            for (var i = 0; i < fc.length; i++) {
                line = line + "  " + fc[i] + "\n";
            }
            line = space_join(line, "}");
        } else {
            line = space_join(line, "}else{", fc, "}");
        }

        return line;
    }


    function json_operation_func_decl(elem, fcall_level, indent_level) {
        var args = "";
        var cond = "";

        if (elem.scope_args) {
            for (var n = 0; n < elem.scope_args.scope_arg_list.length; n++) {
                if (elem.scope_args.scope_arg_list[n]) {
                    args = space_join(args, find_json_function(elem.scope_args.scope_arg_list[n], fcall_level, indent_level));
                    if (debug) {
                        console.log(args);
                    }
                }
            }
            if (elem.scope_args.when) {
                cond = find_json_function(elem.scope_args.when, fcall_level, indent_level);
            }
        }

        var txt = ":";
        var blocks = get_code_blocks(elem, fcall_level, indent_level);

        if (args != "") {
            txt = txt + "(" + args + ")";
        }
        if (cond != "") {
            txt = space_join(txt, "when", cond);
        }

        return txt + ":" + blocks;
    }


    function json_operation_while(elem, fcall_level, indent_level) {
        var cond = "false";

        if (elem.while_condition) {
            cond = find_json_function(elem.while_condition, fcall_level, indent_level);
        }

        var txt = "";
        var blocks = get_code_blocks(elem, fcall_level, indent_level);

        if (cond != "") {
            txt = space_join(txt, "while", cond);
        } else {
            txt = space_join(txt, "while", "true");
        }

        return txt + blocks;
    }

    function json_operation_if(elem, fcall_level, indent_level) {

        var cond = find_json_function(elem.condition);
        var blocks = get_code_blocks(elem, fcall_level, indent_level);

        cond = cond.replace(/\n/g, "\n   "); // FIXME: space with if for multiline comments

        return space_join("if", cond, blocks);
    }



    function json_operation_colon(elem, fcall_level, indent_level) {
        var p = find_json_function(elem.property, fcall_level, indent_level)
        var v = find_json_function(elem.var, fcall_level, indent_level)

        return p + ":" + v
    }

    function json_operation_for(elem, fcall_level, indent_level) {

        if (elem.for_index.length != 1) {
            console.error("ERROR: invalid for index count: " + elem.for_index);
            exit(-3);
        }

        var body = ""
        var index = ""

        body = get_code_blocks(elem.for_body, fcall_level, indent_level)
        index = find_json_function(elem.for_index[0], fcall_level, indent_level)

        return "for " + index + " " + body
    }

    function json_operation_comment(comment, fcall_level, indent_level) {
        return elem.comment;
    }


    function find_json_function(elem, fcall_level, indent_level) {
        if (debug) {
            console.log(elem);
        }
        var block_out;

        // elem types
        switch (elem.type) {
            case "number":
                block_out = json_operation_number(elem, fcall_level, indent_level);
                break;

            case "assignment_expression":
                block_out = json_operation_assignment(elem, fcall_level, indent_level);
                break;

            case "identifier":
                block_out = json_operation_left(elem, fcall_level, indent_level);
                break;

            case "function_call":
                block_out = json_operation_function_call(elem, fcall_level, indent_level);
                break;

            case "binary_expression":
                block_out = json_operation_binary(elem, fcall_level, indent_level);
                break;

            case "tuple_dot":
                block_out = json_operation_tuple_dot(elem, fcall_level, indent_level);
                break;

            case "tuple_list":
                block_out = json_operation_tuple_list(elem, fcall_level, indent_level);
                break;

            case "assertion":
                block_out = json_operation_assertion(elem, fcall_level, indent_level);
                break;

            case "range":
                block_out = json_operation_range(elem, fcall_level, indent_level);
                break;

            case "func_decl":
                block_out = json_operation_func_decl(elem, fcall_level, indent_level);
                break;

            case "while":
                block_out = json_operation_while(elem, fcall_level, indent_level);
                break;

            case "if":
                block_out = json_operation_if(elem, fcall_level, indent_level);
                break;

            case "for":
                block_out = json_operation_for(elem, fcall_level, indent_level);
                break;

            case "\:":
                block_out = json_operation_colon(elem, fcall_level, indent_level);
                break;

            case "comment":
                block_out = json_operation_comment(elem, fcall_level, indent_level);
                break;

            default:

            // This part of elems type are not shown in tests. The reason may be tests are limited, or they are deprecated.
            if (elem.type == "tuple_object") {
                block_out = tuple_object_json_operation(elem, fcall_level, indent_level);
            } else if (elem.type == "return_statement") {
                block_out = return_json_operation(elem, fcall_level, indent_level);
            } else if (elem.type == "bit_selection") {
                block_out = bit_selection_json_operation(elem, fcall_level, indent_level);
            } else if (elem.type == "tuple_array") {
                block_out = tuple_array_json_operation(elem, fcall_level, indent_level);
            } else if (elem.type == "numerical_constant") {
                block_out = numerical_constant_json_operation(elem, fcall_level, indent_level);
            } else if (elem.type === undefined && elem.property && elem.var) {
                block_out = attribute_json_operation(elem, fcall_level, indent_level);
            } else {
                console.error("ERROR: unexpected type=" + elem.type + " fcall_level=" + fcall_level);
                console.error(elem);
                process.exit(-3);
                block_out = elem;
            }
        }

        return block_out;
    }


    function attribute_json_operation(elem, fcall_level, indent_level) {
        var lhs = find_json_function(elem.property, fcall_level, indent_level);
        var rhs = find_json_function(elem.var, fcall_level, indent_level);

        return lhs + ":" + rhs;
    }

    function tuple_object_json_operation(elem, fcall_level, indent_level) {
        var obj = find_json_function(elem.object, fcall_level, indent_level);
        var prop = find_json_function(elem.property, fcall_level, indent_level);

        return obj + "." + prop;
    }


    function needs_operator(side, op) {
        var op_len = op.length;
        for (var i = 0; i < side.length;) {
            if (side[i] == ' ') {
                if (side.substring(i + 1, i + 1 + op_len) != op) {
                    return true;
                }
                i = i + 1 + op_len + 1; // +1 for end space in op
            } else {
                i++;
            }
        }
        return false;
    }
}
