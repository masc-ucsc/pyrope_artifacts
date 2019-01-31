{
 function buildBinaryExpression(head, tail) {
   return tail.reduce(function(result, element) {
     return {
       type: "binary_expression",
       operator: element[1],
       left: result,
       right: element[3]
     };
   }, head);
 }

 function buildMultiLineBinaryExpression(head, tail) {
   return tail.reduce(function(result, element) {
     return {
       type: "binary_expression",
       operator: element[1],
       left: result,
       right: element[2]
     };
   }, head);
 }

 function extractList(list, index) {
   return list.map(function(element) { return element[index]; });
 }

 function buildList(head, tail, index) {
   return [head].concat(extractList(tail, index));
 }

 function optionalList(value) {
   return value !== null ? value : [];
 }

 function extractOptional(optional, index) {
   return optional ? optional[index] : null;
 }

 function prettyPrint(head,tail){
 	var i,tmp=[]
    if((head!=null)){
    	tail.unshift(head)
    }
    return tail
 }

 function prettyPrintScope(head,tail,end){
 	var i,tmp=[]
    if(!(tail instanceof Array) && head==null){
    	tmp.push(tail)
        return tmp
    }
    if(head==null){
    	return head
    }

    if(!(tail instanceof Array) && tail!=null){
    	head.push(tail)
    }

    if(end){
    	for(i=0;i<end.length;i++){
        	head.push(end[i])
    	}
    }
   	return head
 }

 function prettyPrintArray(head,tail){
 	var tmp
    tmp = tail.reduce(function flat(a,b) {
        if(Array.isArray(b)){
        	return b.reduce(flat,a)
        }
        if(b instanceof Object){
        	b = b.value
        }
     	a.push(b)
        return a
   	},[]);
    tmp.unshift(head.value)
    return tmp.join('')
 }

}


start
  	= head:(code_blocks? __) {
    	var i,j,tmp=[]
        if(head[0]==null){
        	head.splice(0,1)
            return head[0]
        }

    	for(i=0;i<head[1].length;i++){
        	head[0].push(head[1][i])
    	}
        return head[0]
    }

code_blocks
  = head:code_block_int tail:(y:EOS x:code_block_int{return prettyPrint(y,x)})* {
   	tail.unshift(head)
    var i,j,tmp=[]
    for(i=0;i<tail.length;i++){
    	for(j=0;j<tail[i].length;j++){
       		tmp.push(tail[i][j])
        }
    }
    return tmp
  	//return tail
  }

code_block_int
        = x:__ head:(if_statement/for_statement/while_statement/try_statement/punch_format/assignment_expression/function_pipe/fcall_implicit/fcall_explicit
        /return_statement/compile_check_statement/negation_statement/tail:assertion_statement {return tail})   {
        	x.push(head)
            return x
        	//return head
        }

try_statement
	= TRY cond:logical_expression sc:((_ x:"::" LBRACE (EOS/__))/_ LBRACE x:(EOS/__) {return x})
   	body:(x:code_blocks? y:(EOS/__) z:__ {return prettyPrintScope(x,y,z)}) RBRACE ELSE:(__ x:scope_else{return x})?
    {
    	if((sc instanceof Array) && sc.length==0)sc=null
    	if(body!=null){
        	if(sc && sc.length!=4){
        		body.unshift(sc)
            	sc=null
        	} else if(sc && sc.length==4){
        		//body.unshift(sc[3])
            	sc=sc[1]
        	}
       	}else if(body==null) {
        	if(sc && sc.length!=4){
            	body=[sc]
                sc=null
        	} else if(sc && sc.length==4){
            	body = null //[sc[3]]
                sc = sc[1]
        	}
        }

 		return {
        	start_pos:location().start.offset,
        	end_pos:location().end.offset,
     		  type:"try",
          try_condition:cond,
          try_scope:sc,
          try_body:body,
          try_else:ELSE
    	}
    }

scope_declaration
	= args:scope LBRACE sc:((EOS/__) __) body:(x:scope_body? y:(EOS/__) z:__ {return prettyPrintScope(x,y,z)})
   	RBRACE alt:(__ x:scope_else{return x})?
    {
    	var i,j
        for(i=0;i<sc[1].length;i++){
         	sc.push(sc[1][i])
       	}
       	sc.splice(1,1)
        if(sc[0]==null || (sc[0] instanceof Array)){
        	sc.splice(0,1)
        }
        //return body
        if(body==null){
        	body=[]
        }
        j=sc.length-1
        while(sc.length>0 && j>=0){
        	body.unshift(sc[j])
            j = j-1
        }
        if((body instanceof Array) && body.length==0) body=null

  		return {
     		type:"func_decl",
       		scope_args:args,
       		scope_body:body,
       		scope_alt_body:alt
        }
   	}

scope_else
  	= ELSE _ LBRACE sc:((EOS/__) __) else_true:(x:scope_body? y:(EOS/__) z:__ {return prettyPrintScope(x,y,z)}) RBRACE
  	{
    	var i,j
        for(i=0;i<sc[1].length;i++){
         	sc.push(sc[1][i])
       	}
       	sc.splice(1,1)
        if(sc[0]==null || (sc[0] instanceof Array)){
        	sc.splice(0,1)
        }
		//return sc
        if(else_true==null){
        	else_true=[]
        }
        j=sc.length-1
        while(sc.length>0 && j>=0){
        	else_true.unshift(sc[j])
            j = j-1
        }
        if((else_true instanceof Array) && else_true.length==0)else_true=null
   		return else_true;
   	}

scope_body
	= head:code_blocks tail:(EOS x:logical_expression __ {return x})? {
    	if(tail){
          head.push(tail)
        }
        return head
    }
    / head:logical_expression __ {return head}

scope
        = COLON args:scope_condition? COLON {
        return args
   }

scope_condition
        =  head:scope_argument tail:(WHEN x:(logical_expression) {return x} )? {
     return {
       scope_arg_list:head,
       when:tail
     }
   }
   / head:(x:scope_argument {return x})? WHEN tail:(logical_expression)  {
     return {
       arg_list:head,
       when:tail
     }
   }

scope_argument
        = LPAR head:identifier tail:(_ identifier)* RPAR {
        var char = buildList(head, tail, 1);
       return char
   }
   / LPAR head:identifier tail:(COMMA identifier)* RPAR {
        var char = buildList(head, tail, 1);
       return char
   }

if_statement
        = if_type:(UNIQUE_IF/IF) if_test:logical_expression sc:((_ x:"::" LBRACE y:(EOS/__) )/_ LBRACE x:(EOS/__) {return x})
        if_true:(x:code_blocks? y:(EOS/__) z:__ {return prettyPrintScope(x,y,z)}) RBRACE ELSE:(__ x:else_statement{return x})?
   	{
    	//return sc
        var type_of_if = "if";
        if((sc instanceof Array) && sc.length==0)sc=null
        if(if_true!=null){
        	if(sc && sc.length!=4){
        		if_true.unshift(sc)
            	sc=null
        	}else if(sc && sc.length==4){
        		//if_true.unshift(sc[3])
            	sc=sc[1]
        	}
        } else if(if_true==null) {
        	if(sc && sc.length!=4){
            	if_true=[sc]
                sc=null
        	} else if(sc && sc.length==4){
            	if_true=[sc[3]]
                sc=sc[1]
        	}
        }
        if(if_type[0] == "unique if"){
        	type_of_if = "uif";
            return {
       			start_pos:location().start.offset,
        		end_pos:location().end.offset,
            	type:type_of_if,
            	uif_condition:if_test,
       			scope:sc,
       			true_case:if_true,
       			false_case:ELSE
     		}
        }
        //return sc
		return {
       		start_pos:location().start.offset,
        	end_pos:location().end.offset,
            type:type_of_if,
            condition:if_test,
       		scope:sc,
       		true_case:if_true,
       		false_case:ELSE
     	}
   	}

else_statement
        = ELIF else_test:logical_expression sc:((_ x:"::" LBRACE (EOS/__))/_ LBRACE x:(EOS/__) {return x})
        else_true:(x:code_blocks? y:(EOS/__) z:__ {return prettyPrintScope(x,y,z)}) RBRACE else_false:(__ x:else_statement{return x})?
  	{
    	if((sc instanceof Array) && sc.length==0)sc=null
   		if(else_true!=null){
        	if(sc && sc.length!=4){
        		else_true.unshift(sc)
            	sc=null
        	} else if(sc && sc.length==4){
        		//else_true.unshift(sc[3])
            	sc=sc[1]
        	}
        } else if(else_true==null) {
        	if(sc && sc.length!=4){
            	else_true=[sc]
                sc=null
        	} else if(sc && sc.length==4){
            	else_true=[sc[3]]
                sc=sc[1]
        	}
        }
     	return {
        	start_pos:location().start.offset,
        	end_pos:location().end.offset,
       		type:"if",
            condition:else_test,
       		scope:sc,
       		true_case:else_true,
       		false_case:else_false
     	};
   	}
   / ELSE  sc:((_ x:"::" LBRACE (EOS/__))/_ LBRACE x:(EOS/__) {return x})
   else_true:(x:code_blocks? y:(EOS/__) z:__ {return prettyPrintScope(x,y,z)}) RBRACE    //else
  	{
    	if((sc instanceof Array))sc=null
   		if(else_true!=null){
        	if(sc && sc.length!=4){
        		else_true.unshift(sc)
            	sc=null
        	} else if(sc && sc.length==4){
        		else_true.unshift(sc[3])
            	sc=sc[1]
        	}
        } else if(else_true==null) {
        	if(sc && sc.length!=4){
            	else_true=[sc]
                sc=null
        	} else if(sc && sc.length==4){
            	else_true=[sc[3]]
                sc=sc[1]
        	}
        }

     	return else_true;
   	}

for_statement
  	= FOR idx:for_index sc:((_ x:"::" LBRACE (EOS/__))/_ LBRACE x:(EOS/__) {return x})
    body:(x:code_blocks? y:(EOS/__) z:__ {return prettyPrintScope(x,y,z)}) RBRACE
    {
    	if((sc instanceof Array) && sc.length == 0)sc=null
    	if(body!=null){
        	if(sc && sc.length!=4){
        		body.unshift(sc)
            	sc=null
        	} else if(sc && sc.length==4){
        		//body.unshift(sc[3])
            	sc=sc[1]
        	}
        } else if(body==null) {
        	if(sc && sc.length!=4){
            	body=[sc]
                sc=null
        	} else if(sc && sc.length==4){
            	body = null //[sc[3]]
                sc = sc[1]
        	}
        }
    	return {
        	start_pos:location().start.offset,
        	end_pos:location().end.offset,
        	type:"for",
            for_index:idx,
           	scope:sc,
           	for_body:body
       	}
   	}

for_index
        = head:rhs_expression_property tail:(_ rhs_expression_property)* {
        //return head
       var char = buildList(head, tail, 1);
       return char
   }
   / head:rhs_expression_property tail:(COMMA rhs_expression_property)* {
        //return head
       var char = buildList(head, tail, 1);
       return char
   }

while_statement
   = p:WHILE cond:logical_expression sc:((_ x:"::" LBRACE (EOS/__))/_ LBRACE x:(EOS/__) {return x})
   	body:(x:code_blocks? y:(EOS/__) z:__ {return prettyPrintScope(x,y,z)}) RBRACE
    {
    	//return
    	if((sc instanceof Array) && sc.length==0)sc=null
    	if(body!=null){
        	if(sc && sc.length!=4){
        		body.unshift(sc)
            	sc=null
        	} else if(sc && sc.length==4){
        		//body.unshift(sc[3])
            	sc=sc[1]
        	}
       	}else if(body==null) {
        	if(sc && sc.length!=4){
            	body=[sc]
                sc=null
        	} else if(sc && sc.length==4){
            	body = null //[sc[3]]
                sc = sc[1]
        	}
        }

 		return {
        	start_pos:location().start.offset,
        	end_pos:location().end.offset,
     		type:"while",
            while_condition:cond,
            scope:sc,
           	while_body:body
    	}
   	}

return_statement
	= RETURN head:logical_expression {
    	return{
        	start_pos:location().start.offset,
        	end_pos:location().end.offset,
       		type:"return",
            r_arg:head
     	}
    }

assertion_statement
  	= ASSERTION head:logical_expression {
 		return {
        	start_pos:location().start.offset,
        	end_pos:location().end.offset,
   			type:"assertion",
       		i_condition:head
  		}
	}

negation_statement
   	= NEGATION head:logical_expression {
    	return {
        	start_pos:location().start.offset,
        	end_pos:location().end.offset,
       		type:"negation",
            n_condition:head
     	}
   	}

compile_check_statement
   	= COMPILE_CHECK _ head:code_block_int {
     	return {
        	start_pos:location().start.offset,
        	end_pos:location().end.offset,
       		type:"compile_check",
            compile_body:head
     	}
   	}

assignment_expression
        =  !constant head:(overload_notation/lhs_expression) __ op:assignment_operator __
   tail:(function_pipe/fcall_implicit/rhs_expression_property/logical_expression) /*prop:(_ x:rhs_expression_property{return x})* */  {
    return {
    	start_pos:location().start.offset,
       	end_pos:location().end.offset,
        type:"assignment_expression",
        operator:op,
        left:head,
        right:tail
   	}
  }

fcall_implicit
        = !constant func:tuple_dot_notation _ head:scope_declaration { //remove "!not_in_implicit" to support foo::{}
        var arg = [];
        arg.push(head);
        return {
        	start_pos:location().start.offset,
        	end_pos:location().end.offset,
         	type:"function_call",
         	function:func,
         	arguments:arg
       }
     }
     / !constant func:tuple_dot_notation !not_in_implicit head:(white_space+ x:(rhs_expression_property/range_notation/bit_selection_notation){return x})?
   tail:(white_space+ (rhs_expression_property/range_notation/bit_selection_notation))*{
        var char = buildList(head, tail, 1);
        return {
        	start_pos:location().start.offset,
        	end_pos:location().end.offset,
         	type:"function_call",
         	function:func,
         	arguments:char
       }
     }

not_in_implicit
 = (_ assignment_operator)
   / (_ ".(")
   / (":")
   / ".."
   / "["
   / "[["
   / __ PLUS
   / __ MINUS
   / __ overload_notation
   / __ STAR
   / __ DIV
   / __ T_PLUS
   / __ T_STAR
   / __ OR
   / __ AND
   / __ EQUEQU
   / __ ISEQU
   / __ BANGEQU
   / __ LE
   / __ GE
   / __ LT
   / __ GT
   / __ UNION
   / __ INTERSECT
   / __ IN
   / __ HAT
   / __ PIPE
   / __ AMPERSAND

fcall_implicit_no_arg
        = !constant func:tuple_dot_notation _ {
       	return {
         	type:"function_call",
         	function:func,
         	arguments:null,
         	body:null
    	}
   	}

fcall_explicit
        = !constant func:tuple_dot_notation DOT arg:fcall_arg_notation scope:scope_declaration? chain:(DOT x:(fcall_explicit/tuple_dot_notation){return x})* {
        if(arg == null && scope){
        	arg = [];
        }
        if(scope) arg.push(scope)

        var fcall_return = {
        	start_pos:location().start.offset,
        	end_pos:location().end.offset,
        	type:"function_call",
           	function:func,
           	arguments:arg
       	};
        if(chain.length > 0){
        	return chain.reduce(function(result, element) {
     			return {
        			type: "tuple_dot",
         			dot_obj: result,
         			dot_prop: element,
       			};
 			}, fcall_return);

        }

        return fcall_return
   }

fcall_arg_notation
        = LPAR head:(rhs_expression_property/lhs_var_name) tail:(_ (rhs_expression_property/lhs_var_name))* RPAR {
        var char = buildList(head, tail, 1);
       return char
   }
   / LPAR head:(rhs_expression_property/logical_expression) tail:(COMMA (rhs_expression_property/logical_expression))* RPAR {
        var char = buildList(head, tail, 1);
       return char
   }
   / LPAR RPAR {return null}

function_pipe
	= head:(fcall_implicit/logical_expression) _ tail:(FUNC_PIPE x:(fcall_implicit/fcall_explicit) _{return{f:x}})+ {
        return tail.reduce(function(result,element){
        	return{
            	start_pos:location().start.offset,
        		end_pos:location().end.offset,
            	type:"func_pipe",
                pipe_arg:result,
                pipe_func:element.f
            }
        },head);
    }

punch_format
	= PUNCH ip:identifier white_space+ sym:("@"/"%") op:punch_rhs {
    	op.unshift(sym);
    	return{
        	start_pos:location().start.offset,
        	end_pos:location().end.offset,
            type:"punch",
            punch_inp:ip,
            punch_op:op
        }
    }

punch_rhs
	= first:"/" x:(a:identifier b:(DOT identifier)*)? "/" y:(DOT identifier)+ {
    	var arr = [], arr2 = [], foo = [];
        if(x != null){
    		var tmp1 = buildList(x[0],x[1],1);
        	for(var i = 0; i < tmp1.length; i++){
        		arr.push(tmp1[i]["value"]);
        	}
        }
        for(var j = 0; j < y.length; j++){
        	arr2.push(y[j][1]["value"]);
        }
        arr2 = arr2.join(".");
        arr = arr.join(".");
        foo.push(arr);
        foo.push(arr2);
        return foo
    }
    / first:"/" x:(a:identifier b:(DOT identifier)*)? "/" y:(DOT identifier)* {
    	var arr = [], arr2 = [], foo = [];
        if(x != null){
    		var tmp1 = buildList(x[0],x[1],1);
        	for(var i = 0; i < tmp1.length; i++){
        		arr.push(tmp1[i]["value"]);
        	}
        }
        for(var j = 0; j < y.length; j++){
        	arr2.push(y[j][1]["value"]);
        }
        arr2 = arr2.join(".");
        arr = arr.join(".");
        foo.push(arr);
        foo.push(arr2);
        return foo
    }

logical_expression
        =  head:relational_expression tail:(__ (OR/AND) _ relational_expression)* {
     return buildBinaryExpression(head, tail);
   }

relational_expression
        =  head:additive_expression tail:(__ (EQUEQU/ ISEQU/ BANGEQU/ LE/ GE/ LT/ GT) _ additive_expression)* {
     return buildBinaryExpression(head, tail);
   }

additive_expression //IN rule has conflicts with id beginning with "in". (eg) foo = inc # throws error
	= head:bitwise_expression tail:(__ (T_PLUS/PLUS/MINUS/LEFT/RIGHT/T_STAR/UNION/INTERSECT/ /*IN*/ overload_notation) _ bitwise_expression)*
    tail2:(x:".." y:additive_expression?)?
    {
    	if(tail2){
        	var tmp = buildBinaryExpression(head, tail);
            if(tail2[1] == null){
            	tail2 = null;
            }else{
            	tail2 = tail2[1];
            }
        	return {
       			type:"range",
       			u_bound:tmp,
       			l_bound:tail2
     		}
        }
   		return buildBinaryExpression(head, tail);
  	}

bitwise_expression
	= head:multiplicative_expression
    tail:(__ (HAT/AMPERSAND/PIPE) _ multiplicative_expression)* {
        return buildBinaryExpression(head, tail);
   	}

multiplicative_expression
	= head:unary_expression tail:(__ (STAR/DIV) _ unary_expression)* {
        return buildBinaryExpression(head, tail);
   	}

unary_expression
	= factor
    / op:NOT arg:factor {
    	return{
        	type:"not_op",
            not_arg:arg
        }
    }

factor
	= LPAR __ head:logical_expression __ RPAR xhead:bit_selection_bracket? {
  		if(xhead){ //rule and ast for '(' expr ')'[[ ]] - bit sel statements
       		return xhead.reduce(function(result, element) {
       			return {
         			type: "bit_select",
         			bit_obj: result,
         			bit_sel: element.bit_property,
       			};
     		}, head);
        }
        return head;
  	}
   // unary_expression
   / rhs_expression

tuple_by_notation
        = BY head:lhs_var_name {return head}

tuple_notation_no_bracket
   = head:bit_selection_notation tail:(_ bit_selection_notation)* {
       	var char = buildList(head, tail, 1);
        return {
        	type:"tuple_list",
        	elements:char,
        }
   }

tuple_notation
	= LPAR head:bit_selection_notation tail:(_ bit_selection_notation)* RPAR by:(tuple_by_notation/bit_selection_bracket)?
    {
    	var char = buildList(head, tail, 1);
       	if(by instanceof Array){ //rule and ast for '(' expr ')'[[ ]] - bit sel statements
            var by_tuple = {
        		type:"tuple_list",
        		elements:char,
       		}
    		return by.reduce(function(result, element) {
       			return {
         			type: "bit_select",
         			bit_obj: result,
         			bit_sel: element.bit_property,
       			};
     		}, by_tuple);
 		}else{
        	return{
            	type:"tuple_list",
        		elements:char,
                skip_by:by
            }
        }

       	var char = buildList(head, tail, 1);
       	return {
        	type:"tuple_list",
        	elements:char
       	}

	}

   / LPAR head:(rhs_expression_property/logical_expression) _
   tail:(COMMA (rhs_expression_property/logical_expression) __)* RPAR by:(tuple_by_notation/bit_selection_bracket)?
   	{
    	var char = buildList(head, tail, 1);
       	if(by instanceof Array){ //rule and ast for '(' expr ')'[[ ]] - bit sel statements
            var by_tuple = {
        		type:"tuple_list",
        		elements:char,
       		}
    		return by.reduce(function(result, element) {
       			return {
         			type: "bit_select",
         			bit_obj: result,
         			bit_sel: element.bit_property,
       			};
     		}, by_tuple);
 		}else{
        	return{
            	type:"tuple_list",
        		elements:char,
                skip_by:by
            }
        }

       	var char = buildList(head, tail, 1);
       	return {
        	type:"tuple_list",
        	elements:char
       	}
  	}

   / LPAR RPAR {
     return {
       type:"tuple_list",
       elements:null
     }
   }
   / bit_selection_notation
   //range_notation

tuple_notation_with_object
	= LPAR head:bit_selection_notation tail:(_ bit_selection_notation)* RPAR
    {
    	var char = buildList(head, tail, 1);
       	return {
        	type:"tuple_list",
        	elements:char
       	}

	}

   / LPAR head:(rhs_expression_property/logical_expression) _
   tail:(COMMA (rhs_expression_property/logical_expression) __)* RPAR
   	{
    	var char = buildList(head, tail, 1);
       	return {
        	type:"tuple_list",
        	elements:char
       	}
  	}

range_notation
        = head:(bit_selection_notation)? ".." tail:(additive_expression)? by:tuple_by_notation? {
		if(by){
        	return {
       			type:"range",
       			u_bound:head,
       			l_bound:tail,
                skip:by
     		}
        }
     	return {
       		type:"range",
       		u_bound:head,
       		l_bound:tail
     	}
   }

bit_selection_bracket
	= tail:(LBRK LBRK property:(logical_expression/tuple_notation_no_bracket)? RBRK RBRK {return {bit_property:property}})*

bit_selection_notation
	= head:(tuple_dot_notation) tail:bit_selection_bracket {
     return tail.reduce(function(result, element) {
       return {
         type: "bit_select",
         bit_obj: result,
         bit_sel: element.bit_property,
       };
     }, head);
   }

tuple_dot_dot
	= tail:(DOT property:(tuple_array_notation) {return {dot_property:property}})*

tuple_dot_notation
	= head:(tuple_array_notation) tail:tuple_dot_dot {
 		return tail.reduce(function(result, element) {
     		return {
        		type: "tuple_dot",
         		dot_obj: result,
         		dot_prop: element.dot_property,
       		};
 		}, head);
	}

tuple_array_bracket
	=  tail:(LBRK property:(logical_expression/tuple_notation_no_bracket) RBRK {return {arr_property:property}})*

tuple_array_notation
	=  head:(lhs_var_name) tail:tuple_array_bracket {
   		return tail.reduce(function(result, element) {
       		return {
         		type: "tuple_array",
         		arr_obj: result,
         		arr_idx: element.arr_property,
       		};
     	}, head);
   	}

lhs_expression
        = x:"\\"? y:(range_notation/tuple_notation) {
        	function slash(y, type){
            	if(y[type]['type'] == "tuple_dot"){
                	return slash(y['dot_obj'], 'dot_obj');
                }if(y[type]['type'] == "tuple_array"){
                	return slash(y['arr_obj'], 'arr_obj');
                }

                var arr = [];
                arr.push('\\');
                arr.push(y[type]['value']);
                y[type]['value'] = arr.join('');
            }
        	if(x){
            	var arr = [];
                arr.push('\\');
                if(y['type'] == "identifier"){
                	arr.push(y['value']);
                    y['value'] = arr.join('');
                }else if(y['type'] == "tuple_dot"){
                	slash(y, "dot_obj");
                }else if(y['type'] == "tuple_array"){
                	slash(y, "arr_obj");
                }
                //y['value'] = arr.join('');
            	return y
            }else{
            	return y
            }
        }

lhs_var_name
        = head:(identifier/constant) {return head}

rhs_expression_property
        = arg:identifier COLON head:(fcall_explicit/tuple_notation)?
   	{
    	if(head) {
        	return {
            	type:":",
            	property:arg,
              	var:head
          	}
        }
       	return {
        	type:":",
         	property:arg,
         	var:null
       	}
   	}
   /* arg:(x:identifier COLON {return x}) head:(fcall_explicit/tuple_dot_notation)? {
     return {
       property:arg,
       var:head
     }
   }*/

rhs_expression
        = head:(fcall_explicit/lhs_expression/scope_declaration) {return head}

constant
        = string_constant
   / numerical_constant

overload_notation
        = DOT DOT head:overload_name DOT DOT {
     var i, char=[]
     char.push("..");
     char.push(head);
     char.push("..");
     return {
       type:"overload",
       value:char.join('')
       //value:head
     }
   }

overload_name
        = (!(overload_exception/line_terminator) .)+ {return text();}

overload_exception
        = line_terminator/white_space/"."/"#"/";"/","/"="/"("/")"/"["/"]"/"{"/"}"/"/"/"?"/"!"/"|"/"'"/'"'

identifier
        = !keyword bang:id_prefix? first:id_non_digit chars:id_char* postfix:id_postfix?
   {
     if(bang) {
     	//return bang+first+chars.join('')
       	return {
         	type:"identifier",
         	//prefix:bang,
         	value:bang+first+chars.join('')
       	}
     }
     if(postfix){
     	var tmp = []
     	tmp.push(first+chars.join(''))
        tmp.push(postfix)
     	return{
        	type:"identifier",
            value:tmp.join('')
        }
     }
     //return first+chars.join('')
     return {
       type:"identifier",
       value:first+chars.join('')
     }
   }

id_non_digit
   = [a-z]
   / [A-Z]
   / [_]
   / [%]
   / [$]
   // [@]
   // [!]

id_char
   = [a-z]
   / [A-Z]
   / [0-9]
   / [_]

id_prefix
        = BANG
   / LOCAL_REGISTER
   / AMPERSAND

id_postfix = "?"

string_constant
        = '"' char:double_string* '"'  {
     //char = concatenate(char);
     return {type:"string", value:char.join('')}
   }
   / "'" char:single_string* "'"  {
     //char = concatenate(char);
     return {type:"string", value:char.join('')}
   }

double_string
        = !('"'/line_terminator) . {return text();}

single_string
        = !("'"/line_terminator) . {return text();}

numerical_constant
        = head:(boolean
   / hexa_decimal
   / binary
   / decimal_signed
   / decimal_digit) {return head;}

hexa_decimal
        = head:("0x") tail:(hex_digit)+ end:(("s"/"u") (["?"0-9_]+ ("bits"/"bit"))?)? {
     var i, char=[], char1=[];
     if (end){
        if (end[1]) {
        	var tmp =[];
            tmp.push(head+tail.join(''));
            tmp.push(end[0]);
            tmp.push(end[1][0].join(''));
        	return {
        		type:"number",
                value:tmp.join(''),
        	}
       }
       var tmp = [];
       tmp.push(head+tail.join(''));
       tmp.push(end[0]);
       return {
       		type:"number",
         	value:tmp.join(''),
       }
  	}

  	return {
     	type:"number",
       	value:head+tail.join('')
   	}

}

binary
	= head:("0b") tail:binary_digit+ end:(("s"/"u") (["?"0-9_]+ ("bits"/"bit"))?)? {
   	if (end) {
        if (end[1]) {
        	var tmp =[];
            tmp.push(head+tail.join(''));
            tmp.push(end[0]);
            tmp.push(end[1][0].join(''));
        	return {
                type:"number",
                value:tmp.join(''),
        	}
       	}
        var tmp = [];
       	tmp.push(head+tail.join(''));
       	tmp.push(end[0]);
        return {
        	type:"number",
        	value:tmp.join(''),
        }
     }
     return {
      	type:"number",
     	value:head+tail.join('')
     }
}

boolean "true or false"
        = head:("true"
   / "TRUE"
   / "false"
   / "FALSE")
     {
       return {
         type:"number",
         value:head
       }
     }

decimal_signed
        = head:decimal_digit tail:(("s"/"u") ([0-9_]+ ("bits"/"bit"))?) {
    if (tail) {
    	if (tail[1]) {
        	var tmp =[];
        	tmp.push(head.value);
        	tmp.push(tail[0]);
            tmp.push(tail[1][0].join(''));
        	return {
              	type:"number",
                value:tmp.join(''),
          	}
     	}
        var tmp =[];
        tmp.push(head.value);
        tmp.push(tail[0]);
        return {
        	type:"number",
        	value:tmp.join(''),
        }
  	}
}

decimal_digit "integer greater than or equal to zero"
	= head:("-")? tail:[0-9] tail2:[0-9_]* {
  		var tmp = "0d"
   		if(head) {
       		return {
        		type:"number",
         		value:head+tmp+tail+tail2.join(''),
       		}
   		}

   		return {
     		type:"number",
       		value:tmp+tail+tail2.join(''),
   		}
	}
	/ head:"?" {
    	var tmp = ["0d"];
        tmp.push(head);
        return {
     		type:"number",
       		value:tmp.join(''),
   		}
    }

non_zero_digit "integer greater than zero"
        = head:["?"1-9_]+ {return head.join('')}

binary_digit "binary digits"
        = head:["?"0-1_]+  {return head.join('')}

hex_digit "hexadecimal characters"
        = head:["?"A-Fa-f0-9_]+ {return head.join('')}

keyword "keywords"
        = (n:"if"
   / n:"else"
   / n:"elif"
   / n:"as"
   / n:"is"
   / n:"and"
   / n:"or"
   / n:"intersect"
   / n:"union"
   / n:"until"
   / n:"default"
   / n:"try"
   / n:"punch"
   // n:"C"
   / n:"I"
   / n:"N"
   / n:"in"
   / n:"for"
   / n:"while"
   / n:"end"
   / n:"by"
   / n:"return"
   / n:"false"
   / n:"FALSE"
   / n:"TRUE"
   / n:"true"
   / n:"unique"
   / n:"when") !id_char

assignment_operator
  	= EQU
   / AS
   / T_PLUSEQU
   / STAREQU
   / PLUSEQU
   / MINUSEQU
   / LEFTEQU
   / RIGHTEQU

__
 	= x:(white_space
    / line_terminator_sequence
    // SEMI_COLON
    / comment)* {
    	var i, tmp=[]
        for(i=0;i<x.length;i++){
        	if(x[i].type=="comment"){
            	tmp.push(x[i])
            }
        }
        return tmp
    }

_
 	= (white_space
   / multi_line_comment_no_line_terminator)*

white_space
	= "\t"
 	/ "\v"
 	/ "\f"
 	/ " "
 	/ "\u00A0"
 	/ "\uFEFF"

EOS
	= head:(__ SEMI_COLON+ {return }
   	/ _ x:single_line_comment? line_terminator_sequence {return x}
   	/ __ EOF)

EOF
        = !.

line_terminator
        = [\n\r\u2028\u2029]

line_terminator_sequence //end of line
        = "\n"
 / "\r\n"
 / "\r"
 / "\u2028"
 / "\u2029"

multi_line_comment_no_line_terminator
        = "/*" (!("*/"/ line_terminator) .)* "*/"

comment "comment"
        = head:multi_line_comment            //multi-line comment
   / head:single_line_comment

single_line_comment
        = "//" (!line_terminator .)* {//return "comment"
   		return {
        	type:"comment",
            start_pos:location().start.offset,
        	end_pos:location().end.offset,
            comment:text()
        }
   }

multi_line_comment
        = "/*" (!"*/" .)* "*/" {//return "comment"
   		return {
        	type:"comment",
            start_pos:location().start.offset,
        	end_pos:location().end.offset,
            comment:text()
        }
   }

SEMI_COLON = ";" white_space*
LOCAL_REGISTER = x:"@"  {return x}
AMPERSAND       = x:"&" {return x}
FUNC_PIPE       = "|>" white_space*
BANG       =  x:"!"  ![=]   {return x}
LBRK       =  "["         white_space*
RBRK       =  white_space* x:"]"
LPAR       =  "("                 white_space*
RPAR       =  white_space* ")" _
LBRACE       =  "{"               white_space*
RBRACE       =  white_space* "}"
RANGE_DOT  = x:".."      {return x;}
STAR       =  x:"*"       {return {type:"arithmetic_operator",value:x};}
PLUS       =  x:"+"      {return {type:"arithmetic_operator",value:x};}
MINUS      =  x:"-"    {return {type:"arithmetic_operator",value:x};}
TILDA      =  "~"
DIV        =  x:"/"  ![=]   {return {type:"arithmetic_operator",value:x};}
LEFT       =  x:"<<"     {return {type:"shift_operator",value:x};}
RIGHT      =  x:">>"     {return {type:"shift_operator",value:x};}
T_PLUS     =  x:"++"                {return {type:"tuple_operator",value:x};}
T_STAR     =  x:"**"                {return {type:"tuple_operator",value:x};}
UNION      = x:"union"          {return {type:"tuple_operator",value:x};}
INTERSECT      = x:"intersect"         {return {type:"tuple_operator",value:x};}
NOT			= x:"!"     {return {type:"not_operator",value:x};}
LT         =  x:("<"/":<")  ![=]   {return {type:"relational_operator",value:x};}
GT         =  x:(">"/":>")  ![=]    {return {type:"relational_operator",value:x};}
LE         =  x:("<="/":<=")         {return {type:"relational_operator",value:x};}
GE         =  x:(">="/":>=")         {return {type:"relational_operator",value:x};}
EQUEQU     =  x:("=="/":==")         {return {type:"relational_operator",value:x};}
ASSIGN_RIGHT    = x:"->"      {return x}
ISEQU      =  x:"is"               white_space* {return {type:"relational_operator",value:x};}
BANGEQU    =  x:("!="/":!=")       white_space*    {return {type:"relational_operator",value:x};}
EQU        =  x:("="/":=")  !"="   white_space*  {return x;}
AS                 = x:"as"                     white_space* {return x;}
HAT        =  x:"^"  ![=]        {return {type:"bitwise_operator",value:x};}
OR         =  x:("or")           {return {type:"logical_operator",value:x};}
AND        =  x:("and")          {return {type:"logical_operator",value:x};}
IN         = x:"in"            {return {type:"in_operator",value:x};}
T_PLUSEQU  =  head:T_PLUS tail:EQU  {return head}
STAREQU    =  x:STAR EQU         {return x}
DIVEQU     =  "/="        white_space*
MODEQU     =  "%="        white_space*
PLUSEQU    =  x:PLUS EQU         {return x}
MINUSEQU   =  x:MINUS EQU      {return x}
LEFTEQU    =  x:LEFT EQU        {return x}
RIGHTEQU    =  x:RIGHT EQU       {return x}
COMMA      =  _ ","    __
COLON      =  ":"
DOUBLE_COLON       =  "::"                white_space*
DOT        =  x:"."          //{return x;}
BY         = "by" white_space*
IF         = "if"         white_space+
UNIQUE_IF  = "unique if" white_space+
ELIF         = "elif"         white_space+
ELSE         = "else"         white_space*
FOR         = "for"         white_space+
WHILE           = "while"               white_space+
TRY         = "try"      white_space+
WHEN         = "when"         white_space+
//COMPILE_CHECK    = "C"         white_space+
COMPILE_CHECK    = "#"         white_space+
ASSERTION        = "I"         white_space+
NEGATION         = "N"         white_space+
END                             = "end"         white_space*
RETURN                             = "return" _
SLASH                   = "/" white_space*
PIPE                    = "|"
PUNCH 			= "punch" white_space+
