var fs = require('fs');
var json_file = fs.readFileSync("./test/ast.json");
var json_data = JSON.parse(json_file);
var depth_count, tmp_count=0;//reset tmp_count to 0 for every new element in json_data[]
var tmp_count_track = 0;
var start=0, end=0;
var k_count=0, k_next_count=1;
var m_count=0, m_next_count=1; //method IDs
var func_decl_track = 0;
var method_id_track=0, scope_pos_track=0, when_track=0; 
var for_pos_track=0;
var elif_track=0, true_track=0, false_track=0; //reset to zero for every new element in json_data[]
var false_count_track = -2;
var elif_condition_track = 0, return_track = 0;
var true_count=0, false_count=0, true_next_count=1, false_next_count=1;
var list = [":","func_pipe","binary_expression","tuple_array","range","bit_select","function_call","tuple_list","tuple_dot"];
var arg_list = [":","func_pipe","binary_expression","tuple_array","range","bit_select","func_decl","function_call","tuple_list","tuple_dot"];
var operators = ["overload","arithmetic_operator","logical_operator","relational_operator","shift_operator","bitwise_operator","tuple_operator"];

cfg_gen(json_data[5]);

cfg_gen_setup = function(input){ //enable this to pass AST to cfg_gen_setup; also change tmp_count -> tmp_count_track
  for(var i = 0; i < input.length; i++){
    tmp_count_track = 0;
    //func_decl_track = 0;
    cfg_gen(input[i]);
  }
}

function cfg_gen(data){ 
  var arr = [];
  /* define a tmp_var in for loop that handles json_data[]. use that tmp_var instead of "tmp_count" in the
  if statement below(and other if statments where you compare tmp_count value) so that u can have 
  tmp_count values as tmp0,tmp1,...tmp100 instead of using tmp0,tmp1 etc for each element of json_data[].

  set that tmp_var=0 in for loop(for each element) and increment in this cfg_gen() every time we push a tmp var in arr 
  instead of tmp_count
  
  1) replace tmp_count with tmp_count_track in if statment in line 37, 47 and 50  
  2) put tmp_count_track = 1 before every cfg_gen call()                       */
  
  if(tmp_count > 0){ 
    //push tmp var to lower levels of expression (along with start and end positions)
    // x = 1+2*3 => tmp1 = 2*3 => tmp0 = 1 + tmp1 => x = tmp0 
    arr.push(start);
    arr.push(end);
    arr.push('tmp'+(tmp_count-1));
  }

  for(var i in data){
    
    if(i == "start_pos" && tmp_count == 0) {
      start = data[i];
      arr.push(data[i]);
    }else if(i == "end_pos" && tmp_count == 0){
      end = data[i];
      arr.push(data[i]);
    }

    if(i == "condition"){
      arr.push("if");
      if(elif_track){
        func_decl_track = 1;
        false_track = 1;
        arr.unshift("null");
        arr.unshift("F"+false_count);
        if(list.indexOf(data[i]["type"]) >= 0){
          false_count_track = false_count;
          elif_condition_track = 1;
        }
        false_count++;
        false_next_count++;
      }
    }

    if(i == "while_condition"){
      arr.push("while");
    }

    if(i == "function"){
      arr.push(".()");
    }

    if(i == "for_index"){
      arr.push("for");
      for_pos_track = arr.length;
    }

    if(i == "pipe_arg"){
      arr.push(".()");
      if(data["pipe_func"]["arguments"][0] == null){
        data["pipe_func"]["arguments"][0] = data[i];
      }else{
        data["pipe_func"]["arguments"].push(data[i]);
      }
      data[i] = null;
      //console.log(data["pipe_func"]["arguments"]);
    }

    
    if(i == "arguments" && Array.isArray(data[i])){ //handles arguments in fcall
      for(var j = 0; j < data[i].length; j++){
        if(typeof(data[i][j])=="object" && data[i][j] != null){
          if(data[i][j]["type"] == "number" || data[i][j]["type"] == "identifier"){
            arr.push(data[i][j]["value"]);
          }else if(arg_list.indexOf(data[i][j]["type"]) >= 0){
            arr.push('tmp'+tmp_count);
            tmp_count = tmp_count + 1;
            tmp_count_track = 1;
            cfg_gen(data[i][j]);
          }   
        }
      }
    }

    if(i == "elements" && Array.isArray(data[i])){ //handles elements in a tuple
      arr.push("()");
      for(var j = 0; j < data[i].length; j++){
        if(typeof(data[i][j])=="object" && data[i][j] != null){
          if(data[i][j]["type"] == "number" || data[i][j]["type"] == "identifier"){
            arr.push(data[i][j]["value"]);
          }else if(arg_list.indexOf(data[i][j]["type"]) >= 0){
            arr.push('tmp'+tmp_count);
            tmp_count = tmp_count + 1;
            tmp_count_track = 1;
            cfg_gen(data[i][j]);
          } 
        }
      }
    }

    if(i == "scope_args"){
      arr.push("::{");
      scope_pos_track = arr.length; //var helps to push fcall dest k_id before arg list
      if(data[i] != null){ //check if scope_args is not null
        if(Array.isArray(data[i]["scope_arg_list"])){
          var tmp_arr = data[i]["scope_arg_list"];
          for(var j = 0; j < tmp_arr.length; j++){
            if(tmp_arr[j]["type"] == "number" || tmp_arr[j]["type"] == "identifier"){
              arr.push(tmp_arr[j]["value"]);
            }else if(list.indexOf(tmp_arr[j]["type"]) >= 0){
              arr.push('tmp'+tmp_count);
              tmp_count = tmp_count + 1;
              cfg_gen(tmp_arr[j]);
            }
          }
        }

        if(data[i]["when"] != null){
          if(data[i]["when"]["type"] == "number" || data[i]["when"]["type"] == "identifier"){
            arr.splice(scope_pos_track,0,data[i]["when"]["value"]);
          }else if(list.indexOf(data[i]["when"]["type"]) >= 0){
            arr.splice(scope_pos_track,0,'tmp'+tmp_count);
            tmp_count = tmp_count + 1;
            cfg_gen(data[i]["when"]);
          }
        }else if(data[i]["when"] == null){ //push null if when == null
          arr.splice(scope_pos_track,0,data[i]["when"]);
        }

      }else{
        arr.push(null); //push null into arr if scope_arg == null.
      }

    }

    if(i == "scope_body"){ //NOTE: add "scope_alt_body" to if condition when needed
      if(data[i] == null){
        arr.splice(scope_pos_track,0,data[i]);
      }else if(Array.isArray(data[i])){
        func_decl_track = 1;// flag to know that prog flow is inside method
        arr.splice(scope_pos_track,0,"M"+m_count);
        for(var j = 0; j < data[i].length; j++){
          if(j == data[i].length - 1){
            method_id_track = 1;
          }
          if(typeof(data[i][j])=="object" && data[i][j] != null){
            cfg_gen(data[i][j]);
          }
        }
        func_decl_track = 0; //set flag to 0 coz prog flow is out of the method block
      }
    }

    if(i == "scope_alt_body"){ //NOTE: add "scope_alt_body" to if condition when needed
      if(data[i] == null){
        arr.splice(scope_pos_track+1,0,data[i]);
      }else if(Array.isArray(data[i])){
        func_decl_track = 1;// flag to know that prog flow is inside method
        arr.splice(scope_pos_track+1,0,"M"+m_count);
        for(var j = 0; j < data[i].length; j++){
          if(j == data[i].length - 1){
            method_id_track = 1;
          }
          if(typeof(data[i][j])=="object" && data[i][j] != null){
            cfg_gen(data[i][j]);
          }
        }
        func_decl_track = 0; //set flag to 0 coz prog flow is out of the method block
      }
    }

    if(i == "for_index"){
      for(var j = 0; j < data[i].length; j++){
        arr.push('tmp'+tmp_count);
        tmp_count = tmp_count + 1;
        cfg_gen(data[i][j]);
      }
    }

    if(i == "for_body"){
      if(data[i] == null){
        arr.splice(for_pos_track,0,data[i]);
      }else{
        func_decl_track = 1;
        arr.splice(for_pos_track,0,"M"+m_count);
        for(var j = 0; j < data[i].length; j++){
          if(j == data[i].length - 1){
            method_id_track = 1;
          }
          if(typeof(data[i][j])=="object" && data[i][j] != null){
            cfg_gen(data[i][j]);
          }
        }
        func_decl_track = 0;
      } 
    }

    if(i == "while_body"){
      if(data[i] == null){
        arr.push(data[i]);
      }else if(Array.isArray(data[i])){
        func_decl_track = 1;
        arr.push("M"+m_count);
        for(var j = 0; j < data[i].length; j++){
          if(j == data[i].length - 1){
            method_id_track = 1;
          }
          if(typeof(data[i][j])=="object" && data[i][j] != null){
            cfg_gen(data[i][j]);
          }
        }
        func_decl_track = 0;
      }
    }

    if(i == "true_case"){
      if(data[i] == null){
        arr.push(data[i]);
      }else if(Array.isArray(data[i])){
        func_decl_track = 1;// flag to know that prog flow is inside "true_case"
        true_track = 1; //set flag to enable proper T0, T1... order
        arr.push('T'+true_count);
        for(var j = 0; j < data[i].length; j++){
          if(j == data[i].length - 1){
            method_id_track = 1;
          }
          if(typeof(data[i][j])=="object" && data[i][j] != null){
            cfg_gen(data[i][j]);
          }
        }
        func_decl_track = 0; //set flag to 0 coz prog flow is out of the method block
        true_track = 0; 
      } 
      
    }

    if(i == "false_case"){
      if(data[i] == null){
        arr.push(data[i]);
      }else if(Array.isArray(data[i])){
        func_decl_track = 1;// flag to know that prog flow is inside "true_case"
        false_track = 1; //set flag to enable proper T0, T1... order
        arr.push('F'+false_count);
        for(var j = 0; j < data[i].length; j++){
          if(j == data[i].length - 1){
            method_id_track = 1;
          }
          if(typeof(data[i][j])=="object" && data[i][j] != null){
            cfg_gen(data[i][j]);
          }
        }
        func_decl_track = 0; //set flag to 0 coz prog flow is out of the method block
        false_track = 0;
        
      }else if(typeof(data[i])=="object"){
        elif_track = 1;
        arr.push('F'+false_count);
        cfg_gen(data[i]);
        elif_track = 0;
      }
    }

    if(i == "i_condition"){ //assertion statement I
      arr.push("I");
    }
    if(i == "n_condition"){ //negation statement N
      arr.push("N");
    }
    if(i == "r_arg"){    //handles return statements
      //arr.unshift(null);  //sets k_next id to null
      arr.push("return");
      if(arr[arr.length-2] == "tmp"+(tmp_count-1)){
        arr.splice(arr.length-2,1);
      }
      return_track = 1;
    }
    if(i == "arr_obj"){
      arr.push("[]");    
    }
    if(i == "dot_obj"){
      arr.push(".");
    }
    if(i == "bit_obj"){
      arr.push("[[]]");
    }
    if(i == "u_bound"){
      arr.push("..");
      if(data[i] == null){
        arr.push(data[i]);
      }
    }
    if(i == "l_bound"){
      if(data[i] == null){
        arr.push(data[i]);
      }
    }
    if(i == "property"){ //for x = a:1 (or) foo.(b, a:1)// handles identifier with property
      arr.push(":"); 
    }
    if(i == "operator" && !(typeof(data[i])=="object")){
      arr.push(data[i]);  //handles "=" push into CFG array
    }
    
    if(typeof(data[i])=="object" && data[i] != null){
      if(data[i]["type"] == "binary_expression"){
        arr.push('tmp'+tmp_count);
        tmp_count = tmp_count + 1;
        tmp_count_track = 1;
        cfg_gen(data[i]);
      }else if(data[i]["type"] == "number" || data[i]["type"] == "identifier" || data[i]["type"] == "overload"){
        arr.push(data[i]["value"]);
      }else if(operators.indexOf(data[i]["type"]) >= 0){
        arr.push(data[i]["value"]);
      }else if(data[i]["type"] == "function_call"){
        arr.push('tmp'+tmp_count);
        tmp_count = tmp_count + 1;
        cfg_gen(data[i]);
      }else if(data[i]["type"] == "tuple_dot"){
        //tuple_dot_parse(data[i]);
        //arr.push(dot_tmp_val); //dot_tmp_val from tuple_dot_parse()              
        arr.push('tmp'+tmp_count);
        tmp_count = tmp_count + 1;
        cfg_gen(data[i]);
      }else if(data[i]["type"] == "tuple_array"){
        //arr.push(...array_tmp); //"..." is spread operator// array_tmp_val from tuple_array_parse()
        arr.push('tmp'+tmp_count);
        tmp_count = tmp_count + 1;
        cfg_gen(data[i]);
      }else if(data[i]["type"] == "bit_select"){
        arr.push('tmp'+tmp_count);
        tmp_count = tmp_count + 1;
        cfg_gen(data[i]);  
      }else if(data[i]["type"] == "range"){
        arr.push('tmp'+tmp_count);
        tmp_count = tmp_count + 1;
        cfg_gen(data[i]);
      }else if(data[i]["type"] == "tuple_list"){
        arr.push('tmp'+tmp_count);
        tmp_count = tmp_count + 1;
        cfg_gen(data[i]);
      }else if(data[i]["type"] == "string"){
        var str_join = [];
        str_join.push('"');
        str_join.push(data[i]["value"]);
        str_join.push('"');
        arr.push(str_join.join(''));
      }else if(data[i]["type"] == ":"){
        arr.push('tmp'+tmp_count);
        tmp_count = tmp_count + 1;
        cfg_gen(data[i]);
      }else if(data[i]["type"] == "func_decl"){
        arr.push('tmp'+tmp_count);
        tmp_count = tmp_count + 1;
        tmp_count_track = 1;
        cfg_gen(data[i]);
      } /*else if(data[i]["type"] == "func_pipe"){
        arr.push('tmp'+tmp_count);
        tmp_count = tmp_count + 1;
        cfg_gen(data[i]);
      }*/

      if(i == "condition" && arr[0] == "F"+false_count_track && elif_condition_track){
        arr[0] = "F"+(false_count_track+1);
        elif_condition_track = 0;
      }
          
    }
  
  } 

  if(arr[1] == 'null'){
    elif_track = 1;  //handles multiple ELIFs
  }
  
  if(arr[3] == '='){  //remove additional "tmp" var in assign expressions
    arr.splice(2,1);
  }

  if(arr[5] == 'if'){ //remove additional "tmp" var in if statements
    arr.splice(4,1);
  }
 
  if(func_decl_track && arr.length > 0){
    if(method_id_track && arr[2] == "="){
      arr.unshift(null);
      method_id_track = 0;
    }else{
      if(true_track){
        if(return_track){
          arr.unshift("null");
          return_track = 0;
        }else{
          arr.unshift("T"+true_next_count);
        }
      }else if(false_track){
        if(return_track){
          arr.unshift("null");
          return_track = 0;
        }else{
          arr.unshift("F"+false_next_count);
        }
      }else{
        if(return_track){
          arr.unshift("null");
          return_track = 0;
        }else{
          arr.unshift("M"+m_next_count);
        }
      }
    }
    if(true_track){
      arr.unshift("T"+true_count);
      true_count++;
      true_next_count++;
    }else if(false_track){
      arr.unshift("F"+false_count);
      if(false_count == false_count_track+1 && elif_condition_track){
        arr[0] = "F"+false_count_track;
        arr[1] = "F"+(false_count_track+1);
        //elif_condition_track = 0;
      }
      false_count++;
      false_next_count++;
    }else{
      arr.unshift("M"+m_count);
      m_count++;
      m_next_count++;
    }
  }else if(!func_decl_track && arr.length > 0 && !elif_track){
    if(return_track){ //no k_next if input is a return statement
      arr.unshift("null");
      return_track = 0;
    }else{
      arr.unshift("K"+k_next_count);
    }

    arr.unshift("K"+k_count);
    k_count++;
    k_next_count++;
  }

  
  console.log(arr);
}



