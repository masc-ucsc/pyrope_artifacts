var fs = require('fs');
//var json_file = fs.readFileSync("./test/ast_for.json");
//var json_data = JSON.parse(json_file);
var tmp_count = 0;
var tmp_count_track = 0;
var start = 0, end = 0;
var k_count = 0, k_next_count = 1;
var scope_pos_track = 0, when_track = 0; 
var false_count_track = -2;
var elif_condition_track=0, return_track=0;
var list = [":","func_pipe","binary_expression","tuple_array","range","bit_select","function_call","tuple_list","tuple_dot"];
var arg_list = [":","func_pipe","binary_expression","tuple_array","range","bit_select","func_decl","function_call","tuple_list","tuple_dot"];
var operators = ["overload","arithmetic_operator","logical_operator","relational_operator","shift_operator","bitwise_operator","tuple_operator"];
var method_id_track = 0;
var elif_next_track = 0;
var elif_phi_mark = 0;
var tmp_if_phi = 0;

//test comment
cfg_gen_setup = function(input){ //enable this to pass AST to cfg_gen_setup; also change tmp_count -> tmp_count_track
  for(var i = 0; i < input.length; i++){
    tmp_count_track = 0;
    if(input[i]["type"] != "comment"){
      cfg_gen(input[i]);
    }
  }
}

function cfg_gen(data){ 
  var arr = [];

  if(method_id_track == 1){ //insert k_next=null for last element in block
    arr.push("null");
    method_id_track = 0;
  }

  if(elif_next_track == 1){ //insert k_next=null for elif statement's cfg
    arr.push("null");
    elif_next_track = 0;
  }

  if(tmp_count_track > 0){ 
    //push tmp var to lower levels of expression (along with start and end positions)
    // x = 1+2*3 => tmp1 = 2*3 => tmp0 = 1 + tmp1 => x = tmp0
    arr.push(start);
    arr.push(end);
    arr.push('tmp'+(tmp_count-1));
  }

  //for loop traverses AST(in json format)
  for(var i in data){    
    if(i == "start_pos" && tmp_count_track == 0) {
      start = data[i];
      arr.push(data[i]);
    }else if(i == "end_pos" && tmp_count_track == 0){
      end = data[i];
      arr.push(data[i]);
    }

    if(i == "condition"){
      arr.push("if");       
    }

    if(i == "uif_condition"){
      arr.push("uif");
    }

    if(i == "while_condition"){
      arr.push("while");
    }

    if(i == "function"){
      arr.push(".()");
    }

    if(i == "for_index"){
      arr.push("for");
    }

    if(i == "pipe_arg"){
      arr.push(".()");
      if(data["pipe_func"]["arguments"][0] == null){
        data["pipe_func"]["arguments"][0] = data[i];
      }else{
        data["pipe_func"]["arguments"].push(data[i]);
      }
      data[i] = null;
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
          }else if(list.indexOf(data[i][j]["type"]) >= 0){
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
              tmp_count_track = 1;
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
            tmp_count_track = 1;
            cfg_gen(data[i]["when"]);
          }
        }else if(data[i]["when"] == null){ //push null if when == null
          arr.splice(scope_pos_track,0,"null");
        }

      }else{
        arr.push("null"); //push null into arr if scope_arg == null.
      }

    }    

    if(i == "scope_body"){
      if(data[i] == null){
        arr.splice(arr.length-1,0,"null");
      }else if(Array.isArray(data[i])){
        k_count++;      //k_count for "while"
        k_next_count++;
        arr.unshift('K'+k_count); //push k_id to arr        
        arr.splice(scope_pos_track+2,0,'K'+(k_count+2)); //push k_count of scope body in cfg
        k_count++;
        k_next_count++;

        for(var j = data[i].length - 1; j >= 0; j--){
          if(typeof(data[i][j])=="object" && data[i][j]["type"] == "comment"){ //remove comments from AST
            data[i].splice(j, 1);
          }
        }

        for(var j = 0; j < data[i].length; j++){
          if(j == data[i].length - 1){
            method_id_track = 1;
          }
          if(typeof(data[i][j])=="object" && data[i][j] != null && data[i][j]["type"] != "comment"){
            cfg_gen(data[i][j]);
          }
        }
      }
    }   

    if(i == "scope_alt_body"){
      if(data[i] == null){
        arr.splice(arr.length,0,"null");
      }else if(Array.isArray(data[i])){
        arr.splice(scope_pos_track+3,0,'K'+(k_count+2)); //push k_count of scope_alt body in cfg
        k_count++;
        k_next_count++;

        for(var j = data[i].length - 1; j >= 0; j--){
          if(typeof(data[i][j])=="object" && data[i][j]["type"] == "comment"){ //remove comments from AST
            data[i].splice(j, 1);
          }
        }

        for(var j = 0; j < data[i].length; j++){
          if(j == data[i].length - 1){
            method_id_track = 1;
          }
          if(typeof(data[i][j])=="object" && data[i][j] != null && data[i][j]["type"] != "comment"){
            cfg_gen(data[i][j]);
          }
        }
      }
    }

    if(arr[4] == '::{' && i == "scope_alt_body"){
      k_count = k_count + 1;
      k_next_count = k_next_count + 1;
      arr.splice(1, 0, 'K'+k_next_count); //push k_next to arr
    }

    if(i == "for_index"){
      for(var j = 0; j < data[i].length; j++){
        arr.push('tmp'+tmp_count);
        tmp_count = tmp_count + 1;
        tmp_count_track = 1;
        cfg_gen(data[i][j]);
      }
    }    
     
    if(i == "for_body"){
      if(data[i] == null){
        arr.push("null");
      }else if(Array.isArray(data[i])){
        k_count++; 
        k_next_count++; 
        arr.unshift('K'+k_count); //push k_id to arr
        arr.push('K'+(k_count+2));  //push "for" target k_id to arr
        k_count++;
        k_next_count++;

        for(var j = data[i].length - 1; j >= 0; j--){
          if(typeof(data[i][j])=="object" && data[i][j]["type"] == "comment"){ //remove comments from AST
            data[i].splice(j, 1);
          }
        }

        for(var j = 0; j < data[i].length; j++){
          if(j == data[i].length - 1){
            method_id_track = 1;
          }
          if(typeof(data[i][j])=="object" && data[i][j] != null && data[i][j]["type"] != "comment"){            
            cfg_gen(data[i][j]);
          }
        }
      }
    }

    if(arr[3] == 'for'){
      k_count = k_count + 1;
      k_next_count = k_next_count + 1;
      arr.splice(1, 0, 'K'+k_next_count); //push k_next to arr
    }

    if(i == "while_body"){
      if(data[i] == null){
        arr.push("null");
      }else if(Array.isArray(data[i])){
        k_count++;      //k_count for "while"
        k_next_count++;
        arr.unshift('K'+k_count); //push k_id to arr
        arr.push('K'+(k_count+2)); //push while target k_id to arr
        k_count++;
        k_next_count++;

        for(var j = data[i].length - 1; j >= 0; j--){
          if(typeof(data[i][j])=="object" && data[i][j]["type"] == "comment"){ //remove comments from AST
            data[i].splice(j, 1);
          }
        }

        for(var j = 0; j < data[i].length; j++){
          if(j == data[i].length - 1){
            method_id_track = 1;
          }
          if(typeof(data[i][j])=="object" && data[i][j] != null && data[i][j]["type"] != "comment"){
            cfg_gen(data[i][j]);
          }
        }
      }
    }

    if(arr[3] == 'while'){
      k_count = k_count + 1;
      k_next_count = k_next_count + 1;
      arr.splice(1, 0, 'K'+k_next_count); //push k_next to arr
    }

    if(i == "true_case"){
      var if_phi;
      if(data[i] == null){
        arr.push("null");
      }else if(Array.isArray(data[i])){
        k_count++;      //k_count for "if"
        k_next_count++;
        
        if(elif_phi_mark == 0){
          if_phi = k_count;
          tmp_if_phi = if_phi;
        }else{
          if_phi = tmp_if_phi;
          elif_phi_mark = 0;
        }
        
        arr.unshift('K'+k_count); // push k_id to arr        
        arr.push('K'+(k_count+2)); //index for true case

        k_count++;
        k_next_count++;

        for(var j = data[i].length - 1; j >= 0; j--){
          if(typeof(data[i][j])=="object" && data[i][j]["type"] == "comment"){ //remove comments from AST
            data[i].splice(j, 1);
          }
        }

        for(var j = 0; j < data[i].length; j++){
          if(j == data[i].length - 1){
            method_id_track = 1;
          }
          if(typeof(data[i][j])=="object" && data[i][j] != null && data[i][j]["type"] != "comment"){                                    
            cfg_gen(data[i][j]); 
          }
        }
      } 
    }

    if(i == "false_case"){
      if(data[i] == null){
        arr.push("null");
      }else if(Array.isArray(data[i])){        
        arr.push('K'+(k_count+2));  //push else target k_id into arr
        k_count++;
        k_next_count++;

        for(var j = data[i].length - 1; j >= 0; j--){
          if(typeof(data[i][j])=="object" && data[i][j]["type"] == "comment"){ //remove comments from AST
            data[i].splice(j, 1);
          }
        }

        for(var j = 0; j < data[i].length; j++){
          if(j == data[i].length - 1){
            method_id_track = 1;
          }
          if(typeof(data[i][j])=="object" && data[i][j] != null && data[i][j]["type"] != "comment"){            
            cfg_gen(data[i][j]);
          } 
        } 
      }else if(typeof(data[i])=="object"){
        elif_next_track = 1;
        arr.push('K'+(k_count+2)); //push elif target k_id to arr
        k_count++;
        k_next_count++;
        elif_phi_mark = 1;
        cfg_gen(data[i]);
        elif_phi_mark = 0;
      }
      arr.push("'K"+if_phi);
    }   

    if((arr[3] == 'if' || arr[3] == 'uif') && i == "false_case"){
      k_count = k_count + 1;
      k_next_count = k_next_count + 1;
      arr.splice(1, 0, 'K'+k_next_count); //push k_next to arr
    }else if((arr[3] == 'if' || arr[3] == 'uif') && i == "false_case"){ //this loop removes additional "tmp" in "if" cfg arr
      k_count = k_count + 1;
      k_next_count = k_next_count + 1;
      //arr.splice(3,1);  // #FIXME this is causing a bug. Remove if not needed
      arr.splice(1, 0, 'K'+k_next_count); //push k_next to arr
    }

    if(i == "i_condition"){ //assertion statement I
      arr.push("I");
    }
    if(i == "n_condition"){ //negation statement N
      arr.push("N");
    }
    if(i == "r_arg"){    //handles return statements
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
        arr.push("null");
      }
    }
    if(i == "l_bound"){
      if(data[i] == null){
        arr.push("null");
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
      }else if(data[i]["type"] == "not_op"){
        if(data[i]["not_arg"]["type"] == "number" || data[i]["not_arg"]["type"] == "identifier"){
          arr.push('!'+data[i]["not_arg"]["value"]);
        }else{
          arr.push('!tmp'+tmp_count);
          tmp_count = tmp_count + 1;
          tmp_count_track = 1;
          cfg_gen(data[i]["not_arg"]);
        }
      }else if(data[i]["type"] == "number" || data[i]["type"] == "identifier"){
        arr.push(data[i]["value"]);
      }else if(operators.indexOf(data[i]["type"]) >= 0){
        arr.push(data[i]["value"]);
      }else if(data[i]["type"] == "function_call"){
        arr.push('tmp'+tmp_count);
        tmp_count = tmp_count + 1;
        tmp_count_track = 1;
        cfg_gen(data[i]);
      }else if(data[i]["type"] == "tuple_dot"){
        arr.push('tmp'+tmp_count);
        tmp_count = tmp_count + 1;
        tmp_count_track = 1;
        cfg_gen(data[i]);
      }else if(data[i]["type"] == "tuple_array"){
        //arr.push(...array_tmp); //"..." is spread operator// array_tmp_val from tuple_array_parse()
        arr.push('tmp'+tmp_count);
        tmp_count = tmp_count + 1;
        tmp_count_track = 1;
        cfg_gen(data[i]);
      }else if(data[i]["type"] == "bit_select"){
        arr.push('tmp'+tmp_count);
        tmp_count = tmp_count + 1;
        tmp_count_track = 1;
        cfg_gen(data[i]);  
      }else if(data[i]["type"] == "range"){
        arr.push('tmp'+tmp_count);
        tmp_count = tmp_count + 1;
        tmp_count_track = 1;
        cfg_gen(data[i]);
      }else if(data[i]["type"] == "tuple_list"){
        arr.push('tmp'+tmp_count);
        tmp_count = tmp_count + 1;
        tmp_count_track = 1;
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
        tmp_count_track = 1;
        cfg_gen(data[i]);
      }else if(data[i]["type"] == "func_decl"){
        arr.push('tmp'+tmp_count);
        tmp_count = tmp_count + 1;
        tmp_count_track = 1;
        cfg_gen(data[i]);
      }

      if(i == "condition" && arr[0] == "F"+false_count_track && elif_condition_track){
        arr[0] = "F"+(false_count_track+1);
        elif_condition_track = 0;
      }
          
    }
  
  }

  if(arr[0][0] != 'K'){  
    k_count++;
    k_next_count++;
    arr.unshift('K'+k_next_count);
    arr.unshift('K'+k_count);
  }

  if(arr[2] == "null"){  //this loop handles k_next = null for last element in a block
    //var tmp_x = arr[2];
    arr[1] = arr[2];
    arr.splice(2,1);
    //console.log(arr);
  }

  
  if(arr[5] == '=' || arr[5] == ':=' || arr[5] == 'as'){  //remove additional "tmp" var in assign expressions
    arr.splice(4,1);
  }

  if(arr[5] == 'if'){ //remove additional "tmp" var in if statements
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@"); //print for debug
    arr.splice(4,1);
  }
 
  if(arr[4].match(/tmp/)){  //swap 'tmp' to column no:4
    var tmp = arr[4];
    arr[4] = arr[5];
    arr[5] = tmp;
  }

  //console.log(arr);
  /*if(arr[4] == "=" || arr[4] == ":=" || arr[4] == ".()" || arr[4] == "as"){
    var tmp = arr[4];
    arr[4] = arr[5];
    arr[5] = tmp;
  }*/

  console.log(arr.join('\t'));
}



