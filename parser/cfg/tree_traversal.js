var traverse = require('traverse');
var __  = require('underscore');
//var yaml = require('write-yaml');
var sy = require('./shuntingYard.js');
var fs = require('fs');
var jsonFile = fs.readFileSync("ast1.json"); 
var jsonData = JSON.parse(jsonFile);
var callback = console.log;
var jsonSize = 0;
var operators = {"+": 1, "-": 1, "*": 1, "/": 1};
var idx,k_count=0,k_next_count=1,tmp_count=0;
var start, end;
var cfg; // global variable to store cfg
//var opCount = 0;

while(jsonSize < jsonData.length){
  //console.log(cfg_gen(jsonData[jsonSize]));
  cfg_gen(jsonData[jsonSize]);
  jsonSize = jsonSize+1;
}

function cfg_gen(data){
  var leaves = traverse(data).forEach(function fcall_cfg(x){

    if(this.key=="type" && x=="function_call" && this.level==1){
      cfg_gen_fcall(data);
    }

  });
}

function cfg_gen_fcall(data){
  //cfg.push(tmp_acc);
  var invalid_type = ["identifier","integer","arithmetic_operator","binary_expression","assignment_expression","function_call"];  
  cfg=[];
  cfg.push(".()");
  var fcall_level, depth = 0;
  var leaves = traverse(data).forEach(function fcall_cfg(x){
    if(this.key=="start_pos" && this.level==1) start = x;
    if(this.key=="end_pos" && this.level==1) end = x;

    if(this.key=="function" && this.level==1){
      //cfg.push(x["value"]);
      fcall_level = this.level;
      cfg.push(x["value"]);
    }
    if(this.key=="arguments" && this.level==fcall_level && x[0]!=null){
      var x_len = x.length;
      for(var i = 0; i < x.length; i++){
        if(x[i]["type"]=="identifier"){
          cfg.push(x[i]["value"]);
        }else if(x[i]["type"]=="binary_expression"){
          var tmp = [];
          cfg.push(tmp);
          var new_arg_tracker = 0;
          traverse(x[i]).forEach(function (y){
            if(this.isLeaf && !(invalid_type.indexOf(y) >= 0)){
              var tmp2 = [];
              
              /*if(this.level > depth){
                //var tmp = [];
                depth = this.level;
                cfg.push(tmp);
                //cfg[cfg.length-1].push(tmp);
                if(y!=null) cfg[cfg.length-1].push(y);
              } else if(this.level == depth){
                if(y!=null) cfg[cfg.length-1].push(y);
              } else if(this.level < depth){
                depth = this.level;
                //if(y!=null && (((cfg.length-1) - depth) == 2)) cfg[depth+1].push(y);
                if(y!=null) cfg[cfg.length-1].push(y);
                //diff is 2 -> check RN rear side
              }*/

              if(this.level > depth){
                //var tmp2 = [];
                if(y!=null) tmp2.push(y);
                depth = this.level;
                //cfg.push(tmp2);
                if(y!=null) cfg[cfg.length-1].splice(depth-2,0,tmp2);//cfg[cfg.length-1].push(tmp2);
              } else if(this.level == depth){
                //if(y!=null) tmp2.push(y);         
                if(y!=null) cfg[cfg.length-1][cfg[cfg.length-1].length-1].push("XXX"); //cfg[cfg.length-1].push(y);
              } else if(this.level < depth){
                depth = this.level;
                //if(y!=null) cfg[cfg.length-1].push(y);
                //diff is 2 -> check RN rear side
              }

              console.log(this.level+"   "+y);
            }
          });
          /*var tmp3 = [];
          cfg.push(tmp3);
          for(var i = cfg.length-1; i >= 0; i--){
            if(cfg[i] instanceof Array && cfg[i].length > 0) {
              cfg[cfg.length-1].unshift(cfg[i]);
              cfg.splice(i,1);
              console.log(cfg);
            }
            
          }*/
          //filter_expression();
        }
        else if(x[i]["type"]=="function_call"){
          //cfg_gen_fcall(x[i]);
        }

      }
    }

  });

  console.log(cfg);
  
}


//break down expression in raw cfg into 'tmp' expressions
function filter_expression(){
  
  //cfg.unshift(end);
  //cfg.unshift(start);
  for(var i=0; i<cfg.length; i++){
    if(cfg[i] instanceof Array){
      cfg[i].unshift("assignment_expression");
      cfg[i].unshift(end);
      cfg[i].unshift(start);
    }
  }

  for(var i=cfg.length-1; i>=0; i--){
    if(cfg[i] instanceof Array && cfg[i].length==6){
      cfg[i].splice(3,0,'tmp'+tmp_count);
      if(cfg[i-1] instanceof Array){
        //cfg[i-1].splice(4,0,'tmp'+tmp_count); //push tmp var to higher sub-array; push to len-1 pos in sub array
        cfg[i-1].push('tmp'+tmp_count); //push tmp var to higher sub-array; push to end of sub array
      }else{
        cfg.splice(i,0,'tmp'+tmp_count); //push tmp var in top level sub-array to main expression
      }
      tmp_count = tmp_count + 1;
      
    }
  }
  
}


function cfg_gen_fcall2(data){
  var depth = 1;
  var start,end;
  var fcall_id=0, fcall_tracker,fcall_depth, fcall_flag=1, fcall_end=0, fcall_arg_tracker, nargs=1;
  var invalid_type = ["identifier","integer","arithmetic_operator","binary_expression","assignment_expression","function_call"];
  var invalid_key = ["start_pos","end_pos","nargs"];
  cfg = [];
  var leaves = traverse(data).reduce(function fcall_cfg(acc,x){
        
    if((this.key=="type"||this.key=="left"||this.key=="right") && this.level==1){
      if(!(x instanceof Object)){
        if(x == "function_call"){
          handle_fcall(data); 
        }else if(x == "assignment_expression"){
          handle_assignment_expression(data);
        }
        //acc.push(x);   //push expression type into leaves
      }
    }

    //this should handle LHS element in assgn expression
/*    if(this.isLeaf && ((this.level==2))){
      if(x!=null && !(invalid_type.indexOf(x) >= 0) && !(invalid_key.indexOf(this.key) >= 0)){
        //acc.push(x);
      }
    }

    if(this.key=="arguments"){
      //console.log("otha");
      if(x!=null){
        fcall_arg_tracker = x.length;
      }else{
        fcall_arg_tracker = 0;
      }
    }
    if(this.key=="nargs"){
      if(x==0) nargs=0;
    }
    //prints all leaf elements at depth > 2
    if(this.isLeaf && (this.level>1)){
      var tmp=[];
      
      if(x=="function_call"){
        fcall_tracker = 1;
        fcall_depth = this.level+2;
                
        acc[acc.length-1].push(tmp);
        acc[acc.length-1][acc[acc.length-1].length-1].push(".()");
      }
      if(x!=null && !(invalid_type.indexOf(x) >= 0) && !(invalid_key.indexOf(this.key) >= 0)){
        if(fcall_tracker && this.level <= fcall_depth){
          if(this.level==fcall_depth){
            //if(acc[acc.length-1].length > 2) 
            //acc[acc.length-1].push(",");
            //acc[acc.length-1].push(x);
            acc[acc.length-1][acc[acc.length-1].length-1].push(",");
            acc[acc.length-1][acc[acc.length-1].length-1].push(x);
            fcall_arg_tracker = fcall_arg_tracker - 1;
            if(fcall_arg_tracker == 0) fcall_tracker = 0;
            //if(acc[acc.length-1].length==2) acc[acc.length-1].splice(1,0,".(");
          }else {
            //acc[acc.length-1].push(x);
            acc[acc.length-1][acc[acc.length-1].length-1].push(x);
            if(nargs==0) fcall_tracker = 0;
            //console.log(acc[acc.length-1].join(''));
          }
        }else{
          fcall_tracker = 0;
          if(this.level>depth){
            depth = this.level;
            acc.splice(depth-1,0,tmp);
            if(x!=null) acc[depth-1].push(x);
          } else if(this.level==depth){
            if(x!=null) acc[depth-1].push(x);
          } else if(this.level<depth){
            depth = this.level;
            if(x!=null) acc[depth-1].push(x);
          }
        }
        console.log(this.level+"  "+x);  //prints depth and element
         
      }

    }
    if(this.key=="start_pos" && this.level==1) start = x;
    if(this.key=="end_pos" && this.level==1) end = x;

    return acc;*/
  },[]);
  //console.log(leaves);

  //leaves.unshift(end);
  //leaves.unshift(start);
  
  //add start and end to each sub-array - for arithmetic expressions and fcall
  /*for(var i=0; i<leaves.length; i++){
    if(leaves[i] instanceof Array){
      leaves[i].unshift(end);
      leaves[i].unshift(start);
    }
  }
 
  //traverse through each element of main array to process sub-arrays  
  for(var i=leaves.length-1; i>=0; i--){
    if(leaves[i] instanceof Array && leaves[i].length==5){
      for(var j=0; j<leaves[i].length; j++){
        if(leaves[i][j] instanceof Array){
          leaves[i][j].unshift('tmp'+tmp_count);
          leaves[i][j].unshift(end);
          leaves[i][j].unshift(start);
          leaves.splice(i+1,0,leaves[i][j]);
          leaves[i].splice(j,1);
          leaves[i].splice(j,0,'tmp'+tmp_count); //push tmp var of fcall to higher array level
          
          tmp_count=tmp_count+1;
        }         
      }
      //leaves[i].splice(2,0,leaves[0]);  // push "assign_expr" to sub-arrays
      leaves[i].splice(2,0,'tmp'+tmp_count);//splice index 3 if prev line is uncommented
      if(leaves[i-1] instanceof Array){
        //leaves[i-1].splice(1,0,'tmp'+tmp_count);
        leaves[i-1].splice(3,0,'tmp'+tmp_count);
      } else {
        leaves.splice(i,0,'tmp'+tmp_count);
      }
      tmp_count=tmp_count+1;
    }

    if(leaves[i] instanceof Array && leaves[i].length==8){
      for(var j=0; j<leaves[i].length; j++){
        if(leaves[i][j] instanceof Array){
          leaves[i][j].unshift('tmp'+tmp_count);
          leaves[i][j].unshift(end);
          leaves[i][j].unshift(start);
          leaves.splice(i+1,0,leaves[i][j]);
          leaves[i].splice(j,1);
          leaves[i].splice(j,0,'tmp'+tmp_count); //push tmp var of fcall to higher array level

          tmp_count=tmp_count+1;
        } 
      }

      //leaves[i].splice(2,0,leaves[2]);      // push "assign_expr" to sub-arrays
      leaves[i].splice(2,0,'tmp'+tmp_count);  //splice index 3 if prev line is uncommented
      if(leaves[i-1] instanceof Array){
        //leaves[i-1].splice(1,0,'tmp'+tmp_count);
        leaves[i-1].splice(3,0,'tmp'+tmp_count);
      }
      tmp_count=tmp_count+1;
      //leaves[i].splice(5,0,leaves[0]);
      //leaves[i].splice(6,0,'tmp'+tmp_count);
      leaves[i].splice(6,0,leaves[i][0]);
      leaves[i].splice(7,0,leaves[i][1]);
      //leaves[i].splice(8,0,leaves[2]);
      leaves[i].splice(8,0,'tmp'+tmp_count);
      if(leaves[i-1] instanceof Array){
        leaves[i-1].splice(4,0,'tmp'+tmp_count);
      }
      tmp_count=tmp_count+1;
    }

    //handles x = foo.(x), y = bar.() kinda statements
    if(leaves[i] instanceof Array && leaves[i].length==4 && leaves[i][3] instanceof Array) {
      //2nd idx is always 3 because [start char, end char, lhs var, rhs fcall array(idx = 3)]
      leaves[i][3].unshift('tmp'+tmp_count);
      leaves[i][3].unshift(end);
      leaves[i][3].unshift(start);
      leaves.splice(i+1,0,leaves[i][3]);
      leaves[i].splice(3,1);
      leaves[i].splice(3,0,'tmp'+tmp_count);

      tmp_count=tmp_count+1;
    }
  }

  for(var j=leaves.length-1; j>=0; j--){
    if(leaves[j] instanceof Array && leaves[j].length==12){
      leaves.splice(j,0,leaves[j].splice(0,6));
    }
  }

  var tmp_j;
  for(var j=0; j<leaves.length; j=j+1){
    tmp_j = -1;  
    if(leaves[j] instanceof Array){
      //console.log(leaves[j]);
      leaves[j].unshift('k'+k_next_count);
      leaves[j].unshift('k'+k_count);
      k_count = k_count+1;
      k_next_count = k_next_count+1;
    }
    if(tmp_j==0) tmp_j=0;
    else tmp_j=1;
  }*/
  
  //console.log(leaves); /*use this to print leaves*/
}

function handle_assignment_expression(data){
  var depth = 1;
  var start,end;
  var fcall_id=0, fcall_tracker,fcall_depth, fcall_flag=1, fcall_end=0, fcall_arg_tracker, nargs=1;
  var invalid_type = ["identifier","integer","arithmetic_operator","binary_expression","assignment_expression","function_call"];
  var invalid_key = ["start_pos","end_pos","nargs"];
  var leaves = traverse(data).reduce(function fcall_cfg(acc,x){

    if((this.key=="type"||this.key=="left"||this.key=="right") && this.level==1){
      if(!(x instanceof Object)){        
        acc.push(x);   //push expression type into leaves
      }
    }

         
    //prints all leaf elements at depth > 2
    if(this.isLeaf && (this.level>1)){
      var tmp=[];

      if(x!=null && !(invalid_type.indexOf(x) >= 0) && !(invalid_key.indexOf(this.key) >= 0)){  
        if(this.level>depth){
          depth = this.level;
          acc.splice(depth-1,0,tmp);
          if(x!=null) acc[depth-1].push(x);
        } else if(this.level==depth){
          if(x!=null) acc[depth-1].push(x);
        } else if(this.level<depth){
          depth = this.level;
          if(x!=null) acc[depth-1].push(x);
        }
        console.log(this.level+"  "+x);  //prints depth and element

      }

    }
    if(this.key=="start_pos" && this.level==1) start = x;
    if(this.key=="end_pos" && this.level==1) end = x;

    return acc;
  },[]);

  console.log(leaves);
}

function handle_fcall(data){
  var depth = 1;
  var start,end;
  var fcall_id=0, fcall_tracker,fcall_depth, fcall_flag=1, fcall_end=0, fcall_arg_tracker, nargs=1;
  var invalid_type = ["identifier","integer","binary_expression","arithmetic_operator","assignment_expression","function_call"];
  var invalid_key = ["start_pos","end_pos","nargs"];
  //var input_data = JSON.stringify(data,null,3);
  var leaves = traverse(data).reduce(function fcall_cfg(acc,x){

    if((this.key=="type"||this.key=="left"||this.key=="right") && this.level==1){
      if(!(x instanceof Object)){
        acc.push(x);   //push expression type into leaves
      }
    }

    //prints all leaf elements at depth > 2
    //if(this.key == "arguments") console.log("OTHA : "+JSON.stringify(x));
    if(this.isLeaf && (this.level>1)){
      var tmp=[];
      if(x!=null && !(invalid_type.indexOf(x) >= 0) && !(invalid_key.indexOf(this.key) >= 0)){
        acc.push(x);
        console.log(this.level+"  "+x);  //prints depth and element
      }

      /*if(x!=null && !(invalid_type.indexOf(x) >= 0) && !(invalid_key.indexOf(this.key) >= 0)){
                
        if(this.level>depth){
          depth = this.level;
          acc.splice(depth-1,0,tmp);
          if(x!=null) acc[depth-1].push(x);
        } else if(this.level==depth){
          if(x!=null) acc[depth-1].push(x);
        } else if(this.level<depth){
          depth = this.level;
          if(x!=null) acc[depth-1].push(x);
        }


        console.log(this.level+"  "+x);  //prints depth and element

      }*/

    }
    if(this.key=="start_pos" && this.level==1) start = x;
    if(this.key=="end_pos" && this.level==1) end = x;

    return acc;

  },[]);

  console.log(leaves);
}
